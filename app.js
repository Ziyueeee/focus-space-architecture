(async () => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Markdown=window.FocusPrinciplesMarkdown, Model=window.FocusModel, Examples=window.FocusExamples;
let sections;
$('.workspace').setAttribute('aria-busy','true');
$('.workspace').dataset.dsState='loading';
try{
 const url=new URL('PRINCIPLES.md',location.href);url.searchParams.set('read',Date.now());
 sections=await Markdown.load(url.href);
 window.FOCUS_PRINCIPLES=sections; // Derived from Markdown; retained for existing inspection tools.
}catch(error){
 $('.workspace').dataset.dsState='error';
 $('.workspace').setAttribute('aria-busy','false');
 $('#detail').innerHTML='<div class="principles-error" role="alert"><h2 class="detail-title">原则暂时无法显示</h2><p>请检查网络或原则文档格式，再重新读取。</p><button class="text-button" id="retry-principles">重新读取</button></div>';
 $('#retry-principles').addEventListener('click',()=>location.reload());
 return;
}
$('.workspace').setAttribute('aria-busy','false');
let copyTexts=[];
const copyTimers=new WeakMap();
const copyIcon='<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="7" y="7" width="9" height="10" rx="1.6"/><path d="M12 4V3H3v10h1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function copyButton(text,label='复制原则'){const id=copyTexts.push(text)-1;return `<button class="copy-button" data-copy="${id}" aria-label="${escape(label)}" title="${escape(label)}">${copyIcon}</button>`;}
function principleText(item){return [Markdown.plain(item[0]),Markdown.blocksText(item.blocks)].filter(Boolean).join('\n');}
function groupText(group,numbered=false){return [Markdown.plain(group.title),Markdown.plain(group.desc),...group.principles.map((item,i)=>(numbered?`${i+1}. `:'')+principleText(item)),Markdown.plain(group.rule)].filter(Boolean).join('\n\n');}
function normalizeRegion(key){return key==='facts'||key==='decision'?'persistent':key;}
async function copyPrinciple(button){
 const text=copyTexts[Number(button.dataset.copy)];if(typeof text!=='string')return;
 let copied=false;
 try{await navigator.clipboard.writeText(text);copied=true;}catch{
  const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);
  const active=document.activeElement;field.select();try{copied=document.execCommand('copy');}catch{}field.remove();active?.focus({preventScroll:true});
 }
 clearTimeout(copyTimers.get(button));const label=copied?'已复制':'复制失败，请重试';
 button.innerHTML=copied?'<span aria-hidden="true">✓</span>':copyIcon;button.classList.toggle('copied',copied);button.title=label;button.setAttribute('aria-label',label);$('#announcer').textContent=label;
 copyTimers.set(button,setTimeout(()=>{if(button.isConnected){button.innerHTML=copyIcon;button.classList.remove('copied');button.title='复制本组原则';button.setAttribute('aria-label','复制本组原则');}},1600));
}
let storage;try{storage=window.localStorage;}catch{/* Session-only mode remains usable. */}
let store=new Model.FocusStore(storage);
const state={selected:'overview',example:new URLSearchParams(location.search).get('view')==='example',caseId:['garden','renovation'].includes(new URLSearchParams(location.search).get('case'))?'renovation':'proposal',scenario:'',notice:'',selectedRoom:'living',error:''};
function openCase(id){
 state.caseId=id;state.error='';
 try{store.open(id);}catch{state.error='保存的状态无法读取。请点「重置案例」显式重新生成。';}
}
function overviewRow(key){
 const s=sections[key],generation=key==='generation';
 return `<button class="layer-row${generation?' generation-entry':''}" data-select="${key}"><span class="layer-number">${s.n}</span><span class="layer-label"><strong>${Markdown.inline(generation?s.title:s.name)}</strong>${generation?'':`<small>${Markdown.inline(s.title)}</small>`}</span><span class="row-arrow" aria-hidden="true">↗</span></button>`;
}
function overview(){
 return `<h2 class="detail-title">Focus Space</h2>${overviewRow('generation')}<div class="layer-list">${['active','persistent'].map(key=>`<div class="layer-group">${overviewRow(key)}</div>`).join('')}</div><div class="shared-context"><svg width="24" height="25" viewBox="0 0 24 25" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></svg><strong>Focus Memory · Context · State</strong></div>`;
}
function principleList(items,numbered=false){
 const tag=numbered?'ol':'div',itemTag=numbered?'li':'div';
 return `<${tag} class="principles${numbered?' numbered':''}">${items.map(item=>`<${itemTag} class="principle"><h3>${Markdown.inline(item[0])}</h3>${Markdown.renderBlocks(item.blocks)}</${itemTag}>`).join('')}</${tag}>`;
}

