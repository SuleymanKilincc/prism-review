export function filterPRs(items, {search='',category='',risk='',sort='newest'}={}) {
 const normalize = text => String(text).toLocaleLowerCase('tr-TR');
 const query=normalize(search.trim());
 const result=items.filter(p=>(!query || normalize(`${p.title} ${p.author} ${p.id} ${p.category} ${p.summary}`).includes(query)) && (!category || p.category===category) && (!risk || p.risk===risk));
 const order={newest:(a,b)=>new Date(b.created_at)-new Date(a.created_at),oldest:(a,b)=>new Date(a.created_at)-new Date(b.created_at),'quality-desc':(a,b)=>b.quality-a.quality,'quality-asc':(a,b)=>a.quality-b.quality,'risk-desc':(a,b)=>({high:3,medium:2,low:1}[b.risk]-{high:3,medium:2,low:1}[a.risk])};
 return result.sort((a,b)=>(order[sort]||order.newest)(a,b)||new Date(b.created_at)-new Date(a.created_at)||b.id-a.id);
}
export function validateAnalysis(value){
 if (!value || typeof value!=='object' || !['bugfix','feature','docs','typo','refactor','spam','other'].includes(value.category) || !Number.isInteger(value.quality) || value.quality<1 || value.quality>5 || !['low','medium','high'].includes(value.risk) || typeof value.summary!=='string' || typeof value.suggested_reply!=='string' || typeof value.needs_human!=='boolean' || !Array.isArray(value.reasons) || !value.reasons.every(v=>typeof v==='string') || !Array.isArray(value.missing) || !value.missing.every(v=>typeof v==='string')) throw new Error('Backend yanıtı beklenen analiz şemasına uymuyor. README içindeki API sözleşmesini kontrol edin.');
 return value;
}

// Client-observed request duration, not an isolated model-inference benchmark.
export function formatSeconds(seconds, language) {
 return new Intl.NumberFormat(language==='en'?'en-GB':'tr-TR', {
  minimumFractionDigits:1, maximumFractionDigits:1
 }).format(Math.max(0, Number.isFinite(seconds)?seconds:0));
}
