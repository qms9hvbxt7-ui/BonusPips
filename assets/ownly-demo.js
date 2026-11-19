'use strict';
(() => {
  const key='bonuspips-ownly-demo-v1', byId=id=>document.getElementById(id);
  const form=byId('item-form'), list=byId('vault-list'), status=byId('vault-status');
  let records=[];let saved=false;
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
  const dateText=s=>validDate(s)?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z')):'Not set';
  const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(16).slice(2);
  function safeURL(s){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
  function ends(item){if(!item.months)return null;const [y,m,d]=item.date.split('-').map(Number);const first=new Date(Date.UTC(y,m-1+item.months,1));const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();first.setUTCDate(Math.min(d,last));return first.toISOString().slice(0,10);}
  function state(item){const end=ends(item);if(!end)return {id:'none',label:'No warranty date',end:null};const days=Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(today()+'T00:00:00Z'))/86400000);return {id:days<0?'expired':days<=30?'soon':'active',label:days<0?'Warranty period ended':days<=30?'Ending within 30 days':'In warranty period',end};}
  function cleanRecord(x){return x&&typeof x.id==='string'&&typeof x.name==='string'&&x.name.trim().length>0&&x.name.length<=100&&validDate(x.date)&&x.date<=today()&&Number.isInteger(x.months)&&x.months>=0&&x.months<=120?{id:x.id.slice(0,100),name:x.name,category:['Electronics','Home','Creative tools','Other'].includes(x.category)?x.category:'Other',date:x.date,months:x.months,receipt:safeURL(x.receipt),note:typeof x.note==='string'?x.note.slice(0,1000):'',sample:x.sample===true}:null;}
  function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
  function dirty(){saved=false;byId('vault-mode').textContent='Unsaved changes';}
  function render(){
    const query=byId('vault-search').value.toLowerCase().trim(),filter=byId('vault-filter').value;
    byId('total-count').textContent=records.length;
    byId('active-count').textContent=records.filter(i=>['active','soon'].includes(state(i).id)).length;
    byId('soon-count').textContent=records.filter(i=>state(i).id==='soon').length;
    list.replaceChildren();
    const visible=records.filter(i=>(i.name+' '+i.category).toLowerCase().includes(query)&&(filter==='all'||(filter==='active'?['active','soon'].includes(state(i).id):state(i).id===filter)));
    if(!visible.length){list.append(el('p',records.length?'No items match this search or filter.':'Your vault is empty. Add an item or load the sample collection.','empty'));return;}
    visible.forEach(item=>{
      const box=el('article',undefined,'item'),head=el('div',undefined,'item-head'),s=state(item);
      head.append(el('h3',item.name),el('span',s.label,'pill'));box.append(head);
      box.append(el('p',(item.sample?'Sample item · ':'')+item.category+' · Purchased '+dateText(item.date),'small'));
      if(s.end)box.append(el('p','Entered warranty period ends '+dateText(s.end),'small'));
      if(item.note)box.append(el('p',item.note,'small'));
      const actions=el('div',undefined,'tool-actions'),edit=el('button','Edit','mini-button'),remove=el('button','Remove','mini-button');edit.type=remove.type='button';
      edit.setAttribute('aria-label','Edit '+item.name);remove.setAttribute('aria-label','Remove '+item.name);
      edit.addEventListener('click',()=>{byId('item-id').value=item.id;byId('item-name').value=item.name;byId('item-category').value=item.category;byId('item-date').value=item.date;byId('item-warranty').value=item.months;byId('item-receipt').value=item.receipt;byId('item-note').value=item.note;byId('save-item').textContent='Update item';byId('cancel-edit').hidden=false;byId('item-name').focus();});
      remove.addEventListener('click',()=>{records=records.filter(i=>i.id!==item.id);dirty();render();status.textContent='Item removed from this session. Choose Save in this browser to update the stored copy.';});actions.append(edit,remove);
      if(item.receipt){const a=el('a','Open receipt link','mini-button');a.href=item.receipt;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}
      box.append(actions);list.append(box);
    });
  }
  function resetForm(){form.reset();byId('item-id').value='';byId('save-item').textContent='Add to demo vault';byId('cancel-edit').hidden=true;}
  byId('item-date').max=today();
  form.addEventListener('submit',event=>{event.preventDefault();const name=byId('item-name').value.trim(),date=byId('item-date').value,months=Number(byId('item-warranty').value),receiptRaw=byId('item-receipt').value.trim(),receipt=safeURL(receiptRaw);if(!name||!validDate(date)||date>today()||!Number.isInteger(months)||months<0||months>120){byId('item-status').textContent='Enter an item name, a valid purchase date no later than today and a warranty from 0 to 120 months.';return;}if(receiptRaw&&!receipt){byId('item-status').textContent='Use a complete http or https receipt link, or leave it blank.';return;}const id=byId('item-id').value;const item={id:id||uid(),name,category:byId('item-category').value,date,months,receipt,note:byId('item-note').value.trim(),sample:false};if(id)records=records.map(i=>i.id===id?item:i);else records.push(item);dirty();render();resetForm();byId('item-status').textContent='Item '+(id?'updated':'added')+' in this session. It has not been uploaded.';});
  byId('cancel-edit').addEventListener('click',resetForm);
  byId('vault-search').addEventListener('input',render);byId('vault-filter').addEventListener('change',render);
  byId('load-sample').addEventListener('click',()=>{if(records.length){status.textContent='Samples load into an empty vault. Clear the current session first, or keep working with your items.';return;}const shift=days=>{const d=new Date(today()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);};records=[{name:'Example headphones',category:'Electronics',date:shift(-60),months:12},{name:'Example desk lamp',category:'Home',date:shift(-350),months:12},{name:'Example sketchbook',category:'Creative tools',date:shift(-20),months:0}].map(i=>({...i,id:uid(),receipt:'',note:'Illustrative sample, not a real possession.',sample:true}));dirty();render();status.textContent='Three illustrative sample items loaded. Nothing has been saved or uploaded.';});
  byId('save-vault').addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify({schema:1,items:records}));saved=true;byId('vault-mode').textContent='Saved in this browser';status.textContent='Saved only in this browser, without encryption. No cloud upload.';}catch{status.textContent='Browser saving is unavailable. Export a JSON copy instead; this session still works.';}});
  byId('export-vault').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({product:'Ownly public demo',schema:1,exportedAt:new Date().toISOString(),items:records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ownly-demo-vault.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='JSON download requested. It contains your current demo items and was not sent to BonusPips.';});
  byId('clear-vault').addEventListener('click',()=>{if(!confirm('Clear the current demo vault and its saved browser copy? Export anything you need first.'))return;try{localStorage.removeItem(key);status.textContent='Demo vault and saved browser copy cleared.';}catch{status.textContent='Session cleared, but stored data could not be removed. Clear this site’s data in browser settings.';}records=[];saved=false;byId('vault-mode').textContent='Unsaved session';resetForm();render();});
  try{const raw=localStorage.getItem(key);if(raw){const data=JSON.parse(raw);if(data.schema===1&&Array.isArray(data.items)){records=data.items.slice(0,500).map(cleanRecord).filter(Boolean);saved=true;byId('vault-mode').textContent='Loaded from this browser';status.textContent='Loaded your previously saved demo items.';}else status.textContent='Stored demo data was not recognised. The stored copy has not been changed.';}}catch{status.textContent='Saved data could not be loaded. The current session still works.';}
  render();
})();
