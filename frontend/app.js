import {demoPRs, englishDemoPRs} from './data.js';
import {filterPRs,formatSeconds} from './logic.js';
import {analyzePR,readHealth} from './api.js';
import {translate, localeFor} from './i18n.js';
const $=s=>document.querySelector(s);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHTML;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{toast(t('storageError'))}};
let language=read('oss-language','tr')==='en'?'en':'tr';
const t=(key,values)=>translate(language,key,values);
let prs=[...demoPRs],page='dashboard',currentId=null,settings=read('oss-settings',{mode:'demo',url:location.origin});
if(!settings || !['demo','api'].includes(settings.mode)||typeof settings.url!=='string')settings={mode:'demo',url:location.origin};
if(settings.url==='http://localhost:8000' && location.origin==='http://127.0.0.1:8000')settings.url=location.origin;
let backendHealth={status:'unknown',model:null};
let healthRequest=0;
let filters={search:'',category:'',risk:'',sort:'newest'};
let riskNames={low:t('low'),medium:t('medium'),high:t('high')};
const date=value=>new Date(value).toLocaleDateString(localeFor(language),{day:'numeric',month:'short'});
const pill=(value,kind=value)=>`<span class="pill ${e(kind)}">${e(value)}</span>`;
const quality=p=>`<span class="quality"><span class="quality-bar ${p.quality<3?'low':''}" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<p.quality?'filled':''}"></i>`).join('')}</span><span>${p.quality}<span class="muted">/5</span></span></span>`;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
function stats(){return `<div class="cards">${[
 [t('total'),prs.length,'⑂',t('totalNote')],[t('highRisk'),prs.filter(p=>p.risk==='high').length,'◇',t('highNote')],[t('spam'),prs.filter(p=>p.category==='spam').length,'⊘',t('spamNote')],[t('ready'),prs.filter(p=>p.quality>=4&&p.risk==='low'&&!p.needs_human).length,'✓',t('readyNote')]
 ].map(([name,count,icon,note])=>`<div class="stat"><div class="stat-top">${name}<span class="stat-icon">${icon}</span></div><strong>${String(count).padStart(2,'0')}</strong><small>${note}</small></div>`).join('')}</div>`}
function activity(){const days=Array.from({length:7},(_,i)=>{const d=new Date(Math.max(...prs.map(p=>new Date(p.created_at))));d.setDate(d.getDate()-6+i);const key=d.toLocaleDateString(localeFor(language));return {label:d.toLocaleDateString(localeFor(language),{day:'numeric',month:'short'}),count:prs.filter(p=>new Date(p.created_at).toLocaleDateString(localeFor(language))===key).length}});const max=Math.max(4,...days.map(d=>d.count));return `<section class="panel"><div class="panel-heading"><h2>${t('activity')}</h2><span class="muted">${t('sevenDays')}</span></div><div class="chart-legend"><span><i></i>${t('incoming')}</span><span>${t('sampleActivity')}</span></div><div class="chart"><svg viewBox="0 0 510 155" role="img" aria-label="${t('activityLabel')}: ${days.map(d=>`${d.label}: ${d.count}`).join(', ')}">${[0,1,2,3].map(i=>`<line x1="24" y1="${15+i*35}" x2="500" y2="${15+i*35}"/><text x="3" y="${18+i*35}">${Math.round(max*(1-i/3))}</text>`).join('')}${days.map((d,i)=>`<rect x="${43+i*66}" y="${120-d.count/max*105}" width="25" height="${d.count/max*105}" rx="3" fill="${i===6?'#38876a':'#b0d1bf'}"/><text text-anchor="middle" x="${55+i*66}" y="143">${d.label}</text>`).join('')}</svg></div></section>`}
function risks(){const low=prs.filter(p=>p.risk==='low').length,medium=prs.filter(p=>p.risk==='medium').length;return `<section class="panel"><div class="panel-heading"><h2>${t('riskDistribution')}</h2><span class="muted">${t('allPRs')}</span></div><div class="risk-body"><div class="donut" style="--low:${low/prs.length*100}%;--medium:${(low+medium)/prs.length*100}%"><div class="donut-center"><strong>${prs.length}</strong><small>pull request</small></div></div><div class="risk-key">${['low','medium','high'].map(r=>`<div><span class="dot ${r}"></span>${riskNames[r]}<b>${prs.filter(p=>p.risk===r).length}</b></div>`).join('')}</div></div></section>`}
function table(){return `<section class="panel table-panel"><div class="panel-heading"><h2>${page==='dashboard'?t('recent'):t('queue')} <span class="muted"> / ${prs.length}</span></h2>${page==='dashboard'?`<a class="text-button" href="#pull-requests">${t('viewAll')}</a>`:`<span class="muted">${t('queueNote')}</span>`}</div><div class="table-tools"><div class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" aria-label="${t('search')}" placeholder="${t('searchPlaceholder')}" value="${e(filters.search)}"></div><select id="category" aria-label="${t('categoryFilter')}"><option value="">${t('allCategories')}</option>${['bugfix','feature','docs','typo','refactor','spam','other'].map(c=>`<option ${filters.category===c?'selected':''}>${c}</option>`).join('')}</select><select id="risk" aria-label="${t('riskFilter')}"><option value="">${t('allRisks')}</option>${Object.entries(riskNames).map(([r,n])=>`<option value="${r}" ${filters.risk===r?'selected':''}>${t('riskLabel',{risk:n})}</option>`).join('')}</select><select id="sort" aria-label="${t('sort')}">${[['newest',t('newest')],['oldest',t('oldest')],['quality-desc',t('qualityDesc')],['quality-asc',t('qualityAsc')],['risk-desc',t('riskDesc')]].map(([v,n])=>`<option value="${v}" ${filters.sort===v?'selected':''}>${n}</option>`).join('')}</select></div><div class="table-wrap"><table><thead><tr><th>PULL REQUEST</th><th>${t('category')}</th><th>${t('quality')}</th><th>${t('risk')}</th><th>${t('contributor')}</th><th>${t('date')}</th><th><span class="muted">${t('detail')}</span></th></tr></thead><tbody id="pr-rows"></tbody></table></div><div class="table-bottom"><span id="result-count" aria-live="polite"></span><button id="clear-filters">${t('clear')}</button></div></section>`}
function renderRows(){const matches=filterPRs(prs.map(viewPR),filters);const visible=page==='dashboard'?matches.slice(0,5):matches;$('#pr-rows').innerHTML=visible.length?visible.map(p=>`<tr><td><div class="pr-cell"><span class="pr-symbol">⑂</span><div><button class="pr-title" data-detail="${p.id}">${e(p.title)}</button><div class="pr-meta">#${p.id} · localhost / prism-review ${p.injection?` · ⚠ ${t('suspicious')}`:''} · ${p.source==='demo'?t('demo'):t('api')}</div></div></div></td><td>${pill(p.category)}</td><td>${quality(p)}</td><td>${pill(riskNames[p.risk],p.risk)}</td><td><span class="author"><span class="author-circle">${e(p.author.slice(0,1).toUpperCase())}</span>${e(p.author)}</span></td><td class="date">${date(p.created_at)}</td><td><button class="text-button" data-detail="${p.id}" aria-label="${e(t('openDetail',{title:p.title}))}">↗</button></td></tr>`).join(''):`<tr><td colspan="7"><div class="empty">${t('empty')}<br><small>${t('emptyHelp')}</small></div></td></tr>`;$('#result-count').textContent=t('results',{total:matches.length,visible:visible.length});}
function render(){translateStaticUI();page=location.hash==='#pull-requests'?'pull-requests':location.hash==='#analytics'?'analytics':'dashboard';const title={dashboard:t('dashboardTitle'), 'pull-requests':t('pullRequests'),analytics:t('analyticsTitle')}[page];$('#breadcrumb').textContent={dashboard:t('overview'),'pull-requests':t('pullRequests'),analytics:t('analytics')}[page];document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('#nav-count').textContent=prs.length;renderModelStatus();$('#main').innerHTML=`<section class="heading"><div><p class="eyebrow">${t('eyebrow')}</p><h1>${title}</h1><p class="subtitle">${page==='pull-requests'?t('prsSubtitle'):page==='analytics'?t('analyticsSubtitle'):t('dashboardSubtitle')}</p></div><div class="heading-actions"><button id="export">${t('export')}</button><button class="primary" id="add">${t('add')}</button></div></section><div class="human-note"><span>♧</span><div><strong>${t('humanTitle')}</strong> ${t('humanBody')}</div></div><div class="repo-strip"><span class="repo-icon">▣</span><b>localhost <span class="sep">/</span> prism-review</b><span class="pill">${t('openSource')}</span><span>${t('sampleRepo')}</span></div>${stats()}${page!=='pull-requests'?`<div class="overview-grid">${activity()}${risks()}</div>`:''}${page==='analytics'?analytics():table()}`;if(page!=='analytics'){renderRows();$('#search').addEventListener('input',ev=>{filters.search=ev.target.value;renderRows()});['category','risk','sort'].forEach(key=>$('#'+key).addEventListener('change',ev=>{filters[key]=ev.target.value;renderRows()}));$('#clear-filters').onclick=()=>{filters={search:'',category:'',risk:'',sort:'newest'};render()};}$('#add').onclick=()=>$('#add-dialog').showModal();$('#export').onclick=exportCSV;}
function analytics(){return `<section class="panel"><div class="panel-heading"><h2>${t('categoriesTitle')}</h2><span class="muted">${prs.length} PR</span></div><div class="category-bars">${['bugfix','feature','docs','typo','refactor','spam','other'].map(c=>{const n=prs.filter(p=>p.category===c).length;return `<div class="category-row"><span>${c}</span><div class="track"><span style="width:${n/prs.length*100}%"></span></div><b>${n}</b></div>`}).join('')}</div><div class="analytics-note">${t('average')}: <strong>${(prs.reduce((n,p)=>n+p.quality,0)/prs.length).toLocaleString(localeFor(language),{minimumFractionDigits:1,maximumFractionDigits:1})} / 5</strong> · ${t('humanCount')}: <strong>${prs.filter(p=>p.needs_human).length} PR</strong><br>${t('analyticsHelp')}</div></section>`}
function detail(id){const original=prs.find(p=>p.id===Number(id));if(!original)return;const p=viewPR(original);currentId=p.id;$('#detail-content').innerHTML=`<div class="dialog-heading"><div><p class="eyebrow">PULL REQUEST #${p.id} · ${p.source==='demo'?t('demoAssessment'):t('apiAssessment')+' · '+e(modelLabel(p.modelState))}</p><h2>${e(p.title)}</h2><p class="muted">${e(p.author)} · ${date(p.created_at)}</p></div><button class="icon-button close-dialog" aria-label="${t('close')}">×</button></div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${pill(p.category)}${pill(t('riskLabel',{risk:riskNames[p.risk]}),p.risk)}${quality(p)}${Number.isFinite(p.durationSeconds)?`<span class="pill" title="${t('durationNote')}">${t('duration',{seconds:formatSeconds(p.durationSeconds,language)})}</span>`:''}${p.needs_human?pill(t('humanRequired'),'medium'):''}</div>${p.injection?`<div class="warning"><strong>${t('injectionTitle')}</strong><br>${t('injectionBody')}</div>`:''}<div class="detail-grid"><div><section class="detail-section detail-summary"><h3>${t('summary')}</h3><p>${e(p.summary)}</p></section><section class="detail-section"><h3>${t('diff')}</h3><div class="diff">${p.diff.split('\n').map(line=>`<span class="${line.startsWith('+')&&!line.startsWith('+++')?'add':line.startsWith('-')&&!line.startsWith('---')?'remove':''}">${e(line)||' '}</span>`).join('')}</div></section></div><div><section class="detail-section"><h3>${t('reasons')}</h3><ul>${p.reasons.map(r=>`<li>${e(r)}</li>`).join('')}</ul></section><section class="detail-section"><h3>${t('missing')}</h3><ul>${p.missing.map(r=>`<li>${e(r)}</li>`).join('')}</ul></section><section class="detail-section"><h3>${t('reply')}</h3><p>${t('replyHelp')}</p><textarea id="reply" aria-label="${t('replyLabel')}" rows="6">${e(p.suggested_reply)}</textarea><button id="copy-reply" style="margin-top:10px">${t('copy')}</button></section></div></div>`;if(!$('#detail-dialog').open)$('#detail-dialog').showModal();$('#reply').oninput=ev=>{original.replyDraft=ev.target.value};$('#copy-reply').onclick=async()=>{try{await navigator.clipboard.writeText($('#reply').value);toast(t('copied'))}catch{$('#reply').select();toast(t('copyFallback'))}};}
function exportCSV(){const safe=value=>`"${String(value).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')}"`;const items=filterPRs(prs.map(viewPR),filters);const csv='\uFEFF'+[['csvPR','csvTitle','csvCategory','csvQuality','csvRisk','csvAuthor','csvDate','csvSource'].map(key=>t(key)),...items.map(p=>[p.id,p.title,p.category,p.quality,p.risk,p.author,p.created_at,p.source])].map(row=>row.map(safe).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='prism-review-prs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t('exported',{count:items.length}))}
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-detail]');if(button)detail(button.dataset.detail);if(ev.target.closest('.close-dialog'))ev.target.closest('dialog').close()});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',ev=>{if(ev.target===d){const r=d.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)d.close()}}));
$('#theme').onclick=()=>{document.body.classList.toggle('dark');save('oss-theme',document.body.classList.contains('dark'))};document.body.classList.toggle('dark',read('oss-theme',false)===true);
$('#settings').onclick=()=>{const form=$('#settings-form');form.elements.mode.value=settings.mode;form.elements.url.value=settings.url;$('#settings-dialog').showModal()};
$('#settings-form').onsubmit=ev=>{
  ev.preventDefault();
  const fields=new FormData(ev.target);
  const url=new URL(fields.get('url'));
  if(!['http:','https:'].includes(url.protocol)){toast(t('invalidUrl'));return;}
  settings={mode:fields.get('mode'),url:url.href.replace(/\/$/,'')};
  save('oss-settings',settings);
  $('#settings-dialog').close();
  render();
  toast(t('settingsSaved'));
  refreshHealth();
};
let submitting=false;
$('#triage-form').onsubmit=async ev=>{
  ev.preventDefault();
  if(submitting)return;
  const form=ev.target;
  const fields=new FormData(form);
  const input={title:fields.get('title').trim(),description:fields.get('description').trim(),diff:fields.get('diff').trim()};
  const error=form.querySelector('.form-error');
  error.textContent='';
  if(!input.title || !input.diff){error.textContent=t('required');return;}
  const button=form.querySelector('[type=submit]');
  const requestSettings={...settings};
  submitting=true;
  button.disabled=true;
  $('[data-language]').disabled=true;
  button.textContent=t('analyzing');
  const progress=$('#analysis-progress');
  progress.hidden=false;
  $('#analysis-progress-message').textContent=t(requestSettings.mode==='api'?'loadingAPI':'loadingDemo');
  let startedAt=performance.now();
  let durationSeconds=null;
  let modelState=null;
  const updateElapsed=()=>{$('#analysis-elapsed').textContent=t('elapsed',{seconds:formatSeconds((performance.now()-startedAt)/1000,language)});};
  updateElapsed();
  const elapsedTimer=setInterval(updateElapsed,200);
  try{
    let analysis;
    if(requestSettings.mode==='api'){
      modelState=await readHealth({baseUrl:requestSettings.url});
      if(settings.url===requestSettings.url){backendHealth=modelState;renderModelStatus();}
      $('#analysis-progress-message').textContent=modelState.model && modelState.model!=='fake'?t('loadingModel',{model:modelState.model}):t('loadingAPI');
      startedAt=performance.now();
      analysis=await analyzePR(input,{baseUrl:requestSettings.url});
      durationSeconds=(performance.now()-startedAt)/1000;
    }else{
      const suspicious=/ignore.{0,25}instruction|önceki talimat|bunu onayla|or\s+True/i.test(input.description+' '+input.diff);
      const sample=viewPR(demoPRs[suspicious?1:0]);
      analysis={
        category:sample.category,quality:sample.quality,risk:sample.risk,
        summary:t(suspicious?'suspiciousSummary':'demoSummary'),needs_human:true,
        reasons:suspicious?sample.reasons:[t('received'),t('useAPI')],
        missing:[t('reviewNeeded')],suggested_reply:sample.suggested_reply,injection:suspicious
      };
    }
    const p={...analysis,durationSeconds,modelState,id:Math.max(...prs.map(p=>p.id))+1,title:input.title,diff:input.diff,author:'localhost',created_at:new Date().toISOString(),source:requestSettings.mode,injection:analysis.injection===true};
    prs.unshift(p);
    form.reset();
    $('#add-dialog').close();
    render();
    detail(p.id);
    toast(t(requestSettings.mode==='demo'?'demoAdded':'apiAdded'));
  }catch(err){
    // Failed requests retain all form fields so the user can retry.
    error.textContent=t(err.code || 'network',{status:err.status});
  }finally{
    clearInterval(elapsedTimer);
    progress.hidden=true;
    submitting=false;
    button.disabled=false;
    $('[data-language]').disabled=false;
    button.textContent=t('analyze');
  }
};

