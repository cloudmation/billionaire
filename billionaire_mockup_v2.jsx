import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const STOCKS = [
  { sym:"AAPL", name:"Apple",    emoji:"🍎", sector:"Tech",        price:131.46, change:+2.14, pe:28, growth:8,  yield:0.6,  moat:"Brand + Ecosystem", desc:"Consumer electronics, software, services" },
  { sym:"AMZN", name:"Amazon",   emoji:"📦", sector:"Commerce",    price:103.29, change:+0.87, pe:58, growth:22, yield:0,    moat:"Scale + Prime",     desc:"E-commerce, cloud computing (AWS), advertising" },
  { sym:"NFLX", name:"Netflix",  emoji:"🎬", sector:"Streaming",   price:448.32, change:-1.23, pe:41, growth:15, yield:0,    moat:"Content Library",   desc:"Streaming entertainment, 270M+ subscribers" },
  { sym:"TSLA", name:"Tesla",    emoji:"⚡", sector:"EV",          price:174.83, change:+3.45, pe:52, growth:19, yield:0,    moat:"Brand + Software",  desc:"Electric vehicles, energy storage, autonomous driving" },
  { sym:"GOOGL",name:"Google",   emoji:"🔍", sector:"Tech",        price:140.53, change:+1.02, pe:24, growth:12, yield:0,    moat:"Search Monopoly",   desc:"Search, YouTube, Cloud, AI" },
  { sym:"NVDA", name:"Nvidia",   emoji:"🖥️", sector:"Chips",       price:875.39, change:+5.67, pe:71, growth:122,yield:0.03, moat:"CUDA ecosystem",    desc:"AI chips, data center GPUs, gaming" },
  { sym:"NKE",  name:"Nike",     emoji:"👟", sector:"Fashion",     price: 94.12, change:-0.54, pe:27, growth:5,  yield:1.7,  moat:"Brand Power",       desc:"Athletic footwear, apparel, sports equipment" },
  { sym:"DIS",  name:"Disney",   emoji:"🏰", sector:"Media",       price: 88.43, change:-0.23, pe:71, growth:4,  yield:0,    moat:"IP Library",        desc:"Theme parks, streaming (Disney+), movies, TV" },
  { sym:"SBUX", name:"Starbucks",emoji:"☕", sector:"Food",        price: 76.24, change:-0.67, pe:22, growth:7,  yield:2.8,  moat:"Loyalty Program",   desc:"Coffee shops, drive-throughs, grocery products" },
  { sym:"RBLX", name:"Roblox",   emoji:"🎮", sector:"Gaming",      price: 45.87, change:+1.89, pe:-1, growth:31, yield:0,    moat:"User-gen content",  desc:"User-generated gaming platform, 80M daily users" },
  { sym:"SPOT", name:"Spotify",  emoji:"🎵", sector:"Streaming",   price:272.14, change:+0.44, pe:-1, growth:14, yield:0,    moat:"Playlist switching",desc:"Music & podcast streaming, 600M+ users" },
  { sym:"DUOL", name:"Duolingo", emoji:"🦉", sector:"EdTech",      price:244.56, change:+2.11, pe:-1, growth:43, yield:0,    moat:"Habit loop + brand",desc:"Language learning app, 97M daily active users" },
];

const MILESTONES = [
  { amount:1_000,         label:"$1K",   title:"Saver",              emoji:"🌱", unlocks:"US Stocks" },
  { amount:10_000,        label:"$10K",  title:"Hustler",            emoji:"⚡", unlocks:"International Stocks" },
  { amount:100_000,       label:"$100K", title:"Hundred-Thousandaire",emoji:"💎", unlocks:"Index Funds & ETFs" },
  { amount:1_000_000,     label:"$1M",   title:"Millionaire",        emoji:"🏆", unlocks:"Real Estate (REITs)" },
  { amount:10_000_000,    label:"$10M",  title:"Multi-Millionaire",  emoji:"🚀", unlocks:"Commodities" },
  { amount:100_000_000,   label:"$100M", title:"Mogul",              emoji:"🏙️", unlocks:"IPOs & Private Equity" },
  { amount:1_000_000_000, label:"$1B",   title:"Billionaire",        emoji:"👑", unlocks:"Hall of Fame" },
];

const STYLES = [
  { id:"value",    icon:"⚖️",  label:"Value",     color:"#C9921A", bg:"#1a1200", desc:"Buy great companies at a discount",   who:"Warren Buffett",  metrics:["P/E Ratio","Price/Book","Earnings Yield","Margin of Safety"] },
  { id:"growth",   icon:"🚀",  label:"Growth",    color:"#22c55e", bg:"#001a08", desc:"Bet on fast-growing businesses",      who:"Peter Lynch",     metrics:["Revenue Growth","TAM Size","Gross Margin","Market Share"] },
  { id:"ta",       icon:"📈",  label:"Technical", color:"#60efff", bg:"#001318", desc:"Read the price chart like a map",     who:"Paul Tudor Jones",metrics:["Moving Average","RSI","Volume","Support/Resistance"] },
  { id:"dividend", icon:"💰",  label:"Dividend",  color:"#a78bfa", bg:"#0d001a", desc:"Get paid just to hold the stock",    who:"Warren Buffett",  metrics:["Dividend Yield","Payout Ratio","Growth Rate","Coverage Ratio"] },
  { id:"momentum", icon:"⚡",  label:"Momentum",  color:"#f97316", bg:"#1a0800", desc:"Ride what's already going up",       who:"Richard Driehaus",metrics:["Relative Strength","52W High","Price Trend","Volume Surge"] },
];

const MISSIONS = [
  { done:true,  icon:"🎯", text:"Complete one Analysis Wizard",     bonus:"$2,000" },
  { done:true,  icon:"📚", text:"Learn 3 new investing concepts",    bonus:"$1,500" },
  { done:false, icon:"🌈", text:"Diversify into 2 different sectors",bonus:"$3,000" },
];

const PORTFOLIO = [
  { sym:"AAPL", shares:47, avgCost: 91.42 },
  { sym:"NVDA", shares:12, avgCost:312.18 },
  { sym:"AMZN", shares: 8, avgCost:142.33 },
  { sym:"TSLA", shares:22, avgCost:108.61 },
];

const NET_WORTH = 47_382.44;
const CASH = 8_241.17;
const YEAR_SIM = 2017;