function structureDetail(key){
 if(key==='chat'){const items=[...sections.active.principles,...sections.persistent.principles].filter(item=>item.chat);return `<h2 class="detail-title copyable-title">Chat${copyButton(['Chat',...items.map(principleText)].join('\n\n'),'复制本组原则')}</h2>${principleList(items)}`;}
 const s=sections[key];return `<div class="detail-kicker"><span class="number-badge">${s.n}</span>${Markdown.inline(s.name)}</div><h2 class="detail-title copyable-title">${Markdown.inline(s.title)}${copyButton([Markdown.plain(s.name),groupText(s,key==='generation'),...(s.groups||[]).map(group=>groupText(group))].filter(Boolean).join('\n\n'),'复制本组原则')}</h2><p class="detail-description">${Markdown.inline(s.desc)}</p>${key==='persistent'?'<h3 class="rules-heading">核心规则</h3>':''}${principleList(s.principles,key==='generation'||key==='persistent')}${s.rule?`<p class="rule-note">${key==='generation'||key==='active'?`<strong>${Markdown.inline(s.rule)}</strong>`:`核心原则：${Markdown.inline(s.rule)}`}</p>`:''}${(s.groups||[]).map(group=>`<section class="definition-section" aria-labelledby="definition-${group.id}"><h3 id="definition-${group.id}">${escape(group.title)}</h3><p class="detail-description">${escape(group.desc)}</p>${principleList(group.principles)}${group.rule?`<p class="rule-note">${escape(group.rule)}</p>`:''}</section>`).join('')}`;
}
function renderSelection(){
 $$('[data-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.select===state.selected)));
 $$('[data-region]').forEach(b=>{const selected=b.dataset.region===state.selected&&state.selected!=='overview';b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 $('.active').classList.toggle('selected',state.selected==='active');
 $('.persistent').classList.toggle('selected',state.selected==='persistent');
 $('.workspace').dataset.dsState=state.selected;
}
function renderDetail(){
 copyTexts=[];
 $('#detail').innerHTML=state.selected==='overview'?overview():structureDetail(state.selected);renderSelection();$('.explanation').scrollTop=0;
}
const factState=v=>v===true?'已完成':v===false?'待完成':'未知';
function renderComponent(c,m,v){
 const attrs=`data-component-id="${escape(c.id)}" data-component-type="${escape(c.type)}"`;
 switch(c.type){
 case 'facts-overview':return `<button class="wire-block facts" ${attrs} data-region="persistent" aria-label="Facts GenUI：查看 Persistent UI 定义"><span class="wire-label"><b>02.1</b><strong>Facts GenUI</strong><span class="block-arrow">↗</span></span>${state.example?`<span class="overview-headline">${escape(v.summary.headline)}</span><span class="overview-metrics"><span>${escape(v.summary.date)} · 已确定</span><strong>${v.summary.ready} / ${v.summary.total} 项准备就绪</strong></span><span class="progress-track"><i style="width:${v.summary.ready/v.summary.total*100}%"></i></span><span class="overview-uncertainty">${[v.summary.pending?`${v.summary.pending} 项待完成`:null,v.summary.unknown?`${v.summary.unknown} 项未知`:null].filter(Boolean).join(' · ')||'全部已确认'}</span>`:'<span class="overview-headline">关键事实 · 状态 · 进展</span><span class="skeleton-line"></span>'}</button>`;
 case 'timeline':return `<section class="module-tile" ${attrs}><button class="component-title" data-region="persistent">${state.example?'时间安排':'时间线组件'}<span>↗</span></button>${state.example?`<div class="schedule-flow"><span>《${escape(v.details.movie)}》</span><i>→</i><span>求婚短片</span></div>`:'<i class="skeleton-line"></i>'}</section>`;
 case 'task-list':return `<section class="module-tile" ${attrs}><button class="component-title" data-region="persistent">${state.example?'准备事项':'可操作组件'}<span>↗</span></button>${state.example?`<div class="task-row"><span>短片初稿</span><button data-toggle-memory="draftReady" aria-label="切换短片初稿完成状态" class="state-value ${v.details.draftReady===true?'done':''}">${factState(v.details.draftReady)} ${v.details.draftReady===true?'✓':'○'}</button></div><div class="task-row"><span>片尾试播</span><button data-toggle-memory="playbackReady" aria-label="切换片尾试播完成状态" class="state-value ${v.details.playbackReady===true?'done':''}">${factState(v.details.playbackReady)} ${v.details.playbackReady===true?'✓':'○'}</button></div><div class="task-row"><span>地点</span><span class="state-value">${escape(v.details.venue)||'未知'}</span></div>`:'<i class="skeleton-line"></i><i class="skeleton-line short"></i>'}</section>`;
 case 'material-list':return `<section class="module-tile proposed" ${attrs}><button class="component-title" data-region="persistent">${state.example?'视频素材':'新增组件'}<span>↗</span></button><span class="module-value">${state.example?`求婚短片 · ${v.details.draftReady===true?'初稿完成':'进度未知'}`:'用户已确认'}</span></section>`;
 case 'renovation-scene':return window.FocusRenovationView.render(c,v,state.selectedRoom);
 case 'renovation-log':return `<section class="module-tile proposed" ${attrs}><button class="component-title" data-region="persistent">施工记录<span>↗</span></button><span class="module-value">${escape(v.details.lastUpdate)||'暂无施工更新'}</span></section>`;
 default:throw new Error(`Unregistered renderer: ${c.type}`);
 }
}
function renderWire(){
 const schematic=!state.example;
 $('.example-controls').hidden=schematic;$('.canvas-foot').hidden=schematic;
 $$('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===String(state.example))));
 if(schematic){
  $('#focus-name').textContent='Focus Name';$('.focus-symbol').textContent='✳';
  $('.active').classList.remove('is-quiet');
  $('#active-content').innerHTML='<span class="wireframe-spotlight"><i class="skeleton-line"></i><i class="skeleton-line"></i></span>';
  $('#persistent-content').innerHTML='<button class="wireframe-workspace" data-region="persistent" aria-label="查看 Persistent UI 定义"><span>信息与操作空间</span><i class="skeleton-line"></i><i class="skeleton-line"></i><i class="skeleton-line"></i></button>';
  delete $('.persistent').dataset.organization;$('#chat-label').textContent='Chat';renderSelection();return;
 }
 if(state.error){$('#persistent-content').innerHTML=`<p class="storage-error" role="alert">${escape(state.error)}</p>`;$('#active-content').textContent='';$('#model-status').textContent='需要显式重置';return;}
 // Retired demo suggestions must not mask current attention; keep saved data intact.
 const m=store.snapshot(),v=Model.derive({...m,proposal:null}),e=Examples[m.id];
 $('#focus-name').textContent=state.example?e.name:'Focus Name';$('.focus-symbol').textContent=state.example?e.emoji:'✳';
 $('.active').classList.toggle('is-quiet',v.active.kind==='quiet');
 $('#active-content').innerHTML=v.active.kind==='quiet'?'<span class="active-placeholder"><span class="quiet-tag">Quiet</span></span>':`<span class="spotlight-text">${escape(v.active.message)}</span><button class="inline-action" data-resolve="true">${escape(v.active.action)}</button>`;
 $('#persistent-content').innerHTML=m.schema.persistent.components.filter(c=>!c.hidden).map(c=>renderComponent(c,m,v)).join('');
 $('.persistent').dataset.organization=m.schema.organization;
 $('#chat-label').textContent=state.example?(m.id==='proposal'?'继续讨论求婚安排…':'继续讨论装修进度…'):'Chat';
 $('#model-status').textContent=`Memory r${m.memory.revision} · Schema v${m.schema.version}${store.persistence==='session'?' · 仅当前会话':''}`;
 $$('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===String(state.example))));
 $$('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===m.id)));
 renderSelection();
}
function renderScenario(){
 $$('[data-scenario]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.scenario===state.scenario));b.disabled=!!state.error;});
 if(state.error){$('#scenario-detail').textContent=state.error;return;}
 $('#scenario-detail').innerHTML=`<div class="scenario-copy">${escape(state.notice||store.snapshot().goal)}</div>`;
}
function route(){const url=new URL(location.href);url.searchParams.set('case',state.caseId);url.searchParams.set('view',state.example?'example':'wireframe');url.hash=state.selected;history.replaceState(null,'',url);}
function select(key,scroll=false){
 key=normalizeRegion(key);
 if(key!=='overview'&&key!=='chat'&&!sections[key])return;
 state.selected=key;renderDetail();route();$('#announcer').textContent=key==='overview'?'已显示 Focus Space 总览':`已显示 ${sections[key]?.name||'Chat'} 的原则`;
 if(scroll&&matchMedia('(max-width:800px)').matches)$('.explanation').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
}
function refresh(){renderWire();renderScenario();$('#announcer').textContent=state.notice;}
function reset(){store.reset(state.caseId);state.error='';state.scenario='initial';state.notice='已重新生成当前案例。';refresh();select('overview');}
function scenario(key){
 state.scenario=key;state.example=true;
 if(key==='initial'){reset();return;}
 if(key==='context'||key==='chat'){
  const source=key==='chat'?'chat':'context';
  if(state.caseId==='proposal'){store.patch('draftReady',true,source);state.notice=key==='chat'?'模拟 Chat：「短片初稿完成了。」概览与准备事项已同步。':'模拟 Context：短片初稿完成，概览与准备事项已同步。';}
  else{store.updateRoom('living',80,source);state.selectedRoom='living';state.notice=key==='chat'?'模拟 Chat：「客厅进度到 80% 了。」户型与房间详情已同步。':'模拟施工更新：客厅进度达到 80%，整体进度与房间详情已同步。';}
 }else if(key==='attention'){
  if(state.caseId==='proposal'){store.patch('draftReady',true);store.patch('playbackReady',false);state.notice='模拟临近电影夜：Active UI 提醒安排试播。';}
  else{store.patch('kitchenReviewPending',true);state.selectedRoom='kitchen';state.notice='模拟橱柜安装前：Active UI 提醒复核厨房尺寸。';}
  store.setAttention(true);
 }else if(key==='quiet'){store.resolveAttention();state.notice='已记录处理结果，Active UI 回到 Quiet。';}
 refresh();select({context:'persistent',chat:'chat',attention:'active',quiet:'active'}[key]);
}
function selectRoom(id){state.selectedRoom=id;renderWire();$(`[data-room="${id}"]`)?.focus({preventScroll:true});}
document.addEventListener('click',e=>{
 const room=e.target.closest('[data-room]');if(room){selectRoom(room.dataset.room);return;}
 const b=e.target.closest('button,a.brand');if(!b){const region=e.target.closest('.wire-block.active,.wire-block.persistent');if(region)select(region.classList.contains('active')?'active':'persistent',true);return;}
 if(b.hasAttribute('data-copy'))void copyPrinciple(b);
 else if(b.dataset.region)select(b.dataset.region,true);
 else if(b.dataset.select)select(b.dataset.select);
 else if(b.classList.contains('brand')){e.preventDefault();select('overview');}
 else if(b.dataset.case){state.notice='';state.scenario='';openCase(b.dataset.case);refresh();select('overview');}
 else if(b.dataset.example){state.example=b.dataset.example==='true';renderWire();renderScenario();select(state.example?state.selected:'overview');}
 else if(b.dataset.scenario)scenario(b.dataset.scenario);
 else if(b.dataset.toggleMemory){const key=b.dataset.toggleMemory;store.patch(key,store.snapshot().memory.context[key].value!==true,'direct');state.notice='直接操作已同步到 Memory、Overview 和详情。';refresh();$(`[data-toggle-memory="${key}"]`)?.focus({preventScroll:true});}
 else if(b.dataset.roomProgress){const room=Model.derive(store.snapshot()).scene.items.find(r=>r.id===b.dataset.roomProgress);const value=Math.max(0,Math.min(100,(room.progress??0)+Number(b.dataset.step)));store.updateRoom(room.id,value,'direct');state.notice=`${room.name}装修进度已更新为 ${value}%`;refresh();$(`[data-room-progress="${room.id}"][data-step="${b.dataset.step}"]`)?.focus({preventScroll:true});}
 else if(b.dataset.resolve)scenario('quiet');
 else if(b.id==='reset-button')reset();
 else if(b.id==='theme-button'){const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';b.setAttribute('aria-label',dark?'切换浅色主题':'切换深色主题');}
 else if(b.id==='about-button')$('#about-dialog').showModal();
 else if(b.classList.contains('close-dialog'))$('#about-dialog').close();
});
document.addEventListener('keydown',e=>{const room=e.target.closest('[data-room]');if(room&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectRoom(room.dataset.room);}});
window.addEventListener('hashchange',()=>select(location.hash.slice(1)||'overview'));
openCase(state.caseId);refresh();const requested=normalizeRegion(location.hash.slice(1));select(sections[requested]||requested==='chat'?requested:'overview');
})();
