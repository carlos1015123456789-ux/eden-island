'use strict';
const DAY=86400000;
const PLANS=[
  {id:'economy', district:'駅・生活地区｜生活街区駅', title:'エコノミーホテル', plan:'駅近コンパクト・シングル', note:'生活街区を拠点に、島内を身軽に巡る人向けの客室例。', cap:1, price:18000, symbol:'E', goals:['simple','city']},
  {id:'resort', district:'南街区｜リゾートホテル群', title:'一般リゾートホテル', plan:'南地区・リゾートツイン', note:'南の公開海岸や遊歩道を巡る旅に。ホテルは海岸の敷地とは別で、眺望の指定はありません。', cap:2, price:86000, symbol:'R', goals:['resort','family']},
  {id:'theme', district:'東街区｜東エンタメ駅', title:'キャッスル（テーマホテル）', plan:'テーマホテル・ファミリー', note:'城下町気分の客室例。遊園地エデン・ワンダーズの園外に位置します。', cap:4, price:68000, alt:'テーマホテルの客室イメージ', goals:['themed','family']},
  {id:'longstay', district:'駅・生活地区｜生活街区駅', title:'長期滞在ホテル', plan:'生活街区・滞在スタジオ', note:'食事や買い物を日常のペースで楽しめる、生活街区を拠点にした滞在例。実在の設備や宿泊条件を示すものではありません。', cap:2, price:28000, symbol:'L', goals:['simple','city']},
  {id:'villa', district:'北地区｜北ヴィラ駅', title:'北ヴィラ（独立ヴィラ）', plan:'森の貸切ヴィラ', note:'緑の中で過ごす大型の独立棟。北ヴィラ駅から各棟へはカートで接続します。', cap:8, price:95000, alt:'北地区の独立ヴィラのイメージ', goals:['resort','family','private']},
  {id:'palace', district:'中央台地｜パレス中央駅', title:'エデン・パレス', plan:'クラウン・プレミアム', note:'旗艦ホテル本館の客室例。公開庭園やラウンジを巡る滞在に。', cap:2, price:140000, alt:'エデン・パレスの客室イメージ', goals:['resort','premium']},
  {id:'palacevip', district:'エデン・パレス内｜独立VIPコレクション', title:'パレス独立VIPコレクション', plan:'専用プール付き・独立VIPの見本枠', note:'セレネ、ヘリオス、アステリア、オセアナ、フローラ、ノクス、オーロラの7室。パレスの5,000予約単位に含まれます。見本では個別の棟は選べません。', cap:2, price:2500000, symbol:'P', goals:['premium','private']},
  {id:'ultimate', district:'特別滞在商品｜EDEN COLLECTION', title:'EDEN ULTIMATE EXPERIENCE', plan:'エデン島の最上級・特別滞在枠', note:'専属スタッフと料理人、特別送迎、貸切演出を含む最高価格帯の特別商品。特定の客室名ではありません。最高1億円／泊（このデモでは1億円／泊）。', cap:2, price:100000000, alt:'特別滞在のためのスイートのイメージ', goals:['premium','private']}
];
const SINGLE_SLOT=['palacevip','ultimate'];
function planUnit(plan){return plan.id==='villa'?'棟':SINGLE_SLOT.includes(plan.id)?'枠':'室'}
function planVisual(illustration,plan,dom){
 if(plan.alt){illustration.setAttribute('role','img');illustration.setAttribute('aria-label',plan.alt)}
 else{illustration.className+=' graphic';illustration.setAttribute('aria-hidden','true');illustration.append(dom('span',plan.symbol,'category-glyph'))}
}

