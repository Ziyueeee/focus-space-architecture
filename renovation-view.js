// Isometric 3D mock: room geometry comes from the saved UI Schema.
// Progress is read from the same Focus Memory as the inspector and Active UI.
window.FocusRenovationView=(()=>{
 'use strict';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const project=(x,y,z=0)=>[184+(x-y)*19,48+(x+y)*10.5-z*20];
 const points=vertices=>vertices.map(v=>project(...v).map(n=>n.toFixed(1)).join(',')).join(' ');
 const face=(vertices,cls)=>`<polygon class="${cls}" points="${points(vertices)}"/>`;
 function box(x,y,w,d,h,cls='furniture'){
  return `<g class="${cls}" aria-hidden="true">${face([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],'block-front')}${face([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'block-side')}${face([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],'block-top')}</g>`;
 }
 function furnishings(room){
  const {x,y,w,d,kind}=room;
  if(kind==='living')return box(x+.5,y+.5,2.7,.75,.4,'sofa')+box(x+.5,y+.45,2.7,.2,.8,'sofa')+box(x+.45,y+.5,.22,.8,.65,'sofa')+box(x+3.7,y+.55,.8,.5,.5,'cabinet')+face([[x+1,y+1.5,.01],[x+3.3,y+1.5,.01],[x+3.3,y+2.7,.01],[x+1,y+2.7,.01]],'rug')+box(x+1.65,y+1.65,1,.65,.3,'table');
  if(kind==='bedroom'){const bedWidth=Math.min(w-1,1.6);return box(x+.45,y+.55,bedWidth,1.85,.38,'bed')+box(x+.45,y+.45,bedWidth,.18,.8,'bed-head')+box(x+.58,y+.64,bedWidth-.26,.4,.42,'pillow')+box(x+w-.65,y+.5,.45,.5,.45,'cabinet');}
  if(kind==='kitchen')return box(x+.25,y+.35,w-.5,.6,.6,'counter')+box(x+w-.85,y+.35,.6,1.8,.6,'counter')+face([[x+.55,y+.45,.62],[x+1.3,y+.45,.62],[x+1.3,y+.82,.62],[x+.55,y+.82,.62]],'sink')+box(x+.25,y+1.4,.7,.65,.45,'island');
  return box(x+.25,y+.4,w-.5,.65,.1,'shower')+box(x+.3,y+1.3,.55,.8,.4,'bath-fixture')+box(x+w-.7,y+1.3,.45,.65,.55,'counter');
 }
 const status=p=>p===null?'进度待确认':p===100?'已完成':p===0?'未开始':'施工中';
 function roomView(room,selected){
  const {x,y,w,d,progress}=room;
  const [lx,ly]=project(x+w/2,y+d*(room.kind==='bathroom'?.64:.77),.04);
  return `<g class="room-unit${progress===100?' complete':''}" data-room="${escape(room.id)}" role="button" tabindex="0" aria-pressed="${selected}" aria-label="${escape(room.name)}，${progress===null?'进度待确认':`装修进度 ${progress}%`}，点击查看"><title>${escape(room.name)} · ${progress===null?'待确认':progress+'%'}</title>${face([[x+.04,y+.04,0],[x+w-.04,y+.04,0],[x+w-.04,y+d-.04,0],[x+.04,y+d-.04,0]],'room-floor')}${furnishings(room)}<g class="room-tag" transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)})" aria-hidden="true"><rect x="-24" y="-16" width="48" height="33" rx="5"/><text y="-2">${escape(room.name)}</text><text class="room-progress" y="11">${progress===null?'待确认':progress+'%'}</text></g></g>`;
 }
 function render(component,view,selectedRoom){
  const {items}=view.scene,selected=items.find(x=>x.id===selectedRoom)||items[0];
  const maxX=Math.max(...items.map(r=>r.x+r.w)),maxY=Math.max(...items.map(r=>r.y+r.d));
  const outline=face([[0,0,-.5],[maxX,0,-.5],[maxX,maxY,-.5],[0,maxY,-.5]],'home-shadow');
  const slab=`<g class="home-base">${face([[0,maxY,-.4],[maxX,maxY,-.4],[maxX,maxY,0],[0,maxY,0]],'block-front')}${face([[maxX,0,-.4],[maxX,maxY,-.4],[maxX,maxY,0],[maxX,0,0]],'block-side')}</g>`;
  const walls=face([[0,0,0],[maxX,0,0],[maxX,0,1.5],[0,0,1.5]],'wall-back')+face([[0,0,0],[0,maxY,0],[0,maxY,1.5],[0,0,1.5]],'wall-side');
  const windows=face([[1,0,.55],[3.9,0,.55],[3.9,0,1.24],[1,0,1.24]],'model-window')+face([[0,4.4,.55],[0,6.65,.55],[0,6.65,1.24],[0,4.4,1.24]],'model-window');
  return `<section class="renovation-scene" data-component-id="${escape(component.id)}" data-component-type="renovation-scene" aria-label="装修户型与房间进度"><div class="renovation-summary"><div><span>整体进度</span><strong data-overall-progress>${view.summary.progress===null?'待补充':view.summary.progress+'%'}</strong></div><div class="model-caption"><span class="mock-label">3D mock</span><span>${view.summary.ready} / ${view.summary.total} 个房间完成</span></div></div><svg class="home-model" viewBox="18 0 342 235" role="group" aria-label="可点击的家装 3D 户型模型"><g aria-hidden="true">${outline}${slab}${walls}${windows}</g>${items.map(r=>roomView(r,r.id===selected.id)).join('')}</svg><div class="room-inspector" data-selected-room="${escape(selected.id)}"><div class="room-meta"><strong>${escape(selected.name)}</strong><span>${status(selected.progress)}</span></div><div class="progress-editor" role="group" aria-label="调整${escape(selected.name)}装修进度"><button data-room-progress="${escape(selected.id)}" data-step="-10" aria-label="${escape(selected.name)}进度减少 10%" title="进度减少 10%" ${selected.progress===null||selected.progress===0?'disabled':''}>−</button><output aria-label="${escape(selected.name)}当前进度">${selected.progress===null?'—':selected.progress}<small>%</small></output><button data-room-progress="${escape(selected.id)}" data-step="10" aria-label="${escape(selected.name)}进度增加 10%" title="进度增加 10%" ${selected.progress===100?'disabled':''}>＋</button></div></div><div class="room-progress-track" role="progressbar" aria-label="${escape(selected.name)}装修进度" aria-valuemin="0" aria-valuemax="100" ${selected.progress===null?'aria-valuetext="进度待确认"':`aria-valuenow="${selected.progress}"`}><i style="width:${selected.progress??0}%"></i></div></section>`;
 }
 return {render};
})();