// Localize bundled sample content only. User input and backend responses stay intact.
function viewPR(p) {
  const fixture=language==='en' && p.source==='demo'?englishDemoPRs.find(sample=>sample.id===p.id):null;
  return {...p,...(fixture||{}),suggested_reply:p.replyDraft??fixture?.suggested_reply??p.suggested_reply};
}
function translateStaticUI() {
  riskNames={low:t('low'),medium:t('medium'),high:t('high')};
  document.documentElement.lang=language;
  document.title=t('title');
  $('[data-language]').value=language;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
  for(const attr of ['placeholder','aria-label','title']) {
    document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el=>el.setAttribute(attr,t(el.getAttribute(`data-i18n-${attr}`))));
  }
}
$('[data-language]').onchange=ev=>{
  language=ev.target.value==='en'?'en':'tr';
  save('oss-language',language);
  render();
  if($('#detail-dialog').open)detail(currentId);
};


function modelLabel(state) {
  if(state?.status==='unavailable')return t('modelOffline');
  if(!state?.model)return t('modelUnknown');
  return state.model==='fake'?t('modelFake'):t('modelName',{model:state.model});
}
function renderModelStatus() {
  $('.demo-pill').textContent=settings.mode==='api'?t('apiMode')+' · '+modelLabel(backendHealth):t('demoMode');
}
async function refreshHealth() {
  const request=++healthRequest;
  if(settings.mode!=='api'){renderModelStatus();return;}
  const address=settings.url;
  backendHealth={status:'unknown',model:null};
  renderModelStatus();
  const state=await readHealth({baseUrl:address});
  if(request!==healthRequest || settings.mode!=='api' || settings.url!==address)return;
  backendHealth=state;
  renderModelStatus();
}

window.addEventListener('hashchange',render);render();refreshHealth();
