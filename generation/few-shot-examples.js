(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.FocusExamples=value;})(globalThis,()=>{
 const field=(value,status='confirmed')=>({value,status,source:'演示初始上下文'});
 return {
  proposal:{id:'proposal',name:'平安夜求婚',emoji:'💍',goal:'12 月 24 日，和她及朋友看《真爱至上》，片尾播放求婚视频。',
   evidence:{spatialRelationships:false,independentDomains:true},
   rationale:'时间安排、准备事项与视频素材各自需要查看和操作；用概览综合准备进度，再进入独立详情。',
   memory:{date:field('12 月 24 日','decided'),venue:field(null,'unknown'),draftReady:field(null,'unknown'),playbackReady:field(null,'unknown'),movie:field('真爱至上','decided')},
   composition:[{id:'proposal-overview',type:'facts-overview',binding:'proposal-summary'},{id:'proposal-schedule',type:'timeline',binding:'proposal-schedule'},{id:'proposal-preparations',type:'task-list',binding:'proposal-preparations'}],
   addition:{id:'proposal-materials',type:'material-list',binding:'proposal-materials',title:'视频素材'},
   expected:{organization:'modular',overview:'facts',firstUnderstanding:'时间、准备进度和未决信息可一眼识别；概览综合进度，详情提供具体安排与操作。'}},
  renovation:{id:'renovation',name:'家里装修',emoji:'🏠',goal:'完成新家的装修，随时了解各个房间的施工进度与待处理事项。',
   evidence:{spatialRelationships:true,independentDomains:false},
   rationale:'以同一套户型中的房间位置、施工进度和操作建立对应关系；3D 户型 mock 本身承担整体理解。',
   memory:{livingProgress:field(60),kitchenProgress:field(80),masterProgress:field(40),bedroomProgress:field(20),bathroomProgress:field(100),kitchenReviewPending:field(false),lastUpdate:field(null,'unknown')},
   composition:[{id:'renovation-spatial-view',type:'renovation-scene',binding:'renovation-spatial-state',layout:{objects:[
    {id:'living',name:'客厅',kind:'living',binding:'livingProgress',x:0,y:0,w:5,d:3.8},
    {id:'kitchen',name:'厨房',kind:'kitchen',binding:'kitchenProgress',x:5,y:0,w:3,d:3.8},
    {id:'master',name:'主卧',kind:'bedroom',binding:'masterProgress',x:0,y:3.8,w:3.5,d:3.6},
    {id:'bedroom',name:'次卧',kind:'bedroom',binding:'bedroomProgress',x:3.5,y:3.8,w:2.5,d:3.6},
    {id:'bathroom',name:'卫生间',kind:'bathroom',binding:'bathroomProgress',x:6,y:3.8,w:2,d:3.6}
   ]}}],
   addition:{id:'renovation-updates',type:'renovation-log',binding:'renovation-updates',title:'施工记录'},
   expected:{organization:'integrated',overview:'embedded',firstUnderstanding:'户型、各房间进度及完成状态在同一场景中对应；点击房间可查看并更新进度，不另建 Facts 区域。'}}
 };
});
