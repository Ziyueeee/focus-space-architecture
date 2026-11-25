(function(root){
  'use strict';
  const keys={'00':'generation','01':'active','02':'persistent'};
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function inline(value){
    const text=String(value),pattern=/`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^\s)]+)\)|\*([^*]+)\*/g;
    let result='',offset=0,match;
    while((match=pattern.exec(text))){
      result+=escape(text.slice(offset,match.index));
      if(match[1])result+=`<code>${escape(match[1])}</code>`;
      else if(match[2])result+=`<strong>${escape(match[2])}</strong>`;
      else if(match[3])result+=/^https?:\/\//i.test(match[4])?`<a href="${escape(match[4])}" target="_blank" rel="noopener noreferrer">${escape(match[3])}</a>`:escape(match[3]);
      else result+=`<em>${escape(match[5])}</em>`;
      offset=pattern.lastIndex;
    }
    return result+escape(text.slice(offset));
  }
  function plain(value){
    return String(value).replace(/`([^`]+)`/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/\[([^\]]+)\]\(([^\s)]+)\)/g,'$1 ($2)');
  }
  function blocks(lines){
    const result=[];let paragraph=[],list=null;
    const flush=()=>{if(paragraph.length){result.push({type:'paragraph',text:paragraph.join('\n').trim()});paragraph=[];}list=null;};
    for(const raw of lines){
      const line=raw.trim();
      if(!line){flush();continue;}
      const bullet=line.match(/^([-*+]|\d+[.)])\s+(.+)$/);
      if(bullet){
        const ordered=/\d/.test(bullet[1]);
        if(!list||list.ordered!==ordered){flush();list={type:'list',ordered,items:[]};result.push(list);}
        list.items.push(bullet[2]);
      }else if(list&&/^\s+/.test(raw))list.items[list.items.length-1]+='\n'+line;
      else{if(list)flush();paragraph.push(line);}
    }
    flush();return result;
  }
  function renderBlocks(items){
    return items.map(block=>block.type==='paragraph'?`<p>${inline(block.text)}</p>`:`<${block.ordered?'ol':'ul'} class="subrules subrule-bullets">${block.items.map(item=>`<li>${inline(item)}</li>`).join('')}</${block.ordered?'ol':'ul'}>`).join('');
  }
  function blocksText(items){
    return items.map(block=>block.type==='paragraph'?plain(block.text):block.items.map((text,i)=>`${block.ordered?`${i+1}.`:'-'} ${plain(text)}`).join('\n')).join('\n\n');
  }
  function parse(markdown){
    const sections={};let section=null,rule=null,header=[];
    function finishRule(){
      if(!rule)return;
      const content=blocks(rule.lines);
      const body=content.filter(b=>b.type==='paragraph').map(b=>b.text).join('\n\n');
      const children=content.filter(b=>b.type==='list').flatMap(b=>b.items.map(text=>['',text]));
      const item=[rule.title,body];if(children.length)item.push(children);
      item.blocks=content;item.chat=rule.chat;
      section.principles.push(item);rule=null;
    }
    function finishSection(){
      if(!section)return;
      finishRule();
      const lines=header.filter(l=>l.trim());
      const subtitle=lines.shift()?.match(/^\*\*(.+)\*\*$/);
      if(!subtitle)throw new Error(`分区 ${section.n} 缺少加粗副标题`);
      section.title=subtitle[1];
      section.desc=header.slice(header.findIndex(l=>l.trim())+1).join('\n').trim();
      if(!section.desc||!section.rule||!section.principles.length)throw new Error(`分区 ${section.n} 内容不完整`);
      section=null;header=[];
    }
    for(const raw of String(markdown).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split('\n')){
      const line=raw.trim();
      if(/^##\s/.test(line)){
        finishSection();
        const match=line.match(/^##\s+(00|01|02)\s*[·.:：-]\s*(.+)$/);
        if(match){const key=keys[match[1]];if(sections[key])throw new Error(`分区 ${match[1]} 重复`);section=sections[key]={n:match[1],name:plain(match[2]),title:'',desc:'',principles:[],rule:''};}
        continue;
      }
      if(!section)continue;
      if(line==='<!-- chat -->'){if(rule)rule.chat=true;continue;}
      if(/^<!--.*-->$/.test(line))continue;
      const heading=line.match(/^###\s+(.+)$/);
      if(heading){finishRule();rule={title:heading[1].replace(/^\d+[.)]\s+/,''),lines:[],chat:false};continue;}
      if(/^>\s?/.test(line)){
        finishRule();const text=line.replace(/^>\s?/,'').replace(/^\*\*(.+)\*\*$/,'$1');
        section.rule+=(section.rule?'\n':'')+text;continue;
      }
      if(rule)rule.lines.push(raw);else if(!section.rule)header.push(raw);
    }
    finishSection();
    for(const key of Object.values(keys))if(!sections[key])throw new Error(`缺少分区 ${key}`);
    return sections;
  }
  async function load(url,fetcher=globalThis.fetch){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetcher(url,{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error(`原则文档读取失败（${response.status}）`);
      return parse(await response.text());
    }finally{clearTimeout(timeout);}
  }
  const api={parse,load,inline,plain,renderBlocks,blocksText};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.FocusPrinciplesMarkdown=api;
})(globalThis);
