import {ALPHABET,FACE_ORDER,DEFAULT_SETTINGS,poolFor,letterOf} from './model.js?v=20261016-training1';

export const COLOR_NAMES={U:'Branco',L:'Laranja',F:'Verde',R:'Vermelho',B:'Azul',D:'Amarelo'};
export const isPieceMode=mode=>['letters','pairs','colors'].includes(mode);
export const usesPairs=(mode,config)=>['pairs','association','sequence'].includes(mode)||(mode==='colors'&&config.colorSize===2);
export function colorName(face,config){if(!FACE_ORDER.includes(face))return '—';return config.colors[face]?.toLowerCase()===DEFAULT_SETTINGS.colors[face].toLowerCase()?COLOR_NAMES[face]:'Face '+face;}
export function parsePairs(text){
 const tokens=String(text||'').trim().toUpperCase().split(/[\s,;|/]+/).filter(Boolean);
 if(tokens.some(p=>!new RegExp('^[A-X]{2}$').test(p)))throw new Error('Separe pares de duas letras de A a X por espaços. Exemplo: AQ QA AB.');
 return [...new Set(tokens)];
}
export function shuffle(items,random=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function questionKey(question){return question.targets?.length?question.targets.map(p=>p.type+':'+p.id).join('|'):question.expected;}
export function recentPerformance(question,mode,attempts,target=0){
 const key=questionKey(question),recent=attempts.filter(a=>a.mode===mode&&questionKey(a)===key).slice(-3);
 return summarizePerformance(recent,target);
}
function summarizePerformance(recent,target){
 const errors=recent.filter(a=>!a.correct).length,avg=recent.length?recent.reduce((sum,a)=>sum+a.ms,0)/recent.length:0;
 return {seen:recent.length,errors,avg,slow:!!target&&recent.length>0&&avg>target*1000,difficult:errors>0||(!!target&&recent.length>0&&avg>target*1000)};
}
export function stickerPerformance(piece,attempts,target=0){return summarizePerformance(attempts.filter(a=>isPieceMode(a.mode)&&a.targets?.some(p=>p.type===piece.type&&p.id===piece.id)).slice(-3),target);}
function performanceIndex(mode,attempts,target){const map=new Map();for(const a of attempts){if(a.mode!==mode)continue;const key=questionKey(a),recent=map.get(key)||[];recent.push(a);if(recent.length>3)recent.shift();map.set(key,recent);}return new Map([...map].map(([key,recent])=>[key,summarizePerformance(recent,target)]));}
export function buildTrainingDeck(mode,config,dictionary={},attempts=[]){
 const paired=usesPairs(mode,config),custom=config.trainingScope==='custom';
 const selected=[...new Set(config.trainingLetters??ALPHABET)].filter(l=>ALPHABET.includes(l));
 const exact=custom&&paired?(config.trainingPairs||[]):[];
 if(custom&&!exact.length&&!selected.length)throw new Error('Selecione pelo menos uma letra ou informe os pares que quer treinar.');
 let deck=[];
 if(isPieceMode(mode)){
  const pool=poolFor(config).filter(p=>!custom||exact.length||selected.includes(letterOf(p,config)));
  if(paired){
   if(exact.length){for(const type of config.type==='mixed'?['edge','corner']:[config.type])for(const code of exact){const targets=[...code].map(l=>pool.find(p=>p.type===type&&letterOf(p,config)===l));if(targets.every(Boolean))deck.push({expected:code,targets,type});}}
   else for(const a of pool)for(const b of pool)if(a.type===b.type)deck.push({expected:letterOf(a,config)+letterOf(b,config),targets:[a,b],type:a.type});
  }else deck=pool.map(p=>({expected:letterOf(p,config),targets:[p],type:p.type}));
 }else{
  let pairs=mode==='association'||config.sequenceSource==='dictionary'?Object.keys(dictionary).filter(p=>dictionary[p].word):[...ALPHABET].flatMap(a=>[...ALPHABET].map(b=>a+b));
  if(config.favorites)pairs=pairs.filter(p=>dictionary[p]?.favorite);
  if(custom)pairs=pairs.filter(p=>exact.length?exact.includes(p):[...p].every(l=>selected.includes(l)));
  deck=pairs.map(expected=>({expected,targets:[],type:null}));
 }
 if(config.trainingScope==='difficult'){const stats=performanceIndex(mode,attempts,config.target);deck=deck.filter(q=>config.reviewStickers?stickerPerformance(q.targets[0],attempts,config.target).difficult:stats.get(questionKey(q))?.difficult);}
 deck.sort((a,b)=>a.expected.localeCompare(b.expected)||(a.type||'').localeCompare(b.type||''));
 if(!deck.length)throw new Error(config.trainingScope==='difficult'?'Nenhum erro ou resposta lenta neste grupo. Escolha todos os itens ou mude o tipo de peça.':'Nenhum item disponível. Confira as letras, os pares, os favoritos e a exclusão de buffers.');
 return deck;
}
export function drawTrainingQuestion(session,attempts=[],random=Math.random){
 const {deck,config,mode}=session;
 if(config.trainingOrder==='adaptive'){
  const pool=deck.length>1?deck.filter(q=>questionKey(q)!==session.lastKey):deck;
  const stats=performanceIndex(mode,attempts,config.target);
  const weights=pool.map(q=>{const p=stats.get(questionKey(q));return p?1+p.errors*3+(p.slow?2:0):2;});
  let r=random()*weights.reduce((a,b)=>a+b,0),chosen=pool.at(-1);
  for(let i=0;i<pool.length;i++){r-=weights[i];if(r<=0){chosen=pool[i];break;}}
  session.lastKey=questionKey(chosen);return chosen;
 }
 if(!session.queue)session.queue=config.trainingOrder==='ordered'?[...deck]:shuffle(deck,random);
 const question=session.queue.shift();if(question)session.lastKey=questionKey(question);return question||null;
}
export function difficultQuestions(answers,deck,target){const keys=new Set(answers.filter(a=>!a.correct||(target>0&&a.ms>target*1000)).map(questionKey));return deck.filter(q=>keys.has(questionKey(q)));}
export function expectedColors(question){return question.targets.map(p=>p.face).join('');}
export function validColorAnswer(answer,length){return typeof answer==='string'&&answer.length===length&&[...answer].every(f=>FACE_ORDER.includes(f));}
