'use strict';
(() => {
 const root=document.getElementById('work-view'),message=document.getElementById('work-message');
 const id=new URLSearchParams(window.location.search).get('id');
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
 fetch('/data/artworks.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  const work=Array.isArray(data)?data.find(w=>w&&w.id===id):null;
  if(!work||typeof work.title!=='string'||typeof work.image!=='string'||!/^\/assets\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp)$/.test(work.image)||typeof work.dimensions!=='string'||typeof work.medium!=='string'||!['available','sold'].includes(work.status)||(work.price!==null&&(typeof work.price!=='number'||!Number.isFinite(work.price)||work.price<0)))throw Error();
  document.title=work.title+' | Dhmx Arts | BonusPips';
  const presentation=el('div',undefined,'work-presentation'),image=el('img');image.className='work-image';image.src=work.image;image.alt=typeof work.imageAlt==='string'?work.imageAlt:work.title+' artwork presentation';presentation.append(image);
  if(work.signatureEmbedded!==true){const signatureRow=el('div',undefined,'artwork-signature-row'),signature=el('img');signature.className='artist-signature';signature.src='/assets/dhmx-artist-signature.png';signature.alt='Samuel Yakub artist signature mark';signatureRow.append(signature);presentation.append(signatureRow);}
  const details=el('div',undefined,'work-details');details.append(el('p','Dhmx Arts · A BonusPips brand','eyebrow'),el('h1',work.title),el('span',work.status==='sold'?'Sold':'Available to enquire','pill'));
  if(typeof work.artist==='string')details.append(el('p','By '+work.artist,'edition'));
  if(work.price!==null)details.append(el('p',new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:Number.isInteger(work.price)?0:2,maximumFractionDigits:2}).format(work.price),'price'));
  if(typeof work.edition==='string')details.append(el('p',work.edition,'edition'));
  details.append(el('p',work.medium),el('p',work.dimensions,'small'));
  if(typeof work.description==='string')details.append(el('p',work.description));
  details.append(el('p','Artist-set asking price. The online signature is a presentation mark. Physical format, signing and purchase details are confirmed on enquiry.','small muted'));
  if(work.status==='available'){const enquire=el('a','Enquire about this work','button dark');enquire.href='mailto:Dhmx.co@gmail.com?subject='+encodeURIComponent('Dhmx Arts — '+work.title+' ['+work.id+']');details.append(enquire);}
  root.className='work-layout';root.replaceChildren(presentation,details);message.textContent='';
 }).catch(()=>{message.textContent='This artwork could not be loaded. Return to the collection to choose a work or email Dhmx.co@gmail.com.';root.replaceChildren();});
})();