function dateMillis(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const time=Date.parse(value+'T00:00:00Z');return Number.isFinite(time)&&iso(time)===value?time:NaN}
function iso(t){return new Date(t).toISOString().slice(0,10)}
function localToday(){return dateMillis(iso(Date.now()-8*3600000))}
function evaluate(start,end,adults,children,rooms,geo,today,goal='all'){
  const first=dateMillis(start),last=dateMillis(end),nights=(last-first)/DAY;
  if(!Number.isFinite(first)||!Number.isFinite(last))return {error:'チェックインとチェックアウトの日付を選んでください。'};
  if(first<today)return {error:'チェックインには島の現地日付で今日以降を選んでください。'};
  if(nights<1||nights>30)return {error:'チェックアウトはチェックインの翌日以降、30泊以内にしてください。'};
  if(rooms>adults)return {error:'このデモでは1室・1棟につき大人1人以上を選んでください。'};
  return {adults,children,rooms,start,end,nights,results:PLANS.filter(p=>(geo==='all'||p.id===geo)&&p.cap*rooms>=adults+children&&(!SINGLE_SLOT.includes(p.id)||rooms===1)&&(goal==='all'||p.goals.includes(goal)))};
}
const yen=new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY'});
function mount(){
  const by=(id)=>document.getElementById(id);
  const checkin=by('checkin'),checkout=by('checkout'),adults=by('adults'),children=by('children'),rooms=by('rooms'),property=by('property'),purpose=by('purpose');
  const error=by('error'),results=by('results'),summary=by('summary'),resultList=by('results-list'),summaryValues=by('summary-values');
  const el=(tag,value,cls)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(cls)node.className=cls;return node};
  const optionRange=(select,min,max,unit,initial)=>{for(let i=min;i<=max;i++){let opt=el('option',i+' '+unit);opt.value=i;select.append(opt)}select.value=initial};
  optionRange(adults,1,12,'人',2);optionRange(children,0,12,'人',0);optionRange(rooms,1,3,'室・棟',1);
  const today=localToday();
  checkin.min=iso(today);checkin.value=iso(today+DAY*14);checkout.value=iso(today+DAY*16);
  function syncEnd(){let first=dateMillis(checkin.value);if(!Number.isFinite(first))return;checkout.min=iso(first+DAY);checkout.max=iso(first+DAY*30);if(!Number.isFinite(dateMillis(checkout.value))||checkout.value<checkout.min||checkout.value>checkout.max)checkout.value=checkout.min}
  syncEnd();
  function step(next){for(const key of ['search','results','summary']){const s=by('step-'+key);if(next===key)s.setAttribute('aria-current','step');else s.removeAttribute('aria-current')}}
  const group=(a)=>`大人 ${a.adults}人・お子さま ${a.children}人`;
  const shortDate=(d)=>d.replaceAll('-','/');
  function details(plan,a){
    by('summary-plan').textContent=plan.title+'｜'+plan.plan;
    const unit=planUnit(plan);
    const rows=[['チェックイン',shortDate(a.start)],['チェックアウト',shortDate(a.end)],['泊数',a.nights+'泊'],['人数',group(a)],['室数・棟数',a.rooms+unit],['参考合計（架空）',yen.format(plan.price*a.nights*a.rooms)]];
    summaryValues.replaceChildren(...rows.map(([label,value])=>{const div=el('div');div.append(el('dt',label),el('dd',value));return div}));
    summary.hidden=false;step('summary');by('summary-title').focus();
  }
  function card(plan,a){
    const article=el('article',undefined,'result'),illustration=el('div',undefined,'result-image '+plan.id),content=el('div',undefined,'result-content');
    planVisual(illustration,plan,el);
    const suffix=planUnit(plan);
    const btn=el('button','このプランを選ぶ →','button ink');btn.type='button';btn.setAttribute('aria-label',plan.title+'のプランを選ぶ');btn.addEventListener('click',()=>details(plan,a));
    content.append(el('p',plan.district,'eyebrow'),el('h3',plan.title),el('p',plan.plan),el('p',plan.note,'result-description'),el('p',`1${suffix} デモ定員 ${plan.cap}人${plan.alt?' ｜ 画像はイメージ':''}`,'fine'),el('p',yen.format(plan.price*a.nights*a.rooms),'price'),el('p',`${a.nights}泊・${a.rooms}${suffix}の参考合計（架空）`,'fine'),btn);
    article.append(illustration,content);return article;
  }
  function search(){
    const a=evaluate(checkin.value,checkout.value,+adults.value,+children.value,+rooms.value,property.value,localToday(),purpose.value);
    summary.hidden=true;
    if(a.error){error.textContent=a.error;error.hidden=false;results.hidden=true;step('search');return}
    error.hidden=true;
    by('results-meta').textContent=`${shortDate(a.start)} 〜 ${shortDate(a.end)} ｜ ${a.nights}泊 ｜ ${group(a)} ｜ ${a.results.length}件のプラン例。空き状況は反映しません。月別の空き見本は「客室から探す」で確認できます。`;
    by('no-results').hidden=a.results.length>0;
    by('no-results').textContent='条件に合うデモプランがありません。人数・室数を変えるか、別の宿泊施設を選んでください。';
    resultList.replaceChildren(...a.results.map(p=>card(p,a)));results.hidden=false;step('results');by('results-heading').focus();
  }
  function invalidate(){results.hidden=true;summary.hidden=true;error.hidden=true;step('search')}
  checkin.addEventListener('change',()=>{syncEnd();invalidate()});
  for(const field of [checkout,adults,children,rooms,property,purpose])field.addEventListener('change',invalidate);
  by('search-button').addEventListener('click',search);
  by('edit-button').addEventListener('click',()=>{invalidate();checkin.focus()});
}
if(typeof document!=='undefined'&&document.getElementById('search-button'))mount();
if(typeof module!=='undefined')module.exports={evaluate,dateMillis,iso};