const CONCEPTS = {
  value: [
    { term:"P/E Ratio",     short:"Price ÷ Earnings per share. Tells you how expensive a stock is relative to profits.",         simple:"If P/E = 20, you pay $20 for every $1 the company earns yearly." },
    { term:"Intrinsic Value",short:"What the business is actually worth if you owned the whole thing.",                          simple:"Like appraising a house — what's the real price, not just asking price?" },
    { term:"Margin of Safety",short:"Buying at a price significantly below intrinsic value to protect against mistakes.",        simple:"Never pay full price. Buy at 70 cents for every dollar of value." },
    { term:"Economic Moat",  short:"The competitive advantage that stops rivals from stealing customers.",                       simple:"Why can't someone just copy this business tomorrow?" },
    { term:"Circle of Competence",short:"Only invest in businesses you understand well enough to explain.",                     simple:"Buffett won't buy what he can't explain. Can you explain this company?" },
  ],
  growth: [
    { term:"Revenue Growth", short:"How fast is the company's top-line sales growing year over year?",                          simple:"If revenue grows 30%/yr for 10 years, the company is 14x bigger." },
    { term:"TAM",            short:"Total Addressable Market — how big is the entire market this company could capture?",       simple:"Roblox's TAM is every kid with a screen. That's huge." },
    { term:"Gross Margin",   short:"Revenue minus cost of goods sold, as a percentage. Shows business quality.",                simple:"Software has 80%+ gross margins. Pizza shops have ~10%." },
    { term:"Rule of 40",     short:"Revenue growth % + profit margin % should be ≥ 40 for a healthy SaaS business.",           simple:"Duolingo growing 40% + small loss = passing. Checks out." },
    { term:"Market Share",   short:"What % of its industry does this company capture? Is that % growing or shrinking?",        simple:"Is Netflix winning the streaming war or losing ground?" },
  ],
};

