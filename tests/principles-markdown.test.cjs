const test=require('node:test');
const assert=require('node:assert/strict');
const Markdown=require('../principles-markdown.js');
const fixture=['00','01','02'].map(n=>`## ${n} · Section ${n}

**Subtitle ${n}**

Description ${n}.

### 1. Rule ${n}
<!-- chat -->

First paragraph.

Second **paragraph**.

- First bullet
- Second bullet
  continued

> **Core ${n}.**`).join('\n\n');

test('preserves multiline prose, bullets, section mapping and Chat annotations',()=>{
 const result=Markdown.parse(fixture.replace(/\n/g,'\r\n'));
 assert.equal(result.active.name,'Section 01');
 assert.equal(result.persistent.title,'Subtitle 02');
 const rule=result.active.principles[0];
 assert.equal(rule[1],'First paragraph.\n\nSecond **paragraph**.');
 assert.deepEqual(rule[2],[['','First bullet'],['','Second bullet\ncontinued']]);
 assert.equal(rule.chat,true);
 assert.match(Markdown.blocksText(rule.blocks),/Second paragraph\./);
});

test('renaming and inserting rules keeps Chat references tied to Markdown markers',()=>{
 const changed=fixture.replace('### 1. Rule 01','### Renamed rule').replace('> **Core 01.**','### New rule\n\nA new paragraph.\n\n> **Core 01.**');
 const rules=Markdown.parse(changed).active.principles;
 assert.equal(rules.length,2);
 assert.equal(rules.find(r=>r.chat)[0],'Renamed rule');
 assert.equal(rules[1].chat,false);
});

test('rejects incomplete and duplicate sections instead of silently displaying stale content',()=>{
 assert.throws(()=>Markdown.parse(fixture.replace('## 02 · Section 02','## Notes')),/缺少分区/);
 assert.throws(()=>Markdown.parse(fixture+'\n\n'+fixture),/重复/);
 assert.throws(()=>Markdown.parse(fixture.replace('**Subtitle 00**','Subtitle 00')),/副标题/);
});

test('renders text formatting and safe links without executing HTML or unsafe URLs',()=>{
 const html=Markdown.inline('**Bold** *italic* `code` <img src=x onerror=alert(1)> [site](https://example.com) [bad](javascript:alert)');
 assert.match(html,/<strong>Bold<\/strong>/);
 assert.match(html,/<em>italic<\/em>/);
 assert.match(html,/&lt;img/);
 assert.match(html,/href="https:\/\/example.com"/);
 assert.doesNotMatch(html,/<img|href="javascript:/);
});

test('loads fresh Markdown and surfaces HTTP errors',async()=>{
 let options;
 const result=await Markdown.load('PRINCIPLES.md',async(_url,opts)=>{options=opts;return {ok:true,text:async()=>fixture};});
 assert.equal(options.cache,'no-store');
 assert.equal(result.generation.principles.length,1);
 await assert.rejects(()=>Markdown.load('PRINCIPLES.md',async()=>({ok:false,status:404})),/404/);
});
