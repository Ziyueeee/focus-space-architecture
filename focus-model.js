(function(root,factory){const value=typeof module==='object'&&module.exports?factory(require('./generation/contract.js'),require('./generation/few-shot-examples.js')):factory(root.FocusGenerationContract,root.FocusExamples);if(typeof module==='object'&&module.exports)module.exports=value;else root.FocusModel=value;})(globalThis,(Contract,Examples)=>{
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const STORE_PREFIX='focus-genui-v005:';
 function chooseStrategy(evidence={}){if(evidence.spatialRelationships&&evidence.independentDomains)return 'mixed';if(evidence.spatialRelationships)return 'integrated';if(evidence.independentDomains)return 'modular';return 'custom';}
 function generateGoal(goal){return {id:'goal-only',goal,memory:{revision:0,context:{},state:{attentionEnabled:false},decisions:[]},schema:{id:'goal-only-schema',version:1,regions:[...Contract.regions],organization:'modular',rationale:'仅有 Goal，先以简短概览承载已知意图，具体信息保持未知。',persistent:{overview:'facts',components:[{id:'goal-overview',type:'facts-overview',binding:'goal-summary',hidden:false}]}},proposal:null,events:[]};}
 function generate(id){const e=Examples[id];if(!e)throw new Error('Unknown example');const strategy=chooseStrategy(e.evidence);const model={id,goal:e.goal,memory:{revision:0,context:clone(e.memory),state:{attentionEnabled:false},decisions:[]},schema:{id:id+'-schema',version:1,regions:[...Contract.regions],organization:strategy,rationale:e.rationale,persistent:{overview:e.composition.some(c=>c.type==='facts-overview')?'facts':'embedded',components:e.composition.map(c=>({...clone(c),hidden:false}))}},proposal:null,events:[]};const issues=validate(model);if(issues.length)throw new Error(issues.join('; '));return model;}
 function validate(m){const errors=[];if(!m||typeof m.goal!=='string'||!m.memory||!m.schema)return ['Missing Focus fields'];const s=m.schema;
  if(!m.memory.context||typeof m.memory.context!=='object'||Array.isArray(m.memory.context)||!m.memory.state||typeof m.memory.state.attentionEnabled!=='boolean'||!Array.isArray(m.memory.decisions)||!Number.isInteger(m.memory.revision))errors.push('Invalid shared Memory');
  if(typeof s.id!=='string'||!s.id||typeof s.rationale!=='string'||!s.rationale)errors.push('Missing schema identity or rationale');
  if(JSON.stringify(s.regions)!==JSON.stringify(Contract.regions))errors.push('Only Active and Persistent are top-level regions');
  if(typeof s.organization!=='string'||!s.organization.trim())errors.push('Missing organization description');
  const components=s.persistent?.components;if(!Array.isArray(components)||!components.length)return [...errors,'Persistent needs components'];
  if(s.organization==='modular'&&(s.persistent.overview!=='facts'||components[0].type!=='facts-overview'||components[0].hidden))errors.push('Modular requires a visible first Facts overview');
  if(s.organization==='integrated'&&(s.persistent.overview!=='embedded'||components.some(c=>c.type==='facts-overview')))errors.push('Integrated overview must be embedded');
  const facts=components.filter(c=>c?.type==='facts-overview');
  if(!['facts','embedded'].includes(s.persistent.overview))errors.push('Unknown overview representation');
  if(s.persistent.overview==='facts'&&(facts.length!==1||components[0]?.type!=='facts-overview'||components[0].hidden))errors.push('Facts overview must be visible and first');
  if(s.persistent.overview==='embedded'&&(facts.length||!components.some(c=>c&&!c.hidden&&Contract.embeddedOverviewBindings.includes(c.binding))))errors.push('Embedded understanding needs a visible overview-capable component');
  const ids=new Set();for(const c of components){if(!c||typeof c.id!=='string'||!c.id||typeof c.hidden!=='boolean'){errors.push('Invalid component');continue;}if(ids.has(c.id))errors.push('Duplicate component ID');ids.add(c.id);if(!Contract.components[c.type]?.includes(c.binding))errors.push('Unknown component or binding');if(c.type==='renovation-scene'){const rooms=c.layout?.objects;if(!rooms?.length)errors.push('Spatial scene requires rooms');else{const roomIds=new Set();for(const room of rooms){if(roomIds.has(room.id)||!room.id||!room.name||![room.x,room.y,room.w,room.d].every(Number.isFinite)||room.x<0||room.y<0||room.w<=0||room.d<=0||!['living','bedroom','kitchen','bathroom'].includes(room.kind))errors.push('Invalid room layout');roomIds.add(room.id);const value=m.memory.context[room.binding]?.value;if(value!==null&&(!Number.isFinite(value)||value<0||value>100))errors.push('Invalid room progress');}}}}
  const example=Examples[m.id];if(example){for(const [key,initial] of Object.entries(example.memory)){const item=m.memory.context?.[key];if(!item||!Object.hasOwn(item,'value')||!['confirmed','pending','suggested','decided','unknown'].includes(item.status)||typeof item.source!=='string'){errors.push('Invalid Memory field: '+key);continue;}if(initial.value!==null&&item.value!==null&&typeof initial.value!==typeof item.value)errors.push('Incompatible Memory field: '+key);}}
  if(!Number.isInteger(s.version)||s.version<1)errors.push('Invalid schema version');return errors;
 }
 function derive(m){const get=k=>m.memory.context[k]?.value??null;const e=Examples[m.id];const proposal=m.proposal?.status==='pending';let active={kind:'quiet',message:'Quiet'};let view;
  if(m.id==='proposal'){
   const ready=[get('draftReady')===true,get('playbackReady')===true,!!get('venue')].filter(Boolean).length;
   const unknown=['draftReady','playbackReady','venue'].filter(k=>get(k)===null).length,pending=3-ready-unknown;
   view={summary:{headline:unknown===3?'准备信息待补充':ready===3?'电影夜准备就绪':'准备推进中',date:get('date'),ready,total:3,unresolved:3-ready,unknown,pending},details:{draftReady:get('draftReady'),playbackReady:get('playbackReady'),venue:get('venue'),movie:get('movie')},scene:null};
   if(m.memory.state.attentionEnabled&&get('playbackReady')!==true)active={kind:'attention',message:'安排一次短片试播？',action:'确认试播完成'};
  }else if(m.id==='renovation'){
   const scene=m.schema.persistent.components.find(c=>c.type==='renovation-scene');const items=scene.layout.objects.map(o=>({...o,progress:get(o.binding)}));
   const unknown=items.filter(x=>x.progress===null).length,ready=items.filter(x=>x.progress===100).length;
   const area=items.reduce((total,x)=>total+x.w*x.d,0),progress=unknown?null:Math.round(items.reduce((total,x)=>total+x.w*x.d*x.progress,0)/area);
   view={summary:{headline:progress===null?'整体进度待补充':`整体进度 ${progress}%`,progress,ready,total:items.length,unknown},details:{lastUpdate:get('lastUpdate')},scene:{items,progress,unknown}};
   if(m.memory.state.attentionEnabled&&get('kitchenReviewPending'))active={kind:'attention',message:'厨房橱柜尺寸需要复核',action:'确认尺寸已复核'};
  }else view={summary:{headline:m.goal,ready:0,total:0},details:{},scene:null};
  if(proposal)active={kind:'structure',message:`增加「${e.addition.title}」区域？`,action:'查看建议'};
  return {...view,active};
 }
 class FocusStore{
  constructor(storage){this.storage=storage;this.cache={};this.current=null;this.persistence='local';}
  open(id){if(!Examples[id])throw new Error('Unknown example');let raw;try{raw=this.storage?.getItem(STORE_PREFIX+id);}catch{this.persistence='session';}
   if(this.cache[id])this.current=clone(this.cache[id]);else if(raw){const saved=JSON.parse(raw);const issues=validate(saved);if(saved.id!==id||issues.length)throw new Error('Saved schema is invalid; explicit reset required');this.current=saved;}else this.current=generate(id);
   this.persist();return this.snapshot();
  }
  persist(){this.cache[this.current.id]=clone(this.current);try{if(this.storage)this.storage.setItem(STORE_PREFIX+this.current.id,JSON.stringify(this.current));else this.persistence='session';}catch{this.persistence='session';}}
  snapshot(){return clone(this.current);}
  patch(key,value,source='context'){const c=this.current.memory.context;if(!Object.hasOwn(c,key))throw new Error('Unknown Memory key');const old=c[key].value;
   const room=this.current.schema.persistent.components.find(c=>c.type==='renovation-scene')?.layout.objects.find(r=>r.binding===key);
   if(room&&value!==null&&(!Number.isFinite(value)||value<0||value>100))throw new Error('Room progress must be between 0 and 100');
   if(!(room&&value===null)&&typeof value!==typeof old&&old!==null&&!(old==='unknown'))throw new Error('Incompatible value');
   c[key]={value,status:value===null||value==='unknown'?'unknown':'confirmed',source};this.current.memory.revision++;this.current.events.push({kind:'memory',key,source});this.persist();}
  updateRoom(roomId,value,source='direct'){const room=this.current.schema.persistent.components.find(c=>c.type==='renovation-scene')?.layout.objects.find(r=>r.id===roomId);if(!room)throw new Error('Unknown room');this.patch(room.binding,value,source);this.patch('lastUpdate',`${room.name}装修进度更新为 ${value===null?'待确认':value+'%'}`,source);}
  setAttention(enabled){this.current.memory.state.attentionEnabled=!!enabled;this.current.memory.revision++;this.persist();}
  resolveAttention(){if(this.current.id==='proposal')this.patch('playbackReady',true,'direct');else{this.patch('kitchenReviewPending',false,'direct');this.patch('lastUpdate','厨房橱柜尺寸已复核','direct');}}
  propose(){const e=Examples[this.current.id];if(this.current.schema.persistent.components.some(c=>c.id===e.addition.id))return;this.current.proposal={status:'pending',component:clone(e.addition)};this.persist();}
  reject(){if(this.current.proposal)this.current.proposal.status='rejected';this.persist();}
  confirm(){if(this.current.proposal?.status!=='pending')throw new Error('No pending proposal');const p=this.current.proposal;const {title,...component}=p.component;this.current.schema.persistent.components.push({...component,hidden:false});this.current.schema.version++;p.status='accepted';this.current.memory.decisions.push({kind:'structure',componentId:component.id,status:'decided',source:'explicit-user-confirmation'});this.current.memory.revision++;this.persist();}
  hide(){this.visibility(true);}
  show(){this.visibility(false);}
  visibility(hidden){const id=Examples[this.current.id].addition.id;const c=this.current.schema.persistent.components.find(c=>c.id===id);if(!c)throw new Error('Component absent');if(c.hidden!==hidden){c.hidden=hidden;this.current.schema.version++;}this.persist();}
  reset(id=this.current?.id){this.current=generate(id);this.persist();return this.snapshot();}
 }
 return {FocusStore,generate,generateGoal,derive,chooseStrategy,validate,STORE_PREFIX};
});