const QUIZ_QUESTIONS_POOL = {
  value: [
    { q:"Apple has a P/E of 28. The tech industry average P/E is 24. What does this suggest?", opts:["Apple is cheaper than peers","Apple is more expensive than peers","Apple is exactly average","P/E doesn't apply to Apple"], a:1, exp:"A higher P/E than peers means you pay more per dollar of earnings — investors are betting on stronger future growth." },
    { q:"What does 'Margin of Safety' mean in investing?", opts:["Only invest in safe companies","Buy at a price below what you think it's worth","Never sell anything","Avoid risky sectors"], a:1, exp:"Margin of safety means buying at a discount to intrinsic value, so even if you're a bit wrong, you still make money." },
    { q:"Warren Buffett says 'I only buy what I can explain simply.' This refers to:", opts:["P/E Ratio","Margin of Safety","Circle of Competence","Dividend Yield"], a:2, exp:"Circle of Competence: only invest in businesses you understand well enough to explain to a 10-year-old." },
  ],
  growth: [
    { q:"Roblox's revenue grew 31% last year. To maintain that rate, sales must roughly double every:", opts:["1 year","2.4 years","5 years","10 years"], a:1, exp:"At 31% annual growth, the Rule of 72 says: 72 ÷ 31 ≈ 2.3 years to double. Roblox would be twice as big in under 3 years." },
    { q:"A company has 80% gross margin. This is MOST likely:", opts:["A restaurant chain","A software company","A steel mill","A grocery store"], a:1, exp:"Software companies charge almost nothing to deliver a copy of their product. That's why they have 70-90% gross margins." },
  ],
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt  = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
const fmtK = (n) => { if(n>=1e9) return "$"+(n/1e9).toFixed(2)+"B"; if(n>=1e6) return "$"+(n/1e6).toFixed(2)+"M"; if(n>=1e3) return "$"+(n/1e3).toFixed(1)+"K"; return "$"+n.toFixed(2); };
const pct  = (n) => (n>=0?"+":"")+n.toFixed(2)+"%";

function getMilestoneIdx(w){ let m=0; for(let i=1;i<MILESTONES.length;i++) if(w>=MILESTONES[i].amount) m=i; return m; }
function getMilestoneProgress(w){ const mi=getMilestoneIdx(w); const cur=MILESTONES[mi].amount; const nxt=MILESTONES[mi+1]?.amount; if(!nxt) return 1; return Math.min(1,(w-cur)/(nxt-cur)); }

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#050505", sidebar:"#080808", card:"#0f0f0f", card2:"#141414",
  border:"#1e1e1e", gold:"#C9921A", goldLt:"#E8B84B", green:"#22c55e",
  red:"#ef4444", text:"#f0f0f0", muted:"#555", muted2:"#888",
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function Billionaire() {
  const [tab,          setTab]          = useState("home");
  const [screen,       setScreen]       = useState("app"); // app | onboard
  const [wizardStock,  setWizardStock]  = useState(null);
  const [wizardStep,   setWizardStep]   = useState(0);
  const [wizardStyle,  setWizardStyle]  = useState(null);
  const [wizardAnswer, setWizardAnswer] = useState(null);
  const [tradeQty,     setTradeQty]     = useState(1);
  const [learnStyle,   setLearnStyle]   = useState(null);
  const [quizState,    setQuizState]    = useState(null); // {questions, current, answers}
  const [aiMsgs,       setAiMsgs]       = useState([{ r:"a", t:"Hey! 👋 I'm BILL — your AI investing coach. I can answer questions, run quizzes, analyze your portfolio, or explain any concept. What would you like to explore?" }]);
  const [aiInput,      setAiInput]      = useState("");
  const [aiLoading,    setAiLoading]    = useState(false);
  const [billQuiz,     setBillQuiz]     = useState(null);
  const [netWorthAnim, setNetWorthAnim] = useState(NET_WORTH * 0.9);
  const chatEndRef = useRef(null);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [aiMsgs]);
  useEffect(()=>{
    let frame=0; const target=NET_WORTH; const start=target*0.9;
    const go=()=>{ frame++; const p=Math.min(1,frame/50); setNetWorthAnim(start+(target-start)*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(go); };
    requestAnimationFrame(go);
  },[tab]);

  // ── Portfolio computed ─────────────────────────────────────────────────────
  const portVal  = PORTFOLIO.reduce((s,h)=>{const st=STOCKS.find(x=>x.sym===h.sym); return s+(st?.price||0)*h.shares;},0);
  const portCost = PORTFOLIO.reduce((s,h)=>s+h.avgCost*h.shares,0);
  const portGain = portVal - portCost;
  const mi       = getMilestoneIdx(NET_WORTH);
  const miProg   = getMilestoneProgress(NET_WORTH);

  // ── AI Chat ────────────────────────────────────────────────────────────────
  async function sendAI(q) {
    const msg = (q||aiInput).trim(); if(!msg||aiLoading) return;
    setAiInput(""); setAiLoading(true);
    const msgs = [...aiMsgs, {r:"u",t:msg}]; setAiMsgs(msgs);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are BILL, an AI investing coach for a 12-year-old named Sophia playing Billionaire — a stock investing game. Her current net worth is ${fmt(NET_WORTH)}. She is in Time Machine mode, currently in year ${YEAR_SIM}, having started in 2010. Her holdings: ${PORTFOLIO.map(h=>`${h.shares} shares of ${h.sym}`).join(", ")}. Current tab: ${tab}. 

You can answer questions, generate quizzes, and create challenges. Keep language simple, fun, and encouraging. Use 1-2 emojis. Max 4 sentences unless generating a quiz.

If the user asks you to quiz them, generate a quiz in this exact format:
[QUIZ]{"topic":"Topic Name","questions":[{"q":"Question?","opts":["A","B","C","D"],"a":0,"exp":"Explanation of why A is correct."}]}[/QUIZ]

Always be Socratic — ask what SHE thinks before giving the answer. Never condescending. Reference her actual portfolio when relevant.`,
          messages: msgs.map(m=>({role:m.r==="u"?"user":"assistant",content:m.t})),
        }),
      });
      const d = await res.json();
      const raw = d.content?.[0]?.text || "Try again! 🤔";
      // Parse quiz
      const qMatch = raw.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
      if(qMatch) {
        try {
          const qd = JSON.parse(qMatch[1]);
          setBillQuiz({...qd, current:0, answers:[]});
          setAiMsgs([...msgs,{r:"a",t:`Here's a quiz on ${qd.topic}! Let's see what you know 🎓`}]);
        } catch { setAiMsgs([...msgs,{r:"a",t:raw.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/,"")}]); }
      } else {
        setAiMsgs([...msgs,{r:"a",t:raw}]);
      }
    } catch { setAiMsgs([...msgs,{r:"a",t:"Connection error — try again! 🤖"}]); }
    setAiLoading(false);
  }

  // ── Analysis Wizard helpers ────────────────────────────────────────────────
  function openWizard(stock){ setWizardStock(stock); setWizardStep(0); setWizardStyle(null); setWizardAnswer(null); setTradeQty(1); }
  function closeWizard(){ setWizardStock(null); setWizardStep(0); }

  // Metric card for wizard
  function MetricCard({label, value, avg, desc, good}){
    return (
      <div style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>{label}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:good?T.goldLt:T.red,letterSpacing:1}}>{value}</div>
          {avg && <div style={{fontSize:12,color:T.muted}}>vs {avg} avg</div>}
        </div>
        <div style={{fontSize:12,color:T.muted2,lineHeight:1.5}}>{desc}</div>
      </div>
    );
  }

  const style = wizardStyle ? STYLES.find(s=>s.id===wizardStyle) : null;
  const wizardMetrics = wizardStock && wizardStyle && [
    wizardStyle==="value"   ? {l:"P/E Ratio",    v:wizardStock.pe>0?wizardStock.pe+"x":"N/A",    avg:"24x",  desc:"How much you pay per $1 of earnings. Lower usually = cheaper.",   good:wizardStock.pe>0&&wizardStock.pe<30} : null,
    wizardStyle==="value"   ? {l:"Moat",         v:"Strong",                                      avg:null,   desc:wizardStock.moat + " — hard for competitors to copy.",              good:true} : null,
    wizardStyle==="growth"  ? {l:"Revenue Growth",v:"+"+wizardStock.growth+"%/yr",                avg:"+10%", desc:"How fast the company's sales are increasing year over year.",      good:wizardStock.growth>10} : null,
    wizardStyle==="growth"  ? {l:"Market Opportunity",v:"Massive",                               avg:null,   desc:"This market is growing fast globally — there's room to run.",      good:true} : null,
    wizardStyle==="dividend"? {l:"Dividend Yield",v:wizardStock.yield+"%",                        avg:"1.5%", desc:"Annual cash payment per share ÷ current price.",                  good:wizardStock.yield>1} : null,
    wizardStyle==="ta"      ? {l:"RSI (14-day)",  v:"54",                                         avg:"50",   desc:"Between 30-70 = neutral territory. Not overbought or oversold.",  good:true} : null,
    wizardStyle==="momentum"? {l:"1-Year Return", v:"+"+Math.abs(wizardStock.change*18).toFixed(0)+"%",avg:"+10%",desc:"This stock's price gain vs the market over the past year.",   good:wizardStock.change>0} : null,
  ].filter(Boolean).slice(0,4);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,minHeight:"100vh",color:T.text,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:2px}
        input,textarea{outline:none;font-family:'DM Sans',sans-serif}
        button{font-family:'DM Sans',sans-serif;cursor:pointer}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #C9921A22}50%{box-shadow:0 0 40px #C9921A44}}
        .hov{transition:all 0.15s}.hov:hover{border-color:#C9921A55!important;transform:translateY(-1px)}
        .selhov:hover{background:#1a1a1a!important}
      `}</style>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div style={{background:T.sidebar,borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:24,flexShrink:0,zIndex:100}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:T.gold,letterSpacing:4,flexShrink:0}}>BILLIONAIRE</div>
        <div style={{width:1,height:24,background:T.border}}/>
        <div style={{background:`${T.gold}18`,border:`1px solid ${T.gold}35`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:T.gold}}>⏳ TIME MACHINE · {YEAR_SIM}</div>
        <div style={{flex:1}}/>
        {/* Milestone bar */}
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,maxWidth:340}}>
          <div style={{fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{MILESTONES[mi].emoji} {MILESTONES[mi].title}</div>
          <div style={{flex:1,height:4,background:"#1a1a1a",borderRadius:2}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${T.gold},${T.goldLt})`,borderRadius:2,width:`${miProg*100}%`,transition:"width 0.6s",boxShadow:`0 0 6px ${T.gold}80`}}/>
          </div>
          <div style={{fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{MILESTONES[mi+1]?.label}</div>
        </div>
        <div style={{width:1,height:24,background:T.border}}/>
        {/* Net worth */}
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1}}>NET WORTH</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:T.gold,letterSpacing:2}}>{fmt(netWorthAnim)}</div>
        </div>
        <div style={{background:"#1a0800",border:`1px solid #ff6b3550`,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:800,color:"#ff8c00"}}>🔥 12</div>
      </div>

      {/* ══ BODY: sidebar + main + bill ══════════════════════════════════════ */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <div style={{width:220,background:T.sidebar,borderRight:`1px solid ${T.border}`,padding:"16px 0",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
          {/* Nav */}
          {[
            {id:"home",    icon:"🏠", label:"Home"},
            {id:"market",  icon:"📊", label:"Market"},
            {id:"learn",   icon:"📚", label:"Learn"},
            {id:"portfolio",icon:"💼",label:"Portfolio"},
            {id:"ladder",  icon:"🏆", label:"Ladder"},
          ].map(n=>(
            <div key={n.id} onClick={()=>setTab(n.id)} className="selhov"
              style={{display:"flex",alignItems:"center",gap:12,padding:"10px 20px",cursor:"pointer",background:tab===n.id?"#1a1200":"transparent",borderLeft:`3px solid ${tab===n.id?T.gold:"transparent"}`,color:tab===n.id?T.goldLt:T.muted,fontWeight:tab===n.id?700:500,fontSize:14,transition:"all 0.15s",marginBottom:2}}>
              <span style={{fontSize:17}}>{n.icon}</span>{n.label}
            </div>
          ))}

          <div style={{height:1,background:T.border,margin:"16px 0"}}/>

          {/* Today's progress */}
          <div style={{padding:"0 20px"}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>TODAY'S PROGRESS</div>
            {MISSIONS.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:m.done?T.green:"#1a1a1a",border:`1px solid ${m.done?T.green:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,flexShrink:0}}>
                  {m.done?"✓":""}
                </div>
                <div style={{fontSize:11,color:m.done?T.muted:T.text,textDecoration:m.done?"line-through":"none",lineHeight:1.3}}>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{height:1,background:T.border,margin:"16px 0"}}/>

          {/* Learning path */}
          <div style={{padding:"0 20px"}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>LEARNING PATH</div>
            {STYLES.slice(0,3).map((s,i)=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:14}}>{s.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:i===0?s.color:T.muted,fontWeight:i===0?700:400}}>{s.label}</div>
                  <div style={{height:2,background:"#1a1a1a",borderRadius:1,marginTop:3}}>
                    <div style={{height:"100%",background:s.color,borderRadius:1,width:i===0?"60%":i===1?"20%":"0%"}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{flex:1}}/>
          <div style={{padding:"16px 20px",borderTop:`1px solid ${T.border}`}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Trades remaining today</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:T.green,letterSpacing:2}}>3 / 3</div>
          </div>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <div style={{flex:1,overflowY:"auto",padding:28}}>

          {/* ═══ HOME ═══ */}
          {tab==="home" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              {/* Net worth hero */}
              <div style={{background:`linear-gradient(135deg,#0f0e00,${T.card})`,border:`1px solid ${T.gold}28`,borderRadius:20,padding:"28px 32px",marginBottom:20,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:"-30%",right:"-5%",width:300,height:300,background:`radial-gradient(circle,${T.gold}0d 0%,transparent 70%)`,pointerEvents:"none"}}/>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:6}}>YOUR NET WORTH · 2017</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:64,color:T.gold,letterSpacing:3,lineHeight:1,textShadow:`0 0 60px ${T.gold}30`}}>{fmt(netWorthAnim)}</div>
                <div style={{display:"flex",gap:20,marginTop:10}}>
                  <div style={{fontSize:15,color:T.green,fontWeight:700}}>▲ +$2,841 today</div>
                  <div style={{fontSize:15,color:T.muted}}>·</div>
                  <div style={{fontSize:15,color:T.green,fontWeight:700}}>▲ +373% vs S&P 500</div>
                </div>
              </div>

              {/* Row: Year card + Missions */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                <div style={{background:`linear-gradient(135deg,#1a1200,${T.card})`,border:`1px solid ${T.gold}25`,borderRadius:16,padding:"20px"}}>
                  <div style={{fontSize:10,color:T.gold,fontWeight:700,letterSpacing:2,marginBottom:8}}>📅 IT'S NOW 2017</div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:48,color:`${T.gold}30`,letterSpacing:3,lineHeight:1,float:"right",marginTop:-8}}>2017</div>
                  <div style={{fontWeight:600,fontSize:14,lineHeight:1.6,marginBottom:12}}>iPhone X launches. Tech stocks are booming. Netflix up 55%. Bitcoin hits $20K.</div>
                  <div style={{background:"#ffffff06",borderRadius:10,padding:"10px 12px",fontSize:12,color:T.muted2,lineHeight:1.6}}>
                    💡 <span style={{color:T.goldLt,fontWeight:600}}>BILL:</span> Your Nvidia position is up 340% since 2013. The AI chip revolution is still 5 years away — you're holding gold.
                  </div>
                </div>
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px"}}>
                  <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>🎯 DAILY MISSIONS</div>
                  {MISSIONS.map((m,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:m.done?T.green:"#1a1a1a",border:`1px solid ${m.done?T.green:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                        {m.done?"✓":""}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:m.done?T.muted:T.text,textDecoration:m.done?"line-through":"none"}}>{m.text}</div>
                        <div style={{fontSize:11,color:T.gold}}>{m.bonus} reward</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[{l:"CASH AVAILABLE",v:fmt(CASH),c:T.text},{l:"IN STOCKS",v:fmt(portVal),c:T.text},{l:"TOTAL GAIN",v:"+"+fmt(portGain),c:T.green},{l:"NEXT MILESTONE",v:"$"+((100000-NET_WORTH)/1000).toFixed(0)+"K away",c:T.gold}].map(s=>(
                  <div key={s.l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:6}}>{s.l}</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:s.c,letterSpacing:1}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ MARKET ═══ */}
          {tab==="market" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,letterSpacing:2,color:T.gold}}>STOCK MARKET · 2017</div>
                  <div style={{fontSize:13,color:T.muted}}>Click any stock to analyze it before trading</div>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:T.green,background:`${T.green}15`,border:`1px solid ${T.green}30`,borderRadius:20,padding:"6px 14px"}}>3 trades remaining today</div>
              </div>

              {/* Sector filter */}
              <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
                {["All","Tech","Commerce","Streaming","EV","Gaming","Food","Fashion","EdTech"].map(s=>(
                  <div key={s} style={{background:s==="All"?T.gold:"#141414",color:s==="All"?"#000":T.muted,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${s==="All"?T.gold:T.border}`}}>{s}</div>
                ))}
              </div>

              {/* Stock grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {STOCKS.map(s=>{
                  const owned = PORTFOLIO.find(p=>p.sym===s.sym);
                  const ret2010 = s.sym==="AAPL"?"+1563%":s.sym==="AMZN"?"+1413%":s.sym==="NVDA"?"+168000%":null;
                  return (
                    <div key={s.sym} className="hov"
                      onClick={()=>openWizard(s)}
                      style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px",cursor:"pointer",position:"relative"}}>
                      {owned && <div style={{position:"absolute",top:10,right:10,background:`${T.gold}20`,border:`1px solid ${T.gold}40`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,color:T.gold}}>OWNED</div>}
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{fontSize:24}}>{s.emoji}</span>
                        <div>
                          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:1}}>{s.sym}</div>
                          <div style={{fontSize:11,color:T.muted}}>{s.sector}</div>
                        </div>
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:1,marginBottom:4}}>${s.price.toFixed(2)}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:12,fontWeight:700,color:s.change>=0?T.green:T.red}}>{s.change>=0?"▲":"▼"}{Math.abs(s.change)}%</div>
                        {ret2010 && <div style={{fontSize:11,color:T.gold,fontWeight:700}}>Since 2010: {ret2010}</div>}
                      </div>
                      <div style={{fontSize:11,color:T.muted,marginTop:6,lineHeight:1.4}}>{s.desc.slice(0,52)}…</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ LEARN ═══ */}
          {tab==="learn" && !learnStyle && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,letterSpacing:2,color:T.gold}}>INVESTING ACADEMY</div>
                <div style={{fontSize:13,color:T.muted}}>Master each style to unlock more powerful analysis tools</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
                {STYLES.map((s,i)=>(
                  <div key={s.id} className="hov" onClick={()=>setLearnStyle(s.id)}
                    style={{background:`linear-gradient(135deg,${s.bg},${T.card})`,border:`1px solid ${s.color}30`,borderRadius:16,padding:"20px",cursor:"pointer",opacity:i>1?0.5:1,position:"relative"}}>
                    {i>1 && <div style={{position:"absolute",top:12,right:12,background:"#1a1a1a",border:`1px solid ${T.border}`,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,color:T.muted}}>🔒 Locked</div>}
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <span style={{fontSize:28}}>{s.icon}</span>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:s.color,letterSpacing:1}}>{s.label} Investing</div>
                        <div style={{fontSize:12,color:T.muted}}>{s.who}'s style</div>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:T.muted2,marginBottom:12,lineHeight:1.5}}>{s.desc}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {s.metrics.map(m=>(
                        <div key={m} style={{background:`${s.color}15`,border:`1px solid ${s.color}25`,borderRadius:20,padding:"3px 9px",fontSize:11,color:s.color,fontWeight:600}}>{m}</div>
                      ))}
                    </div>
                    {i===0 && (
                      <div style={{marginTop:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,marginBottom:3}}><span>Progress</span><span>60%</span></div>
                        <div style={{height:3,background:"#1a1a1a",borderRadius:2}}>
                          <div style={{height:"100%",background:s.color,borderRadius:2,width:"60%"}}/>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* BILL Challenge */}
              <div style={{background:`linear-gradient(135deg,#001a08,${T.card})`,border:`1px solid ${T.green}30`,borderRadius:16,padding:"20px",display:"flex",alignItems:"center",gap:20}}>
                <span style={{fontSize:36,flexShrink:0}}>🤖</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:T.green,fontWeight:700,letterSpacing:2,marginBottom:4}}>BILL'S DAILY CHALLENGE</div>
                  <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>Find a value stock with a P/E under 25 and a dividend yield above 1.5%</div>
                  <div style={{fontSize:12,color:T.muted}}>Reward: $5,000 bonus + "Value Hunter" badge</div>
                </div>
                <button style={{background:`linear-gradient(135deg,${T.green},#16a34a)`,border:"none",borderRadius:12,padding:"10px 20px",color:"#000",fontWeight:800,fontSize:14}}>Accept →</button>
              </div>
            </div>
          )}

          {/* ═══ LEARN STYLE DETAIL ═══ */}
          {tab==="learn" && learnStyle && (()=>{
            const s = STYLES.find(x=>x.id===learnStyle);
            const concepts = CONCEPTS[learnStyle] || [];
            return (
              <div style={{animation:"fadeUp 0.3s ease"}}>
                <button onClick={()=>setLearnStyle(null)} style={{background:"none",border:"none",color:T.muted,fontSize:14,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>← Back to Academy</button>
                <div style={{background:`linear-gradient(135deg,${s.bg},${T.card})`,border:`1px solid ${s.color}35`,borderRadius:20,padding:"24px",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:11,color:s.color,fontWeight:700,letterSpacing:2,marginBottom:4}}>INVESTING STYLE</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:40,color:s.color,letterSpacing:3}}>{s.label} Investing</div>
                      <div style={{fontSize:14,color:T.muted2,marginTop:4}}>The {s.who} approach</div>
                    </div>
                    <span style={{fontSize:48}}>{s.icon}</span>
                  </div>
                  <div style={{fontSize:15,color:T.text,marginTop:12,lineHeight:1.7,maxWidth:500}}>{s.desc}. The core question: {s.id==="value"?"Is this company worth more than its price?":s.id==="growth"?"Is this company growing faster than expected?":"Is this stock trending in the right direction?"}</div>
                </div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>CORE CONCEPTS</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                  {concepts.map((c,i)=>(
                    <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px"}}>
                      <div style={{fontWeight:700,fontSize:14,color:s.color,marginBottom:6}}>{c.term}</div>
                      <div style={{fontSize:13,color:T.muted2,lineHeight:1.5,marginBottom:8}}>{c.short}</div>
                      <div style={{background:`${s.color}10`,border:`1px solid ${s.color}20`,borderRadius:8,padding:"8px 10px",fontSize:12,color:T.text}}>💡 {c.simple}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:12}}>
                  <button onClick={()=>{ setTab("market"); setLearnStyle(null); }} style={{flex:1,background:`linear-gradient(135deg,${s.color},${s.color}cc)`,border:"none",borderRadius:12,padding:"13px",color:"#000",fontWeight:800,fontSize:14}}>Practice with a Real Stock →</button>
                  <button onClick={()=>sendAI(`Quiz me on ${s.label} Investing concepts`)} style={{flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px",color:T.text,fontWeight:700,fontSize:14}}>🤖 Quiz Me on This</button>
                </div>
              </div>
            );
          })()}

          {/* ═══ PORTFOLIO ═══ */}
          {tab==="portfolio" && (
            <div style={{animation:"fadeUp 0.3s ease"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                <div style={{background:`linear-gradient(135deg,#0a1200,${T.card})`,border:`1px solid ${T.green}28`,borderRadius:16,padding:"20px"}}>
                  <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>PORTFOLIO VALUE</div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:T.green,letterSpacing:2}}>{fmt(portVal)}</div>
                  <div style={{fontSize:14,color:T.green,fontWeight:700,marginTop:4}}>▲ +{fmt(portGain)} total gain</div>
                </div>
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                  <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>VS S&P 500 (2010→2017)</div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:T.gold,letterSpacing:1}}>+373%</div>
                  <div style={{fontSize:13,color:T.muted}}>S&P returned +192% same period. You're crushing it 🔥</div>
                </div>
              </div>
              {/* Holdings table */}
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",marginBottom:16}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:8}}>
                  {["STOCK","SHARES","COST BASIS","CURRENT VALUE","GAIN / LOSS"].map(h=>(
                    <div key={h} style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1}}>{h}</div>
                  ))}
                </div>
                {PORTFOLIO.map(h=>{
                  const st = STOCKS.find(s=>s.sym===h.sym);
                  if(!st) return null;
                  const val = st.price * h.shares;
                  const cost = h.avgCost * h.shares;
                  const gain = val - cost;
                  const gpct = (gain/cost)*100;
                  return (
                    <div key={h.sym} style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:8,alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:20}}>{st.emoji}</span>
                        <div>
                          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1}}>{st.sym}</div>
                          <div style={{fontSize:11,color:T.muted}}>{st.name}</div>
                        </div>
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16}}>{h.shares}</div>
                      <div style={{fontSize:13}}>{fmt(cost)}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16}}>{fmt(val)}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:gain>=0?T.green:T.red}}>{gain>=0?"+":""}{fmt(gain)}</div>
                        <div style={{fontSize:11,color:gain>=0?T.green:T.red}}>{pct(gpct)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>sendAI("Analyze my portfolio. What's my biggest risk and what should I consider changing?")} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 20px",color:T.text,fontWeight:700,fontSize:14}}>🤖 Ask BILL to analyze my portfolio</button>
            </div>
          )}

          {/* ═══ LADDER ═══ */}
          {tab==="ladder" && (
            <div style={{animation:"fadeUp 0.3s ease",maxWidth:600}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,letterSpacing:2,color:T.gold,marginBottom:4}}>THE BILLION DOLLAR LADDER</div>
              <div style={{fontSize:13,color:T.muted,marginBottom:24}}>Each milestone unlocks new assets and investing strategies.</div>
              {MILESTONES.map((m,i)=>{
                const reached = NET_WORTH >= m.amount;
                const isCur = mi === i;
                const prog = isCur ? miProg*100 : (reached?100:0);
                return (
                  <div key={m.label} style={{display:"flex",gap:16,marginBottom:20,alignItems:"flex-start"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:reached?`linear-gradient(135deg,${T.gold},${T.goldLt})`:"#141414",border:`2px solid ${reached?T.gold:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:reached?`0 0 20px ${T.gold}40`:"none"}}>
                        {reached?m.emoji:"🔒"}
                      </div>
                      {i<MILESTONES.length-1 && <div style={{width:2,height:44,background:reached?T.gold:"#1a1a1a",marginTop:4,transition:"background 0.6s"}}/>}
                    </div>
                    <div style={{flex:1,background:isCur?`linear-gradient(135deg,#1a1000,${T.card})`:T.card,border:`1px solid ${isCur?T.gold+"55":T.border}`,borderRadius:14,padding:"16px",opacity:reached||isCur?1:0.4,animation:isCur?"glow 3s infinite":"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:isCur?10:4}}>
                        <div>
                          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:reached?T.gold:T.text,letterSpacing:1}}>{m.label} </span>
                          <span style={{fontSize:14,color:T.muted}}>· {m.title}</span>
                        </div>
                        {isCur && <div style={{background:`${T.gold}22`,border:`1px solid ${T.gold}55`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:T.gold}}>YOU ARE HERE</div>}
                        {reached && !isCur && <div style={{color:T.green,fontSize:13,fontWeight:700}}>✓ REACHED</div>}
                      </div>
                      {isCur && (
                        <div style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted,marginBottom:4}}>
                            <span>{fmt(NET_WORTH)}</span>
                            <span>Next: {m.label} → {MILESTONES[i+1]?.label}</span>
                          </div>
                          <div style={{height:5,background:"#1a1a1a",borderRadius:3}}>
                            <div style={{height:"100%",background:`linear-gradient(90deg,${T.gold},${T.goldLt})`,borderRadius:3,width:`${prog}%`,boxShadow:`0 0 8px ${T.gold}80`}}/>
                          </div>
                        </div>
                      )}
                      <div style={{fontSize:12,color:reached?T.goldLt:T.muted}}>🔓 Unlocks: {m.unlocks}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: BILL PANEL ────────────────────────────────────────────── */}
        <div style={{width:300,background:T.sidebar,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
          {/* BILL header */}
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🤖</div>
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:T.gold,letterSpacing:2}}>BILL</div>
                <div style={{fontSize:11,color:T.muted}}>AI Investing Coach</div>
              </div>
              <div style={{marginLeft:"auto",background:`${T.green}18`,border:`1px solid ${T.green}35`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,color:T.green}}>● Live</div>
            </div>
            {/* Quick actions */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                tab==="market"    && "Explain the P/E ratio",
                tab==="learn"     && "Quiz me on value investing",
                tab==="portfolio" && "What's my biggest risk?",
                tab==="home"      && "What should I focus on today?",
                "Give me a stock challenge",
              ].filter(Boolean).slice(0,3).map((q,i)=>(
                <button key={i} onClick={()=>sendAI(q)} style={{background:"#141414",border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 10px",color:T.muted,fontSize:12,fontWeight:600,textAlign:"left",transition:"all 0.15s"}}
                  onMouseOver={e=>e.target.style.borderColor=T.gold+"55"}
                  onMouseOut={e=>e.target.style.borderColor=T.border}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat messages */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
            {aiMsgs.map((m,i)=>(
              <div key={i} style={{marginBottom:10,display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",alignItems:"flex-end",gap:6}}>
                {m.r==="a" && <div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>🤖</div>}
                <div style={{background:m.r==="u"?`linear-gradient(135deg,${T.gold},${T.goldLt})`:T.card2,color:m.r==="u"?"#000":T.text,border:m.r==="u"?"none":`1px solid ${T.border}`,borderRadius:m.r==="u"?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"8px 11px",maxWidth:"85%",fontSize:12,fontWeight:m.r==="u"?700:400,lineHeight:1.55}}>
                  {m.t}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div style={{display:"flex",alignItems:"flex-end",gap:6,marginBottom:10}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.goldLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🤖</div>
                <div style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:"12px 12px 12px 3px",padding:"8px 11px",color:T.muted,fontSize:12,animation:"pulse 1.2s infinite"}}>Thinking… 💭</div>
              </div>
            )}
            {/* Inline quiz */}
            {billQuiz && billQuiz.current < billQuiz.questions.length && (()=>{
              const q = billQuiz.questions[billQuiz.current];
              return (
                <div style={{background:`linear-gradient(135deg,#0d0a00,${T.card2})`,border:`1px solid ${T.gold}40`,borderRadius:12,padding:"12px",marginBottom:10}}>
                  <div style={{fontSize:10,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:6}}>📝 QUIZ {billQuiz.current+1}/{billQuiz.questions.length}</div>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:10,lineHeight:1.5}}>{q.q}</div>
                  {q.opts.map((opt,i)=>{
                    const answered = billQuiz.answers[billQuiz.current] !== undefined;
                    const chosen = billQuiz.answers[billQuiz.current]===i;
                    const correct = i===q.a;
                    let bg="#141414", bc=T.border, tc=T.muted;
                    if(answered){
                      if(correct){bg=`${T.green}20`;bc=T.green;tc=T.green;}
                      else if(chosen){bg=`${T.red}20`;bc=T.red;tc=T.red;}
                    }
                    return (
                      <div key={i} onClick={()=>{
                        if(answered) return;
                        const newQ = {...billQuiz, answers:[...billQuiz.answers,i]};
                        setBillQuiz(newQ);
                        if(i===q.a) setTimeout(()=>setBillQuiz({...newQ,current:newQ.current+1}),1500);
                        else setTimeout(()=>setBillQuiz({...newQ,current:newQ.current+1}),2500);
                      }} style={{background:bg,border:`1px solid ${bc}`,borderRadius:8,padding:"7px 10px",marginBottom:5,cursor:"pointer",color:tc,fontSize:12,fontWeight:600,transition:"all 0.2s"}}>
                        {opt} {answered&&correct&&i===q.a?"✓":""}{answered&&chosen&&!correct?"✗":""}
                      </div>
                    );
                  })}
                  {billQuiz.answers[billQuiz.current]!==undefined && <div style={{fontSize:11,color:T.muted2,marginTop:6,lineHeight:1.4,background:"#ffffff05",borderRadius:6,padding:"6px 8px"}}>💡 {q.exp}</div>}
                </div>
              );
            })()}
            <div ref={chatEndRef}/>
          </div>

          {/* Chat input */}
          <div style={{padding:"10px 12px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()}
              placeholder="Ask BILL anything…"
              style={{flex:1,background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",color:T.text,fontSize:12}}/>
            <button onClick={()=>sendAI()} style={{background:`linear-gradient(135deg,${T.gold},${T.goldLt})`,border:"none",borderRadius:10,width:36,height:36,fontSize:15,color:"#000",fontWeight:900}}>➤</button>
          </div>
        </div>
      </div>

      {/* ══ ANALYSIS WIZARD MODAL ════════════════════════════════════════════ */}
      {wizardStock && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:"#0a0a0a",border:`1px solid ${T.border}`,borderRadius:24,width:"100%",maxWidth:680,maxHeight:"90vh",overflowY:"auto",padding:32}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <span style={{fontSize:40}}>{wizardStock.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:T.gold,letterSpacing:2}}>{wizardStock.sym} — {wizardStock.name}</div>
                <div style={{color:T.muted,fontSize:13}}>${wizardStock.price.toFixed(2)} · {wizardStock.sector} · Analysis Wizard</div>
              </div>
              <button onClick={closeWizard} style={{background:"none",border:"none",color:T.muted,fontSize:24,lineHeight:1}}>✕</button>
            </div>

            {/* Step indicator */}
            <div style={{display:"flex",gap:8,marginBottom:28}}>
              {["Choose Style","Key Metrics","The Question","BILL's Take","Trade"].map((l,i)=>(
                <div key={i} style={{flex:1,textAlign:"center"}}>
                  <div style={{height:3,background:wizardStep>i?T.gold:wizardStep===i?T.goldLt:"#1a1a1a",borderRadius:2,marginBottom:6,transition:"background 0.3s"}}/>
                  <div style={{fontSize:10,color:wizardStep>=i?T.gold:T.muted,fontWeight:wizardStep===i?700:400}}>{l}</div>
                </div>
              ))}
            </div>

            {/* ── Step 0: Choose style ── */}
            {wizardStep===0 && (
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:T.text,letterSpacing:1,marginBottom:4}}>HOW DO YOU WANT TO ANALYZE THIS STOCK?</div>
                <div style={{color:T.muted,fontSize:13,marginBottom:20}}>Different investors use different lenses. Pick the one you're learning right now.</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {STYLES.map((s,i)=>(
                    <div key={s.id} className="hov" onClick={()=>{ setWizardStyle(s.id); setWizardStep(1); }}
                      style={{background:`linear-gradient(135deg,${s.bg},${T.card})`,border:`1px solid ${s.color}40`,borderRadius:14,padding:"16px",cursor:"pointer",opacity:i>1?0.4:1,pointerEvents:i>1?"none":"auto"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <span style={{fontSize:24}}>{s.icon}</span>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:s.color,letterSpacing:1}}>{s.label}</div>
                        {i>1 && <span style={{fontSize:12,color:T.muted,marginLeft:"auto"}}>🔒</span>}
                      </div>
                      <div style={{fontSize:12,color:T.muted2,marginBottom:6}}>{s.desc}</div>
                      <div style={{fontSize:11,color:s.color,fontWeight:600}}>Key: {s.metrics[0]}, {s.metrics[1]}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{ setWizardStep(4); }} style={{marginTop:16,background:"none",border:"none",color:T.muted,fontSize:12,cursor:"pointer"}}>Skip analysis → Quick Trade</button>
              </div>
            )}

            {/* ── Step 1: Key Metrics ── */}
            {wizardStep===1 && style && wizardMetrics && (
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontSize:24}}>{style.icon}</span>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:style.color,letterSpacing:1}}>{style.label} Analysis: {wizardStock.sym}</div>
                </div>
                <div style={{color:T.muted,fontSize:13,marginBottom:20}}>Here are the key metrics a {style.label} investor would check first.</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
                  {wizardMetrics.map((m,i)=>(
                    <div key={i} style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px"}}>
                      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1,marginBottom:4}}>{m.l}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:m.good?T.goldLt:T.red,letterSpacing:1,marginBottom:4}}>{m.v}</div>
                      {m.avg && <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Industry avg: {m.avg}</div>}
                      <div style={{fontSize:12,color:T.muted2,lineHeight:1.4}}>{m.d}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setWizardStep(2)} style={{width:"100%",background:`linear-gradient(135deg,${style.color},${style.color}cc)`,border:"none",borderRadius:12,padding:"13px",color:"#000",fontWeight:800,fontSize:15}}>I've reviewed the metrics →</button>
              </div>
            )}

            {/* ── Step 2: The Big Question ── */}
            {wizardStep===2 && style && (
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:T.text,letterSpacing:1,marginBottom:4}}>THE BIG QUESTION</div>
                <div style={{color:T.muted,fontSize:13,marginBottom:20}}>BILL wants to know what YOU think before giving the answer. There's no wrong answer — this is about learning to reason.</div>
                <div style={{background:`linear-gradient(135deg,#0d0a00,${T.card})`,border:`1px solid ${T.gold}35`,borderRadius:16,padding:"20px",marginBottom:20}}>
                  <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:2,marginBottom:10}}>🤖 BILL ASKS:</div>
                  <div style={{fontWeight:600,fontSize:16,lineHeight:1.6,marginBottom:16}}>
                    {wizardStyle==="value" ? `${wizardStock.name}'s P/E is ${wizardStock.pe}x vs the industry average of 24x. As a value investor, how would you read this?` :
                     wizardStyle==="growth" ? `${wizardStock.name}'s revenue is growing at ${wizardStock.growth}% per year. Is this fast enough to be a true growth stock?` :
                     `Based on what you've seen so far, would you consider ${wizardStock.name} a strong candidate for this strategy?`}
                  </div>
                  {[
                    wizardStyle==="value" ? ["It's undervalued — great buy!","It's fairly valued — reasonable price","It's overvalued — I'd wait for a dip"] :
                    wizardStyle==="growth" ? ["Yes — this is elite growth","It's decent but not exceptional","No — not fast enough for a growth investor"] :
                    ["Strongly yes","Somewhat yes","Not sure yet","No"]
                  ][0].map((opt,i)=>(
                    <div key={i} onClick={()=>{ setWizardAnswer(i); }} className="hov"
                      style={{background:wizardAnswer===i?`${T.gold}22`:"#141414",border:`1px solid ${wizardAnswer===i?T.gold:T.border}`,borderRadius:10,padding:"11px 14px",marginBottom:8,cursor:"pointer",color:wizardAnswer===i?T.goldLt:T.muted,fontWeight:wizardAnswer===i?700:400,fontSize:14,transition:"all 0.2s"}}>
                      {opt}
                    </div>
                  ))}
                </div>
                {wizardAnswer!==null && <button onClick={()=>setWizardStep(3)} style={{width:"100%",background:`linear-gradient(135deg,${style.color},${style.color}cc)`,border:"none",borderRadius:12,padding:"13px",color:"#000",fontWeight:800,fontSize:15}}>See BILL's Take →</button>}
              </div>
            )}

            {/* ── Step 3: BILL's Take ── */}
            {wizardStep===3 && style && (
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:T.gold,letterSpacing:1,marginBottom:4}}>🤖 BILL'S TAKE</div>
                <div style={{color:T.muted,fontSize:13,marginBottom:20}}>Here's how an experienced {style.label} investor would think about {wizardStock.sym}:</div>
                <div style={{background:`linear-gradient(135deg,#0d0a00,${T.card})`,border:`1px solid ${T.gold}35`,borderRadius:16,padding:"22px",marginBottom:16}}>
                  <div style={{fontSize:15,lineHeight:1.75,color:T.text}}>
                    {wizardStyle==="value" && `${wizardStock.name}'s P/E of ${wizardStock.pe}x sits above the industry average of 24x, which means the market is pricing in future growth. A classic value investor like Buffett would ask: is that growth reliable? Apple's moat — "${wizardStock.moat}" — is one of the strongest in the world, which justifies paying a premium. The bull case is paying slightly more for a fortress business. The bear case is that at 28x, there's less margin of safety if growth slows.`}
                    {wizardStyle==="growth" && `${wizardStock.name} is growing revenue at ${wizardStock.growth}% per year — ${wizardStock.growth>20?"exceptional for a company this size. Peter Lynch would say this is the kind of growth story you want to own before everyone else figures it out.":"solid, but a true growth investor wants 25%+ ideally. The key question is: can this growth rate sustain for 5+ more years?"} The TAM is massive, and the company is still gaining market share. Growth investors often pay premium prices for premium growth — the risk is if growth slows unexpectedly.`}
                    {wizardStyle==="ta" && `Looking at the technical picture for ${wizardStock.name}: the RSI of 54 puts it in neutral territory — not overbought, not oversold. The stock is trading above its 50-day and 200-day moving averages, which is bullish. Volume has been consistent with the trend. A technical analyst would see a clean uptrend without warning signs. The risk is a pullback to the 50-day MA — that would be the key support level to watch.`}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
                  <div style={{background:`${T.green}10`,border:`1px solid ${T.green}25`,borderRadius:12,padding:"14px"}}>
                    <div style={{fontSize:11,color:T.green,fontWeight:700,marginBottom:6}}>🐂 BULL CASE</div>
                    <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>{wizardStock.moat} is a durable advantage. Strong execution and growing earnings justify the price.</div>
                  </div>
                  <div style={{background:`${T.red}10`,border:`1px solid ${T.red}25`,borderRadius:12,padding:"14px"}}>
                    <div style={{fontSize:11,color:T.red,fontWeight:700,marginBottom:6}}>🐻 BEAR CASE</div>
                    <div style={{fontSize:13,color:T.text,lineHeight:1.5}}>Premium valuation means any slowdown in growth could trigger a sharp pullback. Less margin of safety.</div>
                  </div>
                </div>
                <button onClick={()=>setWizardStep(4)} style={{width:"100%",background:`linear-gradient(135deg,${style.color},${style.color}cc)`,border:"none",borderRadius:12,padding:"13px",color:"#000",fontWeight:800,fontSize:15}}>Make My Decision →</button>
              </div>
            )}

            {/* ── Step 4: Trade Decision ── */}
            {wizardStep===4 && (
              <div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:T.text,letterSpacing:1,marginBottom:4}}>YOUR DECISION</div>
                <div style={{color:T.muted,fontSize:13,marginBottom:20}}>You've done the analysis. Now trust it.</div>
                <div style={{display:"flex",gap:10,marginBottom:20}}>
                  {["buy","sell","skip"].map(m=>(
                    <button key={m} onClick={()=>setWizardAnswer(m)}
                      style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${wizardAnswer===m?(m==="buy"?T.green:m==="sell"?T.red:T.gold):T.border}`,fontWeight:800,fontSize:14,cursor:"pointer",
                        background:wizardAnswer===m?(m==="buy"?`${T.green}22`:m==="sell"?`${T.red}22`:`${T.gold}22`):"#141414",
                        color:wizardAnswer===m?(m==="buy"?T.green:m==="sell"?T.red:T.gold):T.muted}}>
                      {m==="buy"?"📈 BUY":m==="sell"?"📉 SELL":"⏸ SKIP (learn more)"}
                    </button>
                  ))}
                </div>
                {(wizardAnswer==="buy"||wizardAnswer==="sell") && (
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:12,color:T.muted,marginBottom:8}}>Number of shares</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <button onClick={()=>setTradeQty(q=>Math.max(1,q-1))} style={{background:"#141414",border:`1px solid ${T.border}`,borderRadius:8,width:36,height:36,fontSize:18,color:T.text}}>−</button>
                      <input value={tradeQty} onChange={e=>setTradeQty(Math.max(1,parseInt(e.target.value)||1))} type="number"
                        style={{flex:1,background:"#141414",border:`1px solid ${T.border}`,borderRadius:8,padding:"8px",textAlign:"center",fontFamily:"'Bebas Neue',cursive",fontSize:22,color:T.gold,letterSpacing:1}}/>
                      <button onClick={()=>setTradeQty(q=>q+1)} style={{background:"#141414",border:`1px solid ${T.border}`,borderRadius:8,width:36,height:36,fontSize:18,color:T.text}}>+</button>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:10,background:"#141414",borderRadius:10,padding:"10px 14px"}}>
                      <span style={{color:T.muted,fontSize:13}}>Total</span>
                      <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:T.gold,letterSpacing:1}}>{fmt(wizardStock.price*(parseInt(tradeQty)||1))}</span>
                    </div>
                  </div>
                )}
                {wizardAnswer && (
                  <button onClick={closeWizard}
                    style={{width:"100%",padding:"14px",borderRadius:13,border:"none",fontWeight:900,fontSize:16,cursor:"pointer",
                      background:wizardAnswer==="buy"?`linear-gradient(135deg,${T.green},#16a34a)`:wizardAnswer==="sell"?`linear-gradient(135deg,${T.red},#b91c1c)`:`linear-gradient(135deg,${T.gold},${T.goldLt})`,
                      color:"#000"}}>
                    {wizardAnswer==="buy"?"Confirm Buy + Quick Quiz":"Confirm Sell + Quick Quiz"}
                    {wizardAnswer==="skip"?"Back to Market":""} →
                  </button>
                )}
                <div style={{marginTop:10,fontSize:12,color:T.muted,textAlign:"center"}}>A 2-question quiz will follow to lock in what you learned</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
