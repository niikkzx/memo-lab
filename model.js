export const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWX';
export const FACE_ORDER=['U','L','F','R','B','D'];
export const FACES={
 U:{name:'Cima',color:'#fafbff',n:[0,1,0],u:[1,0,0],v:[0,0,-1]},
 L:{name:'Esquerda',color:'#ff8000',n:[-1,0,0],u:[0,0,1],v:[0,1,0]},
 F:{name:'Frente',color:'#00df27',n:[0,0,1],u:[1,0,0],v:[0,1,0]},
 R:{name:'Direita',color:'#ff304a',n:[1,0,0],u:[0,0,-1],v:[0,1,0]},
 B:{name:'Trás',color:'#0057ce',n:[0,0,-1],u:[-1,0,0],v:[0,1,0]},
 D:{name:'Baixo',color:'#ffe500',n:[0,-1,0],u:[1,0,0],v:[0,0,1]}
};
const EDGE_POS=['UB','UR','UF','UL','LU','LF','LD','LB','FU','FR','FD','FL','RU','RB','RD','RF','BU','BL','BD','BR','DF','DR','DB','DL'];
const CORNER_POS=['UBL','UBR','UFR','UFL','LUB','LUF','LDF','LDB','FUL','FUR','FDR','FDL','RUF','RUB','RDB','RDF','BUR','BUL','BDL','BDR','DFL','DFR','DBR','DBL'];
export const add=(...vs)=>vs[0].map((_,i)=>vs.reduce((s,v)=>s+v[i],0));
export const mul=(v,s)=>v.map(x=>x*s);
export const PIECES={};
for(const type of ['edge','corner']) PIECES[type]=FACE_ORDER.flatMap((face,fi)=>{
 const f=FACES[face],cells=type==='edge'?[1,5,7,3]:[0,2,8,6];
 return cells.map((cell,k)=>({id:ALPHABET[fi*4+k],index:fi*4+k,type,face,cell,pos:(type==='edge'?EDGE_POS:CORNER_POS)[fi*4+k],xyz:add(f.n,mul(f.u,cell%3-1),mul(f.v,1-Math.floor(cell/3)))}));
});
export function samePiece(a,b){return a.xyz.every((v,i)=>v===b.xyz[i]);}
export function letterOf(piece,settings){return (settings.scheme[piece.type]||ALPHABET)[piece.index];}
export function findLetter(letter,type,settings){return PIECES[type].find(p=>letterOf(p,settings)===letter);}
export function labelAt(face,cell,type,settings){const p=PIECES[type].find(p=>p.face===face&&p.cell===cell);return p?letterOf(p,settings):'';}
export const DEFAULT_SETTINGS={type:'edge',count:20,target:3,excludeBuffer:false,edgeBuffer:'UF',cornerBuffer:'UBL',scheme:{edge:ALPHABET,corner:ALPHABET},colors:Object.fromEntries(FACE_ORDER.map(f=>[f,FACES[f].color])),colorVersion:2,goal:10,sequenceLength:5,exposure:20,sequenceSource:'dictionary',trainingOrder:'shuffle',trainingScope:'all',trainingLetters:ALPHABET,trainingPairs:[],orientationPairs:[],colorSize:2,sessionSize:'count'};
const LEGACY_COLORS={U:'#f1f1e8',L:'#f39b40',F:'#7edb93',R:'#ed7567',B:'#70a6ed',D:'#efd568'};
export function upgradeColors(settings){
 if(settings.colorVersion>=2)return;
 for(const face of FACE_ORDER)if(settings.colors[face]?.toLowerCase()===LEGACY_COLORS[face])settings.colors[face]=FACES[face].color;
 settings.colorVersion=2;
}
export const STARTER_PAIRS={
 AB:{word:'Abelha',note:'Uma abelha gigante carregando o cubo.'},BA:{word:'Banana',note:'Uma banana escorregando em uma pista.'},
 AQ:{word:'Aquário',note:'Um aquário com peixes luminosos.'},QA:{word:'Quadro azul',note:'Um quadro azul caindo da parede.'},
 AC:{word:'Abacaxi',note:'Um abacaxi com óculos escuros.'},CA:{word:'Cachorro',note:'Um cachorro pulando dentro do cubo.'},
 AD:{word:'Aladdin',note:'Aladdin voando em um tapete.'},DA:{word:'Dado',note:'Um dado enorme rolando.'},
 AF:{word:'Alface',note:'Uma folha de alface do tamanho de uma casa.'},FA:{word:'Faca',note:'Uma faca cortando uma nuvem.'},
 AG:{word:'Águia',note:'Uma águia levando uma peça do cubo.'},GA:{word:'Gato',note:'Um gato verde tocando bateria.'},
 BC:{word:'Bicicleta',note:'Uma bicicleta andando sozinha.'},CB:{word:'Cobra',note:'Uma cobra enrolada em um poste.'},
 BD:{word:'Balde',note:'Um balde derramando estrelas.'},DB:{word:'Dublê',note:'Um dublê saltando sobre o cubo.'},
 BL:{word:'Bola',note:'Uma bola que quica até a lua.'},LB:{word:'Lobo',note:'Um lobo uivando para uma lâmpada.'},
 CT:{word:'Cacto',note:'Um cacto dançando de tênis.'},TC:{word:'Taco',note:'Um taco de beisebol feito de gelo.'},
 CN:{word:'Caneca',note:'Uma caneca transbordando chocolate.'},NC:{word:'Navio cargueiro',note:'Um navio carregado de cubos.'},
 FL:{word:'Flauta',note:'Uma flauta fazendo bolhas de sabão.'},LF:{word:'Lâmpada flutuante',note:'Uma lâmpada flutuando na sala.'},
 PT:{word:'Pato',note:'Um pato usando botas vermelhas.'},TP:{word:'Tapete',note:'Um tapete voando pelo quarto.'},
 PR:{word:'Pirata',note:'Um pirata com um cubo no lugar do tesouro.'},RP:{word:'Raposa',note:'Uma raposa correndo com uma bandeira.'},
 LM:{word:'Limão',note:'Um limão espirrando suco.'},ML:{word:'Mala',note:'Uma mala abrindo e soltando confetes.'},
 TR:{word:'Tigre',note:'Um tigre listrado de verde.'},RT:{word:'Rato',note:'Um rato levantando um cubo gigante.'}
};
export function freshData(){return {version:1,settings:structuredClone(DEFAULT_SETTINGS),dictionary:structuredClone(STARTER_PAIRS),attempts:[],sessions:[]};}
export function validateScheme(s){return typeof s==='string'&&s.length===24&&new Set(s).size===24&&[...s].every(c=>ALPHABET.includes(c));}
export function normalizeAnswer(s){return s.toUpperCase().replace(/[\s,;|/\-]/g,'');}
export function scoreSequence(expected,answer){const got=normalizeAnswer(answer).match(/.{1,2}/g)||[];const comparisons=expected.map((p,i)=>({expected:p,answer:got[i]||'—',correct:p===got[i]}));return {comparisons,extra:got.slice(expected.length),correct:comparisons.filter(x=>x.correct).length,total:Math.max(expected.length,got.length),exact:expected.join('')===normalizeAnswer(answer)};}
export function poolFor(settings,type=settings.type){const types=type==='mixed'?['edge','corner']:[type];return types.flatMap(t=>PIECES[t].filter(p=>{if(!settings.excludeBuffer)return true;const b=PIECES[t].find(p=>p.pos===settings[t+'Buffer']);return !b||!samePiece(p,b);}));}
export function weightedPick(pool,attempts,random=Math.random){
 if(!pool.length)return null;
 const recent=attempts.slice(-350);const weights=pool.map(p=>{const a=recent.filter(a=>a.targets?.some(t=>t.id===p.id&&t.type===p.type));return 1+a.filter(a=>!a.correct).length*3+(a.length?Math.min(2,a.reduce((s,v)=>s+v.ms,0)/a.length/5000):1);});
 let r=random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){r-=weights[i];if(r<=0)return pool[i];}return pool.at(-1);
}
export function makeQuestion(mode,settings,attempts=[],review=false,last='',random=Math.random){
 let pool=poolFor(settings);if(review){const bad=new Set(attempts.filter(a=>!a.correct).flatMap(a=>(a.targets||[]).map(t=>t.type+':'+t.id)));const weaker=pool.filter(p=>bad.has(p.type+':'+p.id));if(weaker.length)pool=weaker;}
 let first=weightedPick(pool.filter(p=>p.type+':'+p.id!==last),attempts,random)||weightedPick(pool,attempts,random);if(!first)throw new Error('Selecione mais peças para treinar.');
 const targets=[first];if(mode==='pairs'){const nextPool=pool.filter(p=>p.type===first.type&&p.id!==first.id);targets.push(weightedPick(nextPool,attempts,random)||first);}
 return {targets,expected:targets.map(p=>letterOf(p,settings)).join(''),type:first.type};
}
export function makeSequence(length,dictionary,settings,random=Math.random){const keys=Object.keys(dictionary).filter(k=>/^[A-X]{2}$/.test(k)&&dictionary[k].word);const source=settings.sequenceSource==='dictionary'&&keys.length?keys:null;return Array.from({length},()=>source?source[Math.floor(random()*source.length)]:ALPHABET[Math.floor(random()*24)]+ALPHABET[Math.floor(random()*24)]);}
export function localDay(value=new Date()){const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function metrics(data){const a=data.attempts.filter(x=>['letters','pairs','colors','orientation'].includes(x.mode));const today=data.attempts.filter(x=>localDay(x.at)===localDay());const sec=today.reduce((s,x)=>s+(x.ms||0),0)/1000;const days=new Set(data.attempts.map(x=>localDay(x.at)));let streak=0,d=new Date();if(!days.has(localDay(d)))d.setDate(d.getDate()-1);while(days.has(localDay(d))){streak++;d.setDate(d.getDate()-1);}return {count:a.length,accuracy:a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null,avg:a.length?a.reduce((s,x)=>s+x.ms,0)/a.length/1000:null,today:today.length,minutes:sec/60,streak};}
export function validateImport(obj){
 if(!obj||obj.version!==1||!obj.settings||!validateScheme(obj.settings.scheme?.edge)||!validateScheme(obj.settings.scheme?.corner)||!Array.isArray(obj.attempts)||!Array.isArray(obj.sessions)||!obj.dictionary||typeof obj.dictionary!=='object'||Array.isArray(obj.dictionary))throw new Error('Este arquivo não é um backup válido do Memo Lab.');
 const d=freshData(),s=obj.settings;
 for(const key of ['type','edgeBuffer','cornerBuffer','sequenceSource'])if(typeof s[key]==='string')d.settings[key]=s[key];
 if(!['edge','corner','mixed'].includes(d.settings.type))throw new Error('Tipo de peça inválido.');
 if(!PIECES.edge.some(p=>p.pos===d.settings.edgeBuffer)||!PIECES.corner.some(p=>p.pos===d.settings.cornerBuffer))throw new Error('Buffer inválido.');
 for(const [key,min,max]of [['count',5,100],['target',0,30],['goal',1,120],['sequenceLength',1,20],['exposure',0,120]])if(Number.isFinite(s[key]))d.settings[key]=Math.min(max,Math.max(min,s[key]));
 for(const [key,values]of Object.entries({trainingOrder:['shuffle','ordered','adaptive'],trainingScope:['all','custom','difficult'],sessionSize:['all','count']}))if(values.includes(s[key]))d.settings[key]=s[key];
 if(typeof s.trainingLetters==='string'&&/^[A-X]*$/.test(s.trainingLetters))d.settings.trainingLetters=[...new Set(s.trainingLetters)].join('');
 if(Array.isArray(s.trainingPairs)&&s.trainingPairs.every(p=>typeof p==='string'&&/^[A-X]{2}$/.test(p)))d.settings.trainingPairs=[...new Set(s.trainingPairs)].slice(0,576);
 if(Array.isArray(s.orientationPairs)&&s.orientationPairs.every(p=>typeof p==='string'&&/^[A-X]{2}$/.test(p)))d.settings.orientationPairs=[...new Set(s.orientationPairs)].slice(0,24);
 if([1,2].includes(s.colorSize))d.settings.colorSize=s.colorSize;
 d.settings.excludeBuffer=!!s.excludeBuffer;d.settings.scheme={edge:s.scheme.edge,corner:s.scheme.corner};
 for(const face of FACE_ORDER)if(/^#[0-9a-f]{6}$/i.test(s.colors?.[face]))d.settings.colors[face]=s.colors[face];
 d.settings.colorVersion=s.colorVersion===2?2:1;upgradeColors(d.settings);
 d.dictionary={};for(const [key,v]of Object.entries(obj.dictionary)){if(!/^[A-X]{2}$/.test(key)||!v||typeof v.word!=='string'||!v.word.trim())throw new Error('Par inválido no backup.');d.dictionary[key]={word:v.word.slice(0,80),note:typeof v.note==='string'?v.note.slice(0,300):'',favorite:!!v.favorite};}
 for(const a of obj.attempts.slice(-20000)){if(!a||!['letters','pairs','colors','orientation','association','sequence'].includes(a.mode)||!Number.isFinite(a.ms)||a.ms<0||!Number.isFinite(new Date(a.at).getTime())||typeof a.correct!=='boolean'||typeof a.expected!=='string'||!/^([A-X]|\s){1,100}$/.test(a.expected))throw new Error('Histórico inválido no backup.');if(a.targets&&!a.targets.every(t=>PIECES[t.type]?.some(p=>p.id===t.id)))throw new Error('Peça inválida no backup.');d.attempts.push({mode:a.mode,ms:a.ms,at:a.at,correct:a.correct,expected:a.expected,answer:typeof a.answer==='string'?a.answer.slice(0,100):'',targets:(a.targets||[]).map(t=>({id:t.id,type:t.type})),assisted:!!a.assisted,...(['colors','orientation'].includes(a.mode)&&typeof a.expectedFaces==='string'&&/^[ULFRBD]{1,2}$/.test(a.expectedFaces)?{expectedFaces:a.expectedFaces}:{})});}
 for(const s of obj.sessions.slice(-1000)){if(!s||!['letters','pairs','colors','orientation','association','sequence'].includes(s.mode)||!Number.isFinite(new Date(s.at).getTime())||!Number.isFinite(s.total)||!Number.isFinite(s.correct)||s.total<0||s.correct<0||s.correct>s.total||!Number.isFinite(s.ms)||s.ms<0)throw new Error('Sessão inválida no backup.');d.sessions.push({at:s.at,mode:s.mode,total:s.total,correct:s.correct,ms:s.ms,sprint:!!s.sprint});}return d;
}
