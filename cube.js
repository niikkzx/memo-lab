import {FACES,FACE_ORDER,PIECES,add,mul,letterOf} from './model.js?v=20261016-training1';
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
function labelInk(color,center){const rgb=color.match(/[a-f0-9]{2}/gi)?.map(x=>parseInt(x,16)/255)||[1,1,1];const light=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];return light<.32?(center?'rgba(255,255,255,.82)':'#ffffff'):(center?'rgba(7,15,28,.68)':'#07101e');}
function path(ctx,ps,r=0.12){
 // Projected vertices carry [x, y, depth]. Canvas paths must receive only x/y;
 // spreading a full vertex shifts the quadratic curve's endpoint into depth.
 ctx.beginPath();
 for(let i=0;i<ps.length;i++){
  const p=ps[i],prev=ps[(i+ps.length-1)%ps.length],next=ps[(i+1)%ps.length];
  const ax=p[0]+(prev[0]-p[0])*r,ay=p[1]+(prev[1]-p[1])*r;
  const bx=p[0]+(next[0]-p[0])*r,by=p[1]+(next[1]-p[1])*r;
  if(i===0)ctx.moveTo(ax,ay);else ctx.lineTo(ax,ay);
  ctx.quadraticCurveTo(p[0],p[1],bx,by);
 }
 ctx.closePath();
}
function inside(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
export class CubeView{
 constructor(canvas,options={}){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.options=options;this.yaw=-0.58;this.pitch=0.43;this.zoom=1;this.polygons=[];this.interactive=options.interactive!==false;this.down=null;
 this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);canvas.addEventListener('pointerdown',e=>this.pointerDown(e));canvas.addEventListener('pointermove',e=>this.pointerMove(e));canvas.addEventListener('pointerup',e=>this.pointerUp(e));canvas.addEventListener('pointercancel',()=>this.down=null);canvas.addEventListener('keydown',e=>{if(!this.interactive)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();this.rotate(e.key==='ArrowLeft'?-.2:e.key==='ArrowRight'?.2:0,e.key==='ArrowUp'?.2:e.key==='ArrowDown'?-.2:0);}});if(options.target)this.focus(options.target);else this.draw();
 }
 destroy(){this.resize.disconnect();}
 set(options){this.options={...this.options,...options};this.draw();}
 rotate(x,y){this.yaw+=x;this.pitch=Math.max(-1.45,Math.min(1.45,this.pitch+y));this.draw();}
 reset(){this.yaw=-.58;this.pitch=.43;this.zoom=1;if(this.options.target)this.focus(this.options.target);else this.draw();}
 focus(piece){let v=add(mul(FACES[piece.face].n,3.5),mul(piece.xyz,1.4));this.yaw=-Math.atan2(v[0],v[2]);this.pitch=Math.atan2(v[1],Math.hypot(v[0],v[2]));this.draw();}
 focusFace(face){this.focus({face,xyz:add(FACES[face].n,[.35,.35,.35])});}
 transform(v){const [x,y,z]=v,cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cx=Math.cos(this.pitch),sx=Math.sin(this.pitch),a=cy*x+sy*z,b=-sy*x+cy*z;return [a,cx*y-sx*b,sx*y+cx*b];}
 project(v){const p=this.transform(v),f=8/(8-p[2]);return [this.originX+p[0]*this.scale*f,this.originY-p[1]*this.scale*f,p[2]];}
 fit(isolated){
  const half=isolated?.5:1.5,vertices=[];
  for(const x of [-half,half])for(const y of [-half,half])for(const z of [-half,half]){
   const p=this.transform([x,y,z]),f=8/(8-p[2]);vertices.push([p[0]*f,p[1]*f]);
  }
  const xs=vertices.map(p=>p[0]),ys=vertices.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  this.scale=Math.min(this.w*.86/(maxX-minX),this.h*.86/(maxY-minY))*this.zoom;
  this.originX=this.w/2-(minX+maxX)*this.scale/2;
  this.originY=this.h/2+(minY+maxY)*this.scale/2;
 }
 pointerDown(e){if(!this.interactive)return;this.down={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};this.canvas.setPointerCapture?.(e.pointerId);}
 pointerMove(e){if(!this.down)return;let dx=e.clientX-this.down.x,dy=e.clientY-this.down.y;if(Math.abs(e.clientX-this.down.startX)+Math.abs(e.clientY-this.down.startY)>5)this.down.moved=true;this.rotate(dx*.008,dy*.008);this.down.x=e.clientX;this.down.y=e.clientY;}
 pointerUp(e){if(!this.down)return;if(!this.down.moved){const b=this.canvas.getBoundingClientRect(),p=[e.clientX-b.left,e.clientY-b.top];let poly=[...this.polygons].reverse().find(x=>x.piece&&inside(p,x.points));if(poly)this.options.onSelect?.(poly.piece);}this.down=null;}
 draw(){
 const ctx=this.ctx;if(!ctx)return;const b=this.canvas.getBoundingClientRect();this.w=b.width||380;this.h=b.height||300;const dpr=Math.min(globalThis.devicePixelRatio||1,2);if(this.canvas.width!==Math.round(this.w*dpr)||this.canvas.height!==Math.round(this.h*dpr)){this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,this.w,this.h);
 const target=this.options.target,isolate=this.options.isolated&&target,settings=this.options.settings,items=[];
 this.fit(!!isolate);
 const quad=(center,f,size)=>[[-1,1],[1,1],[1,-1],[-1,-1]].map(([u,v])=>add(center,mul(f.u,u*size),mul(f.v,v*size)));
 for(const face of FACE_ORDER){const f=FACES[face],normal=this.transform(f.n);if(normal[2]*8<=(isolate?.5:1.5))continue;const cells=isolate?[0]:[0,1,2,3,4,5,6,7,8];for(const cell of cells){
 let base,actualCell=cell,piece,color;
 if(isolate){base=mul(f.n,.5);const onSide=dot(isolate.xyz,f.n)===1;if(onSide){const x=dot(isolate.xyz,f.u),y=dot(isolate.xyz,f.v);actualCell=(1-y)*3+(x+1);piece=PIECES[isolate.type].find(p=>p.face===face&&p.cell===actualCell);color=settings.colors[face];}}
 else{base=add(mul(f.n,1.5),mul(f.u,cell%3-1),mul(f.v,1-Math.floor(cell/3)));piece=PIECES[this.options.type||'edge'].find(p=>p.face===face&&p.cell===cell);color=settings.colors[face];}
 const points=quad(base,f,.495).map(v=>this.project(v)),sticker=quad(add(base,mul(f.n,.006)),f,.446).map(v=>this.project(v)),center=this.project(base);items.push({face,piece,color,points,sticker,center,base,depth:points.reduce((s,p)=>s+p[2],0)/4,shade:.025+(1-normal[2])*.095,cell:actualCell});
 }}
 items.sort((a,b)=>a.depth-b.depth);this.polygons=items;
 for(const item of items){path(ctx,item.points,.11);ctx.fillStyle='#07090d';ctx.fill();ctx.strokeStyle='rgba(0,0,0,.85)';ctx.lineWidth=1;ctx.stroke();if(!item.color)continue;path(ctx,item.sticker,.16);ctx.fillStyle=item.color;ctx.fill();ctx.fillStyle=`rgba(0,0,0,${item.shade})`;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.24)';ctx.lineWidth=1;ctx.stroke();
 const selected=target&&item.piece?.id===target.id&&item.piece?.type===target.type;let label='';if(selected)label=this.options.reveal?letterOf(target,settings):'?';else if(this.options.labels&&item.piece)label=letterOf(item.piece,settings);else if(item.cell===4)label=item.face;
 if(selected){path(ctx,item.sticker,.16);ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.stroke();ctx.shadowColor='#62a8ff';ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;}
 if(label){
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  if(selected){
   const ps=item.sticker;
   const area=Math.abs(ps.reduce((s,p,i)=>s+p[0]*ps[(i+1)%4][1]-ps[(i+1)%4][0]*p[1],0))/2;
   const longest=Math.max(...ps.map((p,i)=>Math.hypot(p[0]-ps[(i+1)%4][0],p[1]-ps[(i+1)%4][1])));
   const size=Math.min(this.scale*(isolate?.36:.38),area/longest*.47);
   ctx.font=`800 ${size}px "Arial",sans-serif`;
   ctx.beginPath();ctx.arc(item.center[0],item.center[1],size*.72,0,Math.PI*2);ctx.fillStyle='#071221';ctx.fill();ctx.fillStyle='#ffffff';
   ctx.fillText(label,item.center[0],item.center[1]+1);
  }else{
   // Keep ordinary labels on their face instead of floating across narrow sides.
   const f=FACES[item.face],right=this.project(add(item.base,mul(f.u,.01))),down=this.project(add(item.base,mul(f.v,-.01))),k=.38/(32*.01);
   ctx.transform((right[0]-item.center[0])*k,(right[1]-item.center[1])*k,(down[0]-item.center[0])*k,(down[1]-item.center[1])*k,item.center[0],item.center[1]);
   ctx.font='600 32px "Arial",sans-serif';ctx.fillStyle=labelInk(item.color,item.cell===4);ctx.fillText(label,0,1);
  }
  ctx.restore();
 }
 }
 }
}
