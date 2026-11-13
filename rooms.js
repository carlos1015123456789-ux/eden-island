'use strict';
const ROOM_HORIZON=150, ROOM_MAX_STAY=7;
function roomAvailable(plan,t,today){
 const d=(t-today)/DAY;
 return d>=0&&d<ROOM_HORIZON && (plan.id==='ultimate'?[4,5,6,7,10].includes(d%12):(d+PLANS.indexOf(plan)*2)%7!==2&&(d+PLANS.indexOf(plan))%11!==4);
}
function roomRun(plan,start,today){let n=0;while(n<ROOM_MAX_STAY&&roomAvailable(plan,start+n*DAY,today))n++;return n}
function firstRoomDay(plan,today){for(let d=0;d<ROOM_HORIZON;d++)if(roomAvailable(plan,today+d*DAY,today))return today+d*DAY;return null}
if(typeof module!=='undefined')module.exports={roomAvailable,roomRun,firstRoomDay};
if(typeof document!=='undefined')roomMount();
function roomMount(){
 const get=id=>document.getElementById(id), selection=get('calendar-selection'), summary=get('room-summary'), calendar=get('calendar-section'), grid=get('calendar-grid'), nightOpt=get('room-nights'), adultOpt=get('room-adults'), childOpt=get('room-children');
 const today=localToday(),monthStart=(t)=>{const d=new Date(t);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1)},jump=(t,k)=>{const d=new Date(t);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+k,1)};
 const fmt=(t)=>iso(t).replaceAll('-','/'), labelDate=(t)=>{const d=new Date(t);return `${d.getUTCFullYear()}年${d.getUTCMonth()+1}月${d.getUTCDate()}日`};
 const firstMonth=monthStart(today), lastMonth=monthStart(today+(ROOM_HORIZON-1)*DAY);
 let plan=null, month=firstMonth, selected=null;const picks=[];
 const dom=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const range=(select,min,max,suffix,value)=>{select.replaceChildren();for(let n=min;n<=max;n++){const opt=dom('option',n+suffix);opt.value=n;select.append(opt)}select.value=String(Math.max(min,Math.min(value,max)))};
 const unit=()=>planUnit(plan);
 function setRoom(p){
  plan=p;month=firstMonth;selected=null;selection.hidden=true;summary.hidden=true;
  picks.forEach(([opt,btn])=>btn.setAttribute('aria-pressed',String(opt===p)));
  const next=firstRoomDay(plan,today);get('next-day').textContent=next===null?'選択できる日はありません。':'直近の空き（見本）：'+labelDate(next);
  get('calendar-plan').textContent=plan.title+'｜'+plan.plan;
  get('calendar-description').textContent=plan.note;
  range(adultOpt,1,plan.cap,'人',Math.min(plan.cap,2));range(childOpt,0,plan.cap-(+adultOpt.value),'人',0);
  calendar.hidden=false;render();get('calendar-title').focus();
 }
 function pickDay(t){
  selected=t;const n=roomRun(plan,t,today);
  range(nightOpt,1,n,'泊',1);get('selected-day').textContent='チェックイン：'+labelDate(t);
  selection.hidden=false;summary.hidden=true;refresh();
  grid.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
 }
 function render(){
  const stamp=new Date(month), nDays=(jump(month,1)-month)/DAY;
  get('calendar-month').textContent=stamp.getUTCFullYear()+'年'+(stamp.getUTCMonth()+1)+'月';
  get('prev-month').disabled=month===firstMonth;get('next-month').disabled=month===lastMonth;
  const headings=[...'日月火水木金土'].map(d=>dom('div',d,'dow'));
  const blanks=Array.from({length:stamp.getUTCDay()},()=>{const d=dom('div');d.setAttribute('aria-hidden','true');return d});
  const days=Array.from({length:nDays},(_,i)=>{
   const t=month+i*DAY, available=roomAvailable(plan,t,today), out=t<today||t>=today+ROOM_HORIZON*DAY;
   const active=t===selected, stay=selected!==null&&t>selected&&t<selected+DAY*(+nightOpt.value);
   const btn=dom('button',String(i+1),'day'+(!available&&!out?' closed':'')+(stay?' stay':''));btn.type='button';btn.disabled=!available;btn.setAttribute('aria-pressed',String(active));
   btn.setAttribute('aria-label',labelDate(t)+' '+(out?'過去または範囲外':available?'空きあり・見本':'空きなし・見本')+(stay?'・滞在中':''));
   const badge=dom('span',out?'―':available?'○':'×');badge.setAttribute('aria-hidden','true');btn.append(badge);
   if(available)btn.addEventListener('click',()=>pickDay(t));return btn;
  });grid.replaceChildren(...headings,...blanks,...days);
 }
 function refresh(){
  summary.hidden=true;
  if(selected!==null){const n=+nightOpt.value;get('room-total').textContent=`チェックアウト ${fmt(selected+n*DAY)} ｜ ${n}泊・1${unit()}・参考合計（架空） ${yen.format(n*plan.price)}`}
  render();
 }
 function receipt(){
  const n=+nightOpt.value;if(selected===null||n<1||n>roomRun(plan,selected,today))return;
  const rows=[['客室・滞在枠',plan.title],['チェックイン',fmt(selected)],['チェックアウト',fmt(selected+n*DAY)],['泊数・室数',n+'泊・1'+unit()],['人数','大人 '+adultOpt.value+'人・お子さま '+childOpt.value+'人'],['参考合計（架空）',yen.format(n*plan.price)]];
  get('room-summary-values').replaceChildren(...rows.map(([k,v])=>{const row=dom('div');row.append(dom('dt',k),dom('dd',v));return row}));summary.hidden=false;get('room-summary-title').focus();
 }
 for(const p of PLANS){
  const btn=dom('button',undefined,'room-pick');btn.type='button';btn.setAttribute('aria-pressed','false');const ill=dom('div',undefined,'result-image '+p.id);planVisual(ill,p,dom);
  btn.append(ill,dom('span',p.title),dom('small',p.plan,'room-type'),dom('small',(p.id==='ultimate'?'1億円':yen.format(p.price))+'／泊・架空の例'));btn.addEventListener('click',()=>setRoom(p));picks.push([p,btn]);get('room-picks').append(btn);
 }
 get('prev-month').addEventListener('click',()=>{if(month>firstMonth){month=jump(month,-1);render()}});
 get('next-month').addEventListener('click',()=>{if(month<lastMonth){month=jump(month,1);render()}});
 nightOpt.addEventListener('change',refresh);adultOpt.addEventListener('change',()=>{range(childOpt,0,plan.cap-(+adultOpt.value),'人',+childOpt.value);summary.hidden=true});childOpt.addEventListener('change',()=>summary.hidden=true);
 get('room-confirm').addEventListener('click',receipt);
 get('room-edit').addEventListener('click',()=>{summary.hidden=true;get('calendar-title').focus()});
}
