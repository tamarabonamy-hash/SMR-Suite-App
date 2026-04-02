'use client'

import { useState } from "react";

// Note: Uncomment and update path once you copy your useWordExport file:
// import { exportDiagnostic, exportPrioritisation, exportDecisionStack, exportRoleAnalyser, exportRhythm, exportKPIs, exportCapability, exportChange } from '../lib/useWordExport';

// Stub export functions until useWordExport is connected
const exportDiagnostic=()=>{};
const exportPrioritisation=()=>{};
const exportDecisionStack=()=>{};
const exportRoleAnalyser=()=>{};
const exportRhythm=()=>{};
const exportKPIs=()=>{};
const exportCapability=()=>{};
const exportChange=()=>{};

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const G    = "#2C4A3E";  // Forest green
const GOLD = "#D4A847";  // Amber gold
const S1   = "#F7F4EF";  // Cream - page bg
const S2   = "#EEE9E1";  // Warm card bg
const S3   = "#E6E0D8";  // Elevated card
const T1   = "#1C2B25";  // Primary text
const T2   = "#2C4A3E";  // Secondary text
const T3   = "#3D5A4F";  // Body text
const T4   = "#5A7A6E";  // Muted
const RED  = "#B94040";
const AMBER= "#C89A2A";
const G_MID= "#4a7a68";
const CREAM= "#F7F4EF";
const BDR  = "rgba(44,74,62,0.15)";

const mono  = {fontFamily:"'DM Mono',monospace"};
const serif = {fontFamily:"'Playfair Display',Georgia,serif"};

const CSS=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body,#root{background:#F7F4EF;color:#1C2B25;font-family:'DM Sans',sans-serif;min-height:100vh;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#2C4A3E;}
::-webkit-scrollbar-thumb{background:rgba(212,168,71,0.5);border-radius:3px;}
input,textarea,select{background:#EEE9E1;border:1px solid rgba(44,74,62,0.2);color:#1C2B25;font-family:'DM Sans',sans-serif;font-size:13px;padding:9px 12px;outline:none;width:100%;border-radius:0;}
input:focus,textarea:focus,select:focus{border-color:#D4A847;box-shadow:0 0 0 2px rgba(212,168,71,0.15);}
select{background:#EEE9E1;cursor:pointer;}
textarea{resize:vertical;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function SL({children,color=GOLD}){return <div style={{...mono,fontSize:10,color,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>{children}</div>;}
function SectionLabel({children,color=GOLD}){return <SL color={color}>{children}</SL>;}
function Card({children,style={},gold=false}){return <div style={{background:S2,border:`1px solid ${gold?"rgba(212,168,71,0.3)":BDR}`,padding:24,...style}}>{children}</div>;}
function GBtn({children,onClick,disabled,style={}}){return <button onClick={onClick} disabled={disabled} style={{background:disabled?"rgba(212,168,71,0.3)":GOLD,color:G,border:"none",padding:"11px 26px",...mono,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",fontWeight:700,transition:"opacity 0.15s",...style}}>{children}</button>;}
function GoldButton(p){return <GBtn {...p}/>;}
function OBtn({children,onClick,style={}}){return <button onClick={onClick} style={{background:"transparent",color:T2,border:`1.5px solid ${G}`,padding:"9px 20px",...mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",...style}}>{children}</button>;}
function OutlineButton(p){return <OBtn {...p}/>;}
function Callout({children,color=GOLD}){return <div style={{background:"rgba(212,168,71,0.08)",border:`1px solid rgba(212,168,71,0.25)`,padding:"14px 18px",marginBottom:20,fontSize:13,color:T2,lineHeight:1.7}}>{children}</div>;}
function TabBar({tabs,active,onChange}){return <div style={{display:"flex",borderBottom:`2px solid ${BDR}`,marginBottom:24}}>{tabs.map(({id,label})=><button key={id} onClick={()=>onChange(id)} style={{background:"none",border:"none",borderBottom:active===id?`2px solid ${GOLD}`:"2px solid transparent",padding:"10px 16px",...mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",color:active===id?GOLD:T4,marginBottom:-2,transition:"color 0.15s"}}>{label}</button>)}</div>;}
function DataTable({headers,rows}){return <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{headers.map((h,i)=><th key={i} style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",padding:"8px 12px",textAlign:"left",background:S3,borderBottom:`2px solid ${GOLD}`}}>{h}</th>)}</tr></thead><tbody>{rows.map((row,ri)=><tr key={ri} style={{background:ri%2===0?S2:S1}}>{row.map((cell,ci)=><td key={ci} style={{padding:"9px 12px",color:ci===0?T2:T3,fontWeight:ci===0?600:400,borderBottom:`1px solid ${BDR}`,verticalAlign:"top",lineHeight:1.5}}>{cell}</td>)}</tr>)}</tbody></table></div>;}
function Pill({children,color=GOLD,bg}){return <span style={{...mono,fontSize:9,color:color,background:bg||color+"18",border:`1px solid ${color}44`,padding:"2px 8px",letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>;}
function InfoBox({children}){return <div style={{background:"rgba(44,74,62,0.05)",border:`1px solid ${BDR}`,padding:"12px 16px",marginBottom:16,fontSize:12,color:T3,lineHeight:1.7,fontStyle:"italic"}}>{children}</div>;}

// ─── TOOL 1 — STRATEGY DIAGNOSTIC ════════════════════════════════════════════
const DIAG_DIMS=[
  {id:"strategy_clarity",num:"01",label:"Strategy Clarity",tagline:"Does everyone know where you're going — and why?",
   intro:"McKinsey found only 28% of executives could list their company's top three priorities. Without clarity, every team makes its own version of the strategy.",
   levels:[
    {label:"Critical",color:"#B94040",bg:"rgba(185,64,64,0.07)",desc:"No clear strategy. Direction shifts constantly.",examples:["No strategy document exists","Ask three leaders what matters — get three answers","Teams executing on last year's plan"]},
    {label:"Weak",color:"#C0622A",bg:"rgba(192,98,42,0.07)",desc:"Strategy exists in a deck, not in decisions.",examples:["Presented once, rarely referenced","No narrative for managers to use","Frontline can't connect work to strategy"]},
    {label:"Developing",color:"#C89A2A",bg:"rgba(200,154,42,0.07)",desc:"Leaders understand it but cascade is uneven.",examples:["Some teams have OKRs linked to strategy","Managers describe it but struggle to apply it","Quarterly reviews reference but don't drive priorities"]},
    {label:"Capable",color:"#4a7a68",bg:"rgba(74,122,104,0.07)",desc:"Clearly articulated, consistently communicated.",examples:["One-page narrative used by people leaders","Team goals linked to strategic pillars","Leaders use it to make trade-offs and say no"]},
    {label:"Leading",color:"#2C6B52",bg:"rgba(44,107,82,0.08)",desc:"A living system used as the logic for every decision.",examples:["Reviewed and refreshed quarterly","Every initiative tested against strategic fit","Frontline articulates their contribution unprompted"]}
  ]},
  {id:"leadership_alignment",num:"02",label:"Leadership Alignment",tagline:"Are your leaders pulling in the same direction?",
   intro:"Prosci identifies active and visible executive sponsorship as the single highest contributor to change success. When leaders fragment, so does execution.",
   levels:[
    {label:"Critical",color:"#B94040",bg:"rgba(185,64,64,0.07)",desc:"Visibly misaligned. Competing agendas play out publicly.",examples:["Executives sponsor competing initiatives","Decisions relitigated across forums","Teams play leaders off against each other"]},
    {label:"Weak",color:"#C0622A",bg:"rgba(192,98,42,0.07)",desc:"Aligned in the room, mixed messages outside.",examples:["Priorities agreed in workshops, silos return at desks","Sponsor visible at launch, absent during delivery","BAU crowds out transformation commitments"]},
    {label:"Developing",color:"#C89A2A",bg:"rgba(200,154,42,0.07)",desc:"Mostly aligned but gaps create friction.",examples:["Agreed priorities but no shared tracking metrics","Some leaders champion; others are passive","Functional priorities still override shared goals"]},
    {label:"Capable",color:"#4a7a68",bg:"rgba(74,122,104,0.07)",desc:"Demonstrably aligned. Consistent messages, shared accountability.",examples:["Shared scorecard with collective accountability","Leaders model the behaviours they ask of others","Sponsor attends key milestones"]},
    {label:"Leading",color:"#2C6B52",bg:"rgba(44,107,82,0.08)",desc:"Alignment is structural. Built to outlast personnel changes.",examples:["Performance frameworks link to transformation delivery","Leadership coalition formally constituted","Leaders advocate in board reporting"]}
  ]},
  {id:"initiative_prioritisation",num:"03",label:"Initiative Discipline",tagline:"Are you doing fewer things, better?",
   intro:"Organisations that fail to prioritise ruthlessly dilute focus, exhaust capacity, and deliver nothing well. Stopping work is as important as starting it.",
   levels:[
    {label:"Critical",color:"#B94040",bg:"rgba(185,64,64,0.07)",desc:"No prioritisation. Everything urgent, nothing resourced.",examples:["20+ strategic priorities active simultaneously","New work added without removing anything","No process for evaluating against strategic value"]},
    {label:"Weak",color:"#C0622A",bg:"rgba(192,98,42,0.07)",desc:"Reactive. Whoever asks loudest wins.",examples:["Priority determined by relationships not merit","Teams re-prioritise on ad hoc requests","No visibility of total initiative load"]},
    {label:"Developing",color:"#C89A2A",bg:"rgba(200,154,42,0.07)",desc:"A framework exists but applied inconsistently.",examples:["Portfolio register exists but not actively managed","High-priority work shares resources equally with BAU","Effort-vs-impact mapping done but not operationalised"]},
    {label:"Capable",color:"#4a7a68",bg:"rgba(74,122,104,0.07)",desc:"Prioritised against clear criteria. Resources follow priority.",examples:["Portfolio governance determines what proceeds","New intake requires strategic alignment sign-off","Portfolio health reviewed monthly at leadership level"]},
    {label:"Leading",color:"#2C6B52",bg:"rgba(44,107,82,0.08)",desc:"Portfolio discipline embedded in the operating rhythm.",examples:["Annual planning includes explicit stop decisions","Capacity treated as a strategic asset","Benefits realisation informs future prioritisation"]}
  ]},
  {id:"governance_maturity",num:"04",label:"Governance Maturity",tagline:"Are the right decisions being made, by the right people?",
   intro:"PMI research links governance maturity to on-time, on-budget delivery. Mature governance means faster, cleaner decisions — not more bureaucracy.",
   levels:[
    {label:"Critical",color:"#B94040",bg:"rgba(185,64,64,0.07)",desc:"No governance. No accountability for outcomes.",examples:["No steering committee or programme board","Decisions require access to busy executives","RACI never defined for key workstreams"]},
    {label:"Weak",color:"#C0622A",bg:"rgba(192,98,42,0.07)",desc:"Structures exist on paper. Don't function.",examples:["Steering committee meets but decisions undocumented","Escalation paths routinely bypassed","Meetings used to report, not decide"]},
    {label:"Developing",color:"#C89A2A",bg:"rgba(200,154,42,0.07)",desc:"Functional but inconsistent across workstreams.",examples:["Steering committee meets with structured agenda","Decision logs exist, follow-through uneven","Escalation threshold unclear"]},
    {label:"Capable",color:"#4a7a68",bg:"rgba(74,122,104,0.07)",desc:"Consistently applied. Decision rights clear.",examples:["Clear terms of reference and live decision log","RACI actively referenced","Programme board reviews risk register monthly"]},
    {label:"Leading",color:"#2C6B52",bg:"rgba(44,107,82,0.08)",desc:"Adaptive and lightweight. Right-sized and trusted.",examples:["Cadence reviewed at each phase gate","Authority clearly delegated","Governance health measured as a programme metric"]}
  ]},
  {id:"change_capability",num:"05",label:"Change Capability",tagline:"Can your organisation manage the human side?",
   intro:"Organisations with excellent change management are 6× more likely to meet objectives. Yet most treat change as a comms plan. That gap is where transformations quietly die.",
   levels:[
    {label:"Critical",color:"#B94040",bg:"rgba(185,64,64,0.07)",desc:"Change management doesn't exist. Resistance managed by mandate.",examples:["No dedicated change resource","Communication is a single email or town hall","Resistance treated as insubordination"]},
    {label:"Weak",color:"#C0622A",bg:"rgba(192,98,42,0.07)",desc:"Change confused with comms or training.",examples:["Comms plan exists but no change strategy","Training scheduled at go-live","No measurement of adoption or resistance"]},
    {label:"Developing",color:"#C89A2A",bg:"rgba(200,154,42,0.07)",desc:"Recognised on major programmes. Inconsistent quality.",examples:["ADKAR used by some practitioners","Impact assessments conducted but not always actioned","Capability sits with individuals, not embedded"]},
    {label:"Capable",color:"#4a7a68",bg:"rgba(74,122,104,0.07)",desc:"Common methodology. Adoption measured. Leaders equipped.",examples:["Dedicated change lead from initiation","Readiness assessed at multiple milestones","Go-live decisions consider readiness"]},
    {label:"Leading",color:"#2C6B52",bg:"rgba(44,107,82,0.08)",desc:"Change is an organisational competency.",examples:["Change centre of excellence with defined standards","ROI tracked: adoption, benefit realisation, productivity","Change maturity reviewed annually"]}
  ]},
  {id:"delivery_discipline",num:"06",label:"Delivery Discipline",tagline:"Do your projects deliver what they promised?",
   intro:"High-maturity organisations waste 13× less money than low-maturity peers (PMI). Benefits realisation — not go-live — is the real finish line.",
   levels:[
    {label:"Critical",color:"#B94040",bg:"rgba(185,64,64,0.07)",desc:"No framework. No visibility of risk.",examples:["No milestone tracking or status reporting","Issues surface at crisis point","Projects 'done' when system goes live"]},
    {label:"Weak",color:"#C0622A",bg:"rgba(192,98,42,0.07)",desc:"Basic structures exist. Don't drive decisions.",examples:["Status reports not used in forums","RAG ratings inflated","Project managers are administrators not leaders"]},
    {label:"Developing",color:"#C89A2A",bg:"rgba(200,154,42,0.07)",desc:"Disciplines applied inconsistently.",examples:["Methodology exists but compliance varies","Risk registers updated irregularly","Escalation not always through defined paths"]},
    {label:"Capable",color:"#4a7a68",bg:"rgba(74,122,104,0.07)",desc:"Consistent rigour. Status visible and trusted.",examples:["Common methodology with defined tollgates","Portfolio dashboard updated weekly","RAG ratings honest — governance responds"]},
    {label:"Leading",color:"#2C6B52",bg:"rgba(44,107,82,0.08)",desc:"Delivery is a competitive advantage. The org learns.",examples:["Post-implementation reviews within 90 days","Benefits tracked at 6 and 12 months post go-live","PMO sets standards and coaches teams"]}
  ]}
];
const SLABELS=["","Critical","Weak","Developing","Capable","Leading"];
const DRISK={strategy_clarity:"Without clear strategy, execution is directionless. Every initiative competes equally. Teams make locally rational decisions that collectively fragment the effort.",leadership_alignment:"Misaligned leaders send conflicting signals. Teams stall waiting for consensus. Fragmented leadership is the fastest way to kill a transformation.",initiative_prioritisation:"Too many initiatives dilute focus and exhaust capacity. When everything is a priority, nothing is.",governance_maturity:"Without governance, decisions loop endlessly. Issues sit unresolved. Accountability evaporates mid-delivery.",change_capability:"Without structured change management, resistance mounts silently and surfaces as adoption failure long after go-live.",delivery_discipline:"Projects drift. Deadlines slip. The gap between plan and reality widens invisibly until it's too late to recover."};
const DROAD={strategy_clarity:["Facilitate a strategy articulation workshop — produce a single-page narrative for cascade","Translate strategy into team-level OKRs — test comprehension at frontline","Establish a quarterly strategy review cadence with explicit prioritisation decisions"],leadership_alignment:["Run a leadership alignment diagnostic — define shared accountability for transformation","Constitute a formal leadership coalition with terms of reference and collective scorecard","Build a sponsor coaching plan (CLARC: Communicator, Liaison, Advocate, Resistance Manager, Coach)"],initiative_prioritisation:["Map all active initiatives against strategic objectives — include resource demand","Apply effort-vs-impact framework — make explicit stop/pause decisions","Establish a governance gate: nothing proceeds without strategic alignment sign-off"],governance_maturity:["Define RACI for all significant decisions and document escalation thresholds","Stand up a steering committee with TOR, decision log, and attendance commitment","Review governance at every phase gate and right-size to programme needs"],change_capability:["Conduct an organisational readiness assessment (ADKAR) before planning comms or training","Appoint dedicated change leads on all significant workstreams from initiation","Build a change leadership coaching plan for all people leaders"],delivery_discipline:["Implement a consistent delivery methodology with defined tollgates across all programmes","Stand up a portfolio health dashboard reviewed weekly — calibrate RAG ratings","Institute post-implementation reviews within 90 days — track benefits at 6 and 12 months"]};

function scoreColor(s){if(!s)return T4;if(s<=2)return RED;if(s===3)return AMBER;return G_MID;}

function Tool1Diagnostic({onComplete}){
  const[scores,setScores]=useState({});
  const[expanded,setExpanded]=useState({strategy_clarity:true});
  const[view,setView]=useState("input");

  function selectScore(dimId,val){
    const ns={...scores,[dimId]:val};
    setScores(ns);
    const idx=DIAG_DIMS.findIndex(d=>d.id===dimId);
    const next=DIAG_DIMS.find((d,i)=>i>idx&&!ns[d.id]);
    if(next){setTimeout(()=>{setExpanded(p=>({...p,[dimId]:false,[next.id]:true}));},350);}
  }

  const scored=Object.keys(scores).length;
  const vals=DIAG_DIMS.map(d=>scores[d.id]||0);
  const avg=scored===6?vals.reduce((a,b)=>a+b,0)/6:0;
  const risks=DIAG_DIMS.filter(d=>scores[d.id]<=2);
  const cautions=DIAG_DIMS.filter(d=>scores[d.id]===3);
  const strengths=DIAG_DIMS.filter(d=>scores[d.id]>=4);

  if(view==="results"&&scored===6){
    const ml=avg<2?"Critical":avg<3?"Weak":avg<4?"Developing":avg<5?"Capable":"Leading";
    return <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card gold style={{padding:28}}>
          <SL>Overall Maturity</SL>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
            <div style={{...serif,fontSize:56,fontWeight:700,color:GOLD,lineHeight:1}}>{avg.toFixed(1)}</div>
            <div style={{...mono,fontSize:10,color:T4,lineHeight:1.8}}>/ 5.0<br/><span style={{color:GOLD}}>{ml}</span></div>
          </div>
          <div style={{...serif,fontSize:13,color:T3,fontStyle:"italic",lineHeight:1.5,marginBottom:16,maxWidth:260}}>
            {avg<2.5?"Your organisation is at high risk of execution failure. Urgent intervention needed.":avg<3.5?"Meaningful gaps between strategy and delivery. Progress is fragile without deliberate action.":avg<4.5?"Foundation is sound — but gaps will compound under pressure.":"Executing with genuine discipline. Protect and build on this capability."}
          </div>
          <div style={{display:"flex",gap:20}}>
            <div><div style={{...serif,fontSize:24,fontWeight:700,color:RED}}>{risks.length}</div><div style={{...mono,fontSize:9,color:T4,textTransform:"uppercase",letterSpacing:"0.08em"}}>Critical</div></div>
            <div><div style={{...serif,fontSize:24,fontWeight:700,color:AMBER}}>{cautions.length}</div><div style={{...mono,fontSize:9,color:T4,textTransform:"uppercase",letterSpacing:"0.08em"}}>Caution</div></div>
            <div><div style={{...serif,fontSize:24,fontWeight:700,color:G_MID}}>{strengths.length}</div><div style={{...mono,fontSize:9,color:T4,textTransform:"uppercase",letterSpacing:"0.08em"}}>Strength</div></div>
          </div>
        </Card>
        <Card style={{padding:28}}>
          <SL>Dimension Breakdown</SL>
          {DIAG_DIMS.map(dim=>{
            const s=scores[dim.id]||0;const col=scoreColor(s);const pct=(s-1)/4*100;
            return <div key={dim.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"baseline"}}>
                <span style={{fontSize:12,color:T2,fontWeight:600}}>{dim.label}</span>
                <span style={{...mono,fontSize:10,color:col}}>{s} — {SLABELS[s]}</span>
              </div>
              <div style={{height:3,background:S3,borderRadius:2}}><div style={{height:"100%",width:pct+"%",background:col,borderRadius:2,transition:"width 0.6s ease"}}/></div>
            </div>;
          })}
        </Card>
      </div>
      {risks.length>0&&<Card style={{padding:24,marginBottom:12,border:"1px solid rgba(185,64,64,0.3)",background:"rgba(185,64,64,0.04)"}}>
        <SL color={RED}>⚠ Key Risk Areas</SL>
        {risks.map(d=><div key={d.id} style={{borderLeft:`3px solid ${RED}`,paddingLeft:14,marginBottom:14}}>
          <div style={{...serif,fontSize:14,color:T1,fontWeight:700,marginBottom:4}}>{d.label}</div>
          <div style={{fontSize:12,color:T3,lineHeight:1.7}}>{DRISK[d.id]}</div>
        </div>)}
      </Card>}
      <Card style={{padding:24,marginBottom:12}}>
        <SL>Improvement Roadmap</SL>
        {[{label:"Immediate — Address First",dims:risks,color:RED,note:"Act before the next major initiative begins."},
          {label:"Short-Term — Strengthen",dims:cautions,color:AMBER,note:"Embed into your programme plan in the next 90 days."},
          {label:"Sustain — Protect Strengths",dims:strengths,color:G_MID,note:"Strengths erode under delivery pressure — actively protect them."}
        ].filter(t=>t.dims.length>0).map(tier=><div key={tier.label} style={{marginBottom:24}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:tier.color,flexShrink:0}}/>
            <span style={{...mono,fontSize:10,color:tier.color,textTransform:"uppercase",letterSpacing:"0.1em"}}>{tier.label}</span>
          </div>
          <div style={{fontSize:11,color:T4,fontStyle:"italic",marginLeft:14,marginBottom:10}}>{tier.note}</div>
          {tier.dims.map(dim=><div key={dim.id} style={{marginLeft:14,marginBottom:12}}>
            <div style={{...serif,fontSize:13,color:T2,fontWeight:700,marginBottom:6}}>{dim.label}</div>
            {DROAD[dim.id].map((a,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
              <span style={{color:GOLD,fontSize:11,flexShrink:0,marginTop:1}}>—</span>
              <span style={{fontSize:12,color:T3,lineHeight:1.6}}>{a}</span>
            </div>)}
          </div>)}
        </div>)}
      </Card>
      <div style={{display:"flex",gap:10,justifyContent:"space-between",alignItems:"center"}}>
        <OBtn onClick={()=>setView("input")}>← Revise Scores</OBtn>
        <div style={{display:"flex",gap:10}}>
          <OBtn onClick={()=>exportDiagnostic({scores,dims:DIAG_DIMS,slabels:SLABELS,risks,cautions,strengths,roadmapActions:DROAD,riskMsgs:DRISK})}>↓ Download Report</OBtn>
          {onComplete&&<GBtn onClick={()=>onComplete(scores)}>Prioritise Initiatives →</GBtn>}
        </div>
      </div>
    </div>;
  }

  return <div>
    <Callout><strong style={{color:GOLD}}>How to score:</strong> For each dimension, read all five levels and select the one that most accurately reflects your organisation <em>right now</em> — not your best project or aspiration. If torn, choose the lower level.</Callout>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{...mono,fontSize:10,color:T4,letterSpacing:"0.08em"}}>{scored} of 6 scored</div>
      <div style={{height:3,background:S3,borderRadius:2,flex:1,margin:"0 16px"}}><div style={{height:"100%",width:(scored/6*100)+"%",background:GOLD,borderRadius:2,transition:"width 0.4s"}}/></div>
      <div style={{...mono,fontSize:10,color:scored===6?GOLD:T4}}>{scored===6?"Ready":"Score all 6"}</div>
    </div>
    {DIAG_DIMS.map(dim=>{
      const s=scores[dim.id];const isOpen=expanded[dim.id];
      return <div key={dim.id} style={{background:S2,border:`1px solid ${BDR}`,marginBottom:2,overflow:"hidden"}}>
        <div onClick={()=>setExpanded(p=>({...p,[dim.id]:!p[dim.id]}))} style={{padding:"18px 22px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,userSelect:"none"}}>
          <div style={{display:"flex",gap:14,alignItems:"center",flex:1}}>
            <span style={{...mono,fontSize:9,color:"rgba(212,168,71,0.5)"}}>{dim.num}</span>
            <div>
              <div style={{...serif,fontSize:16,fontWeight:700,color:T1}}>{dim.label}</div>
              <div style={{fontSize:12,color:T3,marginTop:1}}>{dim.tagline}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
            {s?<Pill color={scoreColor(s)}>{s} — {SLABELS[s]}</Pill>:<span style={{...mono,fontSize:9,color:T4,border:`1px solid ${BDR}`,padding:"2px 8px"}}>Not scored</span>}
            <span style={{...mono,fontSize:10,color:T4,transition:"transform 0.2s",display:"inline-block",transform:isOpen?"rotate(180deg)":"none"}}>▼</span>
          </div>
        </div>
        {isOpen&&<div style={{borderTop:`1px solid ${BDR}`,padding:"0 22px 22px",animation:"fadeIn 0.2s ease"}}>
          <div style={{fontSize:12,color:T3,lineHeight:1.7,padding:"14px 0 18px",borderBottom:`1px solid ${BDR}`,marginBottom:18,fontStyle:"italic"}}>{dim.intro}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3}}>
            {dim.levels.map((lvl,i)=>{
              const isSel=s===i+1;
              return <div key={i} onClick={()=>selectScore(dim.id,i+1)} style={{padding:"12px 10px 14px",cursor:"pointer",border:`2px solid ${isSel?lvl.color:"transparent"}`,background:lvl.bg,position:"relative",transition:"border-color 0.15s"}}>
                {isSel&&<div style={{position:"absolute",top:7,right:7,width:14,height:14,borderRadius:"50%",background:lvl.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:700}}>✓</div>}
                <div style={{...mono,fontSize:19,fontWeight:500,color:lvl.color,lineHeight:1}}>{i+1}</div>
                <div style={{...mono,fontSize:9,color:lvl.color,textTransform:"uppercase",letterSpacing:"0.08em",margin:"3px 0 8px"}}>{lvl.label}</div>
                <div style={{fontSize:11,color:T2,lineHeight:1.5,marginBottom:8}}>{lvl.desc}</div>
                <ul style={{listStyle:"none"}}>{lvl.examples.map((ex,j)=><li key={j} style={{fontSize:10,color:T3,lineHeight:1.5,paddingLeft:10,position:"relative",marginBottom:3}}><span style={{position:"absolute",left:0,color:GOLD,fontSize:9}}>—</span>{ex}</li>)}</ul>
              </div>;
            })}
          </div>
        </div>}
      </div>;
    })}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24}}>
      <div style={{fontSize:12,color:scored===6?"rgba(212,168,71,0.7)":RED}}>{scored===6?"All 6 scored — ready to generate results":"Score all 6 dimensions to continue"}</div>
      <GBtn disabled={scored<6} onClick={()=>setView("results")}>Generate Results →</GBtn>
    </div>
  </div>;
}

// ─── TOOL 2 — INITIATIVE PRIORITISATION ══════════════════════════════════════
const PCRITERIA=[
  {id:"strategic",label:"Strategic Alignment",desc:"How directly does this advance our stated strategy?",weight:0.3},
  {id:"impact",label:"Business Impact",desc:"What is the scale of value if this succeeds?",weight:0.25},
  {id:"feasibility",label:"Feasibility",desc:"How achievable is this given current capability and capacity?",weight:0.2},
  {id:"urgency",label:"Urgency",desc:"What is the cost of delay?",weight:0.15},
  {id:"readiness",label:"Organisation Readiness",desc:"Are people, process and technology ready to support this?",weight:0.1},
];

function Tool2Prioritisation({diagnosticScores,onComplete}){
  const[initiatives,setInitiatives]=useState([{id:1,name:"",owner:"",scores:{}}]);
  const[view,setView]=useState("score");

  function addInit(){setInitiatives(p=>[...p,{id:Date.now(),name:"",owner:"",scores:{}}]);}
  function removeInit(id){setInitiatives(p=>p.filter(i=>i.id!==id));}
  function updateInit(id,field,val){setInitiatives(p=>p.map(i=>i.id===id?{...i,[field]:val}:i));}
  function updateScore(id,crit,val){setInitiatives(p=>p.map(i=>i.id===id?{...i,scores:{...i.scores,[crit]:val}}:i));}

  function getWeighted(init){return PCRITERIA.reduce((sum,c)=>sum+(init.scores[c.id]||0)*c.weight,0);}
  const sorted=[...initiatives].filter(i=>i.name).sort((a,b)=>getWeighted(b)-getWeighted(a)).map(i=>({...i,weightedScore:getWeighted(i)}));
  const getTier=s=>s>=3.8?"Do Now":s>=2.8?"Plan":s>=2.0?"Defer":"Stop";
  const tierColor=t=>t==="Do Now"?G_MID:t==="Plan"?AMBER:t==="Defer"?T4:RED;

  if(view==="results"){return <div style={{animation:"fadeIn 0.3s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
      {["Do Now","Plan","Defer","Stop"].map(tier=>{
        const items=sorted.filter(i=>getTier(i.weightedScore)===tier);
        return <div key={tier} style={{background:S2,border:`1px solid ${BDR}`,padding:16}}>
          <div style={{...mono,fontSize:9,color:tierColor(tier),letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{tier}</div>
          <div style={{...serif,fontSize:28,fontWeight:700,color:tierColor(tier),marginBottom:4}}>{items.length}</div>
          {items.map(i=><div key={i.id} style={{fontSize:11,color:T3,borderTop:`1px solid ${BDR}`,paddingTop:6,marginTop:6}}>{i.name}</div>)}
        </div>;
      })}
    </div>
    <Card style={{padding:24,marginBottom:12}}>
      <SL>Priority Ranking</SL>
      <DataTable headers={["#","Initiative","Owner","Score","Tier","Action"]}
        rows={sorted.map((init,idx)=>[
          String(idx+1),init.name,init.owner||"—",
          <span style={{...mono,fontSize:10,color:tierColor(getTier(init.weightedScore))}}>{init.weightedScore.toFixed(2)}</span>,
          <Pill color={tierColor(getTier(init.weightedScore))}>{getTier(init.weightedScore)}</Pill>,
          "—"
        ])}/>
    </Card>
    <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
      <OBtn onClick={()=>setView("score")}>← Revise</OBtn>
      <div style={{display:"flex",gap:10}}>
        <OBtn onClick={()=>exportPrioritisation({initiatives:sorted})}>↓ Download</OBtn>
        {onComplete&&<GBtn onClick={()=>onComplete(sorted)}>Move to Decision Stack →</GBtn>}
      </div>
    </div>
  </div>;}

  return <div>
    <InfoBox>Score each initiative across five weighted criteria. Scores are 1–5. The system calculates a weighted priority score and recommends a tier: Do Now, Plan, Defer, or Stop.</InfoBox>
    {initiatives.map((init,idx)=><div key={init.id} style={{background:S2,border:`1px solid ${BDR}`,marginBottom:8,padding:20}}>
      <div style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}>
        <span style={{...mono,fontSize:9,color:GOLD,marginTop:12}}>{String(idx+1).padStart(2,"0")}</span>
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Initiative Name *</label>
            <input value={init.name} onChange={e=>updateInit(init.id,"name",e.target.value)} placeholder="e.g. Customer portal rebuild"/></div>
          <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Owner</label>
            <input value={init.owner} onChange={e=>updateInit(init.id,"owner",e.target.value)} placeholder="e.g. Head of Digital"/></div>
        </div>
        {initiatives.length>1&&<button onClick={()=>removeInit(init.id)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:16,marginTop:8,flexShrink:0}}>×</button>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
        {PCRITERIA.map(c=><div key={c.id} style={{background:S3,padding:"10px 10px 6px"}}>
          <div style={{...mono,fontSize:8,color:GOLD,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:2}}>{c.label}</div>
          <div style={{fontSize:10,color:T4,marginBottom:6,lineHeight:1.4}}>{c.desc}</div>
          <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(v=><button key={v} onClick={()=>updateScore(init.id,c.id,v)} style={{flex:1,padding:"4px 0",...mono,fontSize:10,cursor:"pointer",border:"none",background:init.scores[c.id]===v?GOLD:S2,color:init.scores[c.id]===v?G:T4,transition:"all 0.1s"}}>{v}</button>)}</div>
          <div style={{...mono,fontSize:8,color:T4,marginTop:3,textAlign:"right"}}>{Math.round(c.weight*100)}% weight</div>
        </div>)}
      </div>
      {init.name&&<div style={{marginTop:10,...mono,fontSize:10,color:getWeighted(init)>=3.8?G_MID:getWeighted(init)>=2.8?AMBER:RED}}>Weighted score: {getWeighted(init).toFixed(2)} → {getTier(getWeighted(init))}</div>}
    </div>)}
    <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:8}}>
      <OBtn onClick={addInit}>+ Add Initiative</OBtn>
      <GBtn disabled={!initiatives.some(i=>i.name)} onClick={()=>setView("results")}>View Priority Rankings →</GBtn>
    </div>
  </div>;
}

// ─── TOOL 3 — DECISION STACK ══════════════════════════════════════════════════
const DDIMS=[
  {id:"strategic",label:"Strategic Alignment",weight:0.3,desc:"How directly does this advance our strategy?"},
  {id:"impact",label:"Business Impact",weight:0.25,desc:"Scale of value if it succeeds?"},
  {id:"capability",label:"Org Capability",weight:0.2,desc:"Do we have the skills and capacity?"},
  {id:"risk",label:"Risk Level",weight:0.15,desc:"What could go wrong? How severe?"},
  {id:"timing",label:"Timing",weight:0.1,desc:"Is now the right moment?"},
];
const COMMIT_LEVELS=[
  {id:"full",label:"Full Commit",color:G_MID,desc:"Fully resourced. Accountable owner. Clear KPIs. Governance in place."},
  {id:"pilot",label:"Test / Pilot",color:AMBER,desc:"Time-boxed experiment. Limited resources. Defined success criteria."},
  {id:"defer",label:"Defer",color:T4,desc:"Not now. Revisit next planning cycle. Reason documented."},
  {id:"stop",label:"Do Not Do",color:RED,desc:"Explicitly declining. Resources freed for other priorities."},
];

function Tool3DecisionStack({initiatives:passedInitiatives}){
  const[step,setStep]=useState("setup");
  const[title,setTitle]=useState("");
  const[names,setNames]=useState(["","",""]);
  const[scores,setScores]=useState({a:{},b:{},c:{}});
  const[commits,setCommits]=useState({a:"",b:"",c:""});
  const[resources,setResources]=useState({a:"",b:"",c:""});
  const[activeTab,setActiveTab]=useState("a");

  const opts=["a","b","c"];
  function ws(opt){return DDIMS.reduce((sum,d)=>sum+(scores[opt][d.id]||0)*d.weight,0);}
  const winner=opts.reduce((best,opt)=>ws(opt)>ws(best)?opt:best,"a");

  // Half-commitment risk check
  function commitRisk(opt){
    const commit=commits[opt];const res=resources[opt];
    if(commit==="full"&&(!res||res==="none"))return "⚠ Half-commitment risk: Full Commit requires confirmed resources.";
    if(commit==="full"&&ws(opt)<2.5)return "⚠ Low scores suggest this may not be ready for Full Commit.";
    return null;
  }

  if(step==="setup")return <div>
    <InfoBox>The Decision Stack creates structured clarity across options — preventing the most common execution failure: committing in words but not in resources, ownership or accountability.</InfoBox>
    {passedInitiatives&&passedInitiatives.length>0&&<div style={{marginBottom:16}}>
      <SL>Committed Initiatives from Prioritisation</SL>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
        {passedInitiatives.filter(i=>i.weightedScore>=2.8).map(i=><button key={i.id} onClick={()=>setTitle(i.name)} style={{...mono,fontSize:10,padding:"4px 10px",background:title===i.name?GOLD:"transparent",color:title===i.name?G:T3,border:`1px solid ${title===i.name?GOLD:BDR}`,cursor:"pointer"}}>{i.name}</button>)}
      </div>
    </div>}
    <div style={{marginBottom:14}}>
      <label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Decision to make *</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Which CRM platform should we implement?"/>
    </div>
    <div style={{marginBottom:14}}>
      <label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Name the options</label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {opts.map((opt,i)=><input key={opt} value={names[i]} onChange={e=>{const n=[...names];n[i]=e.target.value;setNames(n);}} placeholder={`Option ${opt.toUpperCase()}`}/>)}
      </div>
    </div>
    <GBtn disabled={!title} onClick={()=>setStep("score")}>Start Scoring →</GBtn>
  </div>;

  if(step==="score")return <div>
    <div style={{...serif,fontSize:13,color:T3,fontStyle:"italic",marginBottom:16}}>Decision: <strong style={{color:T1}}>{title}</strong></div>
    <TabBar tabs={opts.map((o,i)=>({id:o,label:names[i]||`Option ${o.toUpperCase()}`}))} active={activeTab} onChange={setActiveTab}/>
    {opts.map(opt=>opt===activeTab&&<div key={opt} style={{animation:"fadeIn 0.2s ease"}}>
      {DDIMS.map(dim=><div key={dim.id} style={{background:S2,border:`1px solid ${BDR}`,padding:16,marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
          <div>
            <span style={{...serif,fontSize:14,fontWeight:700,color:T1}}>{dim.label}</span>
            <span style={{fontSize:11,color:T4,marginLeft:8}}>{dim.desc}</span>
          </div>
          <span style={{...mono,fontSize:9,color:T4}}>{Math.round(dim.weight*100)}% weight</span>
        </div>
        <div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(v=><button key={v} onClick={()=>setScores(p=>({...p,[opt]:{...p[opt],[dim.id]:v}}))} style={{flex:1,padding:"8px 0",...mono,fontSize:12,cursor:"pointer",border:"none",background:scores[opt][dim.id]===v?GOLD:S3,color:scores[opt][dim.id]===v?G:T4,fontWeight:scores[opt][dim.id]===v?700:400,transition:"all 0.1s"}}>{v}</button>)}</div>
      </div>)}
      <div style={{background:S3,padding:16,marginTop:8}}>
        <SL>Commitment Level</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {COMMIT_LEVELS.map(cl=><button key={cl.id} onClick={()=>setCommits(p=>({...p,[opt]:cl.id}))} style={{padding:"10px 8px",border:`2px solid ${commits[opt]===cl.id?cl.color:BDR}`,background:commits[opt]===cl.id?cl.color+"18":S2,cursor:"pointer",textAlign:"center"}}>
            <div style={{...mono,fontSize:9,color:cl.color,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{cl.label}</div>
            <div style={{fontSize:10,color:T3,lineHeight:1.4}}>{cl.desc}</div>
          </button>)}
        </div>
        {commits[opt]==="full"&&<div style={{marginTop:8}}>
          <label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Resources confirmed?</label>
          <select value={resources[opt]} onChange={e=>setResources(p=>({...p,[opt]:e.target.value}))}>
            <option value="">Select...</option>
            <option value="confirmed">Yes — budget and people confirmed</option>
            <option value="partial">Partial — some resources committed</option>
            <option value="none">No — not yet resourced</option>
          </select>
        </div>}
        {commitRisk(opt)&&<div style={{marginTop:10,background:"rgba(185,64,64,0.08)",border:"1px solid rgba(185,64,64,0.25)",padding:"10px 14px",fontSize:12,color:RED}}>{commitRisk(opt)}</div>}
      </div>
    </div>)}
    <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:16}}>
      <OBtn onClick={()=>setStep("setup")}>← Back</OBtn>
      <GBtn onClick={()=>setStep("result")}>View Recommendation →</GBtn>
    </div>
  </div>;

  if(step==="result"){
    const winnerName=names[opts.indexOf(winner)]||`Option ${winner.toUpperCase()}`;
    const risk=commitRisk(winner);
    return <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{background:G,padding:24,marginBottom:12,color:CREAM}}>
        <div style={{...mono,fontSize:9,color:GOLD,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>Recommended</div>
        <div style={{...serif,fontSize:28,fontWeight:700,color:CREAM,marginBottom:4}}>{winnerName}</div>
        <div style={{fontSize:13,color:"rgba(247,244,239,0.7)"}}>Weighted score: {ws(winner).toFixed(2)} / 5.0</div>
        {commits[winner]&&<div style={{marginTop:8}}><Pill color={COMMIT_LEVELS.find(c=>c.id===commits[winner])?.color||GOLD}>{COMMIT_LEVELS.find(c=>c.id===commits[winner])?.label}</Pill></div>}
      </div>
      {risk&&<div style={{background:"rgba(185,64,64,0.08)",border:"1px solid rgba(185,64,64,0.25)",padding:"12px 16px",marginBottom:12,fontSize:12,color:RED}}>{risk}</div>}
      <DataTable headers={["Option","Score","Commitment","Resources"]}
        rows={opts.map((opt,i)=>[
          names[i]||`Option ${opt.toUpperCase()}`,
          <span style={{...mono,fontSize:11,color:opt===winner?GOLD:T3,fontWeight:opt===winner?700:400}}>{ws(opt).toFixed(2)}</span>,
          commits[opt]?<Pill color={COMMIT_LEVELS.find(c=>c.id===commits[opt])?.color||T4}>{COMMIT_LEVELS.find(c=>c.id===commits[opt])?.label||"—"}</Pill>:"—",
          resources[opt]||"—"
        ])}/>
      <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:16}}>
        <OBtn onClick={()=>setStep("score")}>← Revise</OBtn>
        <OBtn onClick={()=>exportDecisionStack({title,names,scores,ws:{a:ws("a"),b:ws("b"),c:ws("c")},winner,dims:DDIMS})}>↓ Download</OBtn>
      </div>
    </div>;
  }
  return null;
}

// ─── TOOL 4 — ROLE SUCCESS PROFILES ══════════════════════════════════════════
function Tool4RoleAnalyser({committedInitiatives}){
  const[form,setForm]=useState({role:"",org:"",func:"",reportsTo:"",level:"",reports:"",location:"",purpose:"",pillars:"",challenges:"",methodology:"",values:"",internal:"",external:"",initiatives:[]});
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(null);
  const[error,setError]=useState("");
  const[open,setOpen]=useState({});

  function upd(f,v){setForm(p=>({...p,[f]:v}));}
  function toggleInit(name){setForm(p=>({...p,initiatives:p.initiatives.includes(name)?p.initiatives.filter(x=>x!==name):[...p.initiatives,name]}));}

  async function analyse(){
    if(!form.role.trim()||!form.org.trim())return;
    setLoading(true);setError("");setResult(null);
    try{
      const initiativeContext=form.initiatives.length>0?" Linked Strategic Initiatives (this role owns or supports): "+form.initiatives.join(", "):"";
      const jsonStructure='{"roleContext":{"title":"string","function":"string","reportsTo":"string","location":"string"},"purposeAndStrategy":{"organisationPurpose":"string","roleContribution":"string"},"successInBusiness":"string","roleSuccessStatement":"string","accountabilityPillars":["pillar1","pillar2","pillar3","pillar4","pillar5"],"responsibilitiesByPillar":[{"pillar":"string","purpose":"string","responsibilities":["r1","r2","r3"]}],"keyCompetencies":[{"name":"string","description":"string"}],"whatSuccessLooksLike":[{"areaOfFocus":"string","purpose":"string","keyActivities":["a1","a2","a3"]}],"circleOfInfluence":{"internal":["s1","s2"],"external":["s1","s2"]},"valuesAndBehaviours":[{"value":"string","description":"string"}],"timeBasedMetrics":{"quarterly":["q1","q2","q3"],"sixMonth":["g1","g2","g3"],"annual":["a1","a2","a3"]},"decisionRights":{"owns":["d1","d2"],"influences":["d1","d2"],"escalates":["d1","d2"]}}';
      const prompt="You are an expert organisational design consultant. Generate a comprehensive Role Success Profile. Write in Australian English. Plain language. No jargon. Output ONLY valid JSON."+
        " Role: "+form.role+" Organisation: "+form.org+" Function: "+(form.func||"Not specified")+
        " Reports To: "+(form.reportsTo||"Not specified")+" Level: "+(form.level||"Not specified")+
        " Direct Reports: "+(form.reports||"Not specified")+" Location: "+(form.location||"Not specified")+
        " Purpose and Strategy: "+(form.purpose||"Not specified")+" Strategic Pillars: "+(form.pillars||"Not specified")+
        " Key Challenges: "+(form.challenges||"Not specified")+" Methodology: "+(form.methodology||"Not specified")+
        " Values: "+(form.values||"Not specified")+" Internal Stakeholders: "+(form.internal||"Not specified")+
        " External Stakeholders: "+(form.external||"Not specified")+initiativeContext+
        " Return this JSON structure: "+jsonStructure+
        " Rules: 5-8 accountability pillars. 6-10 competencies. 3-5 metrics per time period. Include explicit decision rights. Make responsibilities specific to this role and organisation.";
      const response=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:4000,system:"You are an expert organisational design consultant. Always respond with valid JSON only. No preamble, no markdown, no explanation. Start your response with { and end with }.",messages:[{role:"user",content:prompt}]})});
      const data=await response.json();
      const text=data.content?.[0]?.text||"";
      const jsonStart=text.indexOf("{");const jsonEnd=text.lastIndexOf("}");
      if(jsonStart===-1||jsonEnd===-1)throw new Error("No JSON in response: "+text.slice(0,200));
      const parsed=JSON.parse(text.slice(jsonStart,jsonEnd+1));
      setResult(parsed);setOpen({"1":true});
    }catch(e){setError("Generation failed: "+e.message);console.error(e);}
    setLoading(false);
  }

  const sections=result?[
    {id:"1",num:"01",title:"Role Context",content:<div>
      <div style={{background:G,padding:20,marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["Role Title",result.roleContext?.title||form.role],["Reports To",result.roleContext?.reportsTo||"—"],["Function",result.roleContext?.function||"—"],["Location",result.roleContext?.location||"—"]].map(([l,v])=><div key={l}><div style={{...mono,fontSize:9,color:GOLD,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontSize:13,color:CREAM}}>{v}</div></div>)}
        </div>
      </div>
      <div style={{marginBottom:10}}><div style={{...mono,fontSize:9,color:GOLD,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Organisation Purpose</div><div style={{fontSize:13,color:T2,lineHeight:1.7}}>{result.purposeAndStrategy?.organisationPurpose}</div></div>
      <div><div style={{...mono,fontSize:9,color:GOLD,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>Strategic Contribution</div><div style={{fontSize:13,color:T2,lineHeight:1.7}}>{result.purposeAndStrategy?.roleContribution}</div></div>
    </div>},
    {id:"2",num:"02",title:"Role Success Statement",content:<div>
      <div style={{background:"rgba(212,168,71,0.08)",border:"1px solid rgba(212,168,71,0.25)",borderLeft:`4px solid ${GOLD}`,padding:20,marginBottom:12}}><div style={{fontSize:14,color:T1,lineHeight:1.8}}>{result.roleSuccessStatement}</div></div>
      <div style={{background:S3,padding:16}}><div style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>Success in This Business</div><div style={{fontSize:12,color:T3,lineHeight:1.7,fontStyle:"italic"}}>{result.successInBusiness}</div></div>
    </div>},
    {id:"3",num:"03",title:"Core Accountability Pillars",content:<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
      {(result.accountabilityPillars||[]).map((p,i)=><div key={i} style={{background:G,padding:14,borderTop:`3px solid ${GOLD}`}}>
        <div style={{...mono,fontSize:9,color:GOLD,marginBottom:4}}>{String(i+1).padStart(2,"0")}</div>
        <div style={{...serif,fontSize:13,fontWeight:700,color:CREAM}}>{p}</div>
      </div>)}
    </div>},
    {id:"4",num:"04",title:"Responsibilities by Pillar",content:<div>{(result.responsibilitiesByPillar||[]).map((pillar,i)=><div key={i} style={{borderLeft:`3px solid ${GOLD}`,paddingLeft:16,marginBottom:16}}>
      <div style={{...serif,fontSize:14,fontWeight:700,color:T1,marginBottom:3}}>{pillar.pillar}</div>
      <div style={{fontSize:12,color:T4,fontStyle:"italic",lineHeight:1.5,marginBottom:8}}>{pillar.purpose}</div>
      {(pillar.responsibilities||[]).map((r,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:GOLD,flexShrink:0}}>—</span><span style={{fontSize:12,color:T3,lineHeight:1.5}}>{r}</span></div>)}
    </div>)}</div>},
    {id:"5",num:"05",title:"Key Competencies",content:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      {(result.keyCompetencies||[]).map((c,i)=><div key={i} style={{background:S2,border:`1px solid ${BDR}`,padding:"12px 14px",display:"flex",gap:10}}>
        <span style={{...mono,fontSize:11,color:GOLD,fontWeight:700,flexShrink:0,minWidth:22}}>{String(i+1).padStart(2,"0")}</span>
        <div><div style={{...serif,fontSize:13,fontWeight:700,color:T1,marginBottom:2}}>{c.name}</div><div style={{fontSize:12,color:T3,lineHeight:1.5}}>{c.description}</div></div>
      </div>)}
    </div>},
    {id:"6",num:"06",title:"What Success Looks Like",content:<div>
      {(result.whatSuccessLooksLike||[]).map((item,i)=><div key={i} style={{background:S2,border:`1px solid ${BDR}`,padding:"14px 18px",marginBottom:6}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:8}}>
          <div><div style={{...mono,fontSize:9,color:GOLD,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Area</div><div style={{...serif,fontSize:13,fontWeight:700,color:T1}}>{item.areaOfFocus}</div></div>
          <div><div style={{...mono,fontSize:9,color:GOLD,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Purpose</div><div style={{fontSize:12,color:T3,lineHeight:1.5}}>{item.purpose}</div></div>
        </div>
        {(item.keyActivities||[]).map((a,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:GOLD,flexShrink:0}}>—</span><span style={{fontSize:12,color:T3,lineHeight:1.5}}>{a}</span></div>)}
      </div>)}
    </div>},
    {id:"7",num:"07",title:"Decision Rights",content:<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
      {[["Owns Decisions",result.decisionRights?.owns||[],GOLD],["Influences",result.decisionRights?.influences||[],G_MID],["Escalates",result.decisionRights?.escalates||[],AMBER]].map(([label,items,col])=><div key={label} style={{background:S2,border:`1px solid ${BDR}`,borderTop:`3px solid ${col}`,padding:14}}>
        <div style={{...mono,fontSize:9,color:col,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{label}</div>
        {items.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:col,flexShrink:0,fontSize:10}}>—</span><span style={{fontSize:12,color:T3,lineHeight:1.5}}>{item}</span></div>)}
      </div>)}
    </div>},
    {id:"8",num:"08",title:"Circle of Influence",content:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[["Key Internal",result.circleOfInfluence?.internal||[],GOLD],["Key External",result.circleOfInfluence?.external||[],G_MID]].map(([label,items,col])=><div key={label} style={{background:S2,border:`1px solid ${BDR}`,borderTop:`3px solid ${col}`,padding:14}}>
        <div style={{...mono,fontSize:9,color:col,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{label}</div>
        {items.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:col,flexShrink:0}}>—</span><span style={{fontSize:12,color:T3,lineHeight:1.5}}>{item}</span></div>)}
      </div>)}
    </div>},
    {id:"9",num:"09",title:"Values & Behaviour Alignment",content:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
      {(result.valuesAndBehaviours||[]).map((v,i)=><div key={i} style={{background:S2,border:`1px solid ${BDR}`,padding:"12px 14px"}}>
        <div style={{...serif,fontSize:13,fontWeight:700,color:T1,marginBottom:3}}>{v.value}</div>
        <div style={{fontSize:12,color:T3,lineHeight:1.5}}>{v.description}</div>
      </div>)}
    </div>},
    {id:"10",num:"10",title:"Time-Based Success Metrics",content:<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
      {[["Quarterly Priorities",result.timeBasedMetrics?.quarterly||[],GOLD],["6-Month Goals",result.timeBasedMetrics?.sixMonth||[],G_MID],["Annual Measures",result.timeBasedMetrics?.annual||[],G]].map(([label,items,col])=><div key={label} style={{background:S2,border:`1px solid ${BDR}`,borderTop:`3px solid ${col}`,padding:14}}>
        <div style={{...mono,fontSize:9,color:col,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>{label}</div>
        {items.map((item,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{...mono,fontSize:10,color:col,fontWeight:700,flexShrink:0}}>{i+1}</span><span style={{fontSize:12,color:T3,lineHeight:1.5}}>{item}</span></div>)}
      </div>)}
    </div>},
  ]:[];

  return <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:0,minHeight:600}}>
    <div style={{borderRight:`1px solid ${BDR}`,padding:"20px 18px",background:S2}}>
      <SL>Role Details</SL>
      {[["role","Role Title *","e.g. Chief Operations Officer"],["org","Organisation *","e.g. Acme Corp"],["func","Function","e.g. Senior Leadership Team"],["reportsTo","Reports To","e.g. CEO"],["level","Level","e.g. Executive"],["reports","Direct Reports","e.g. 4 direct, 12 total"],["location","Location","e.g. Head Office, Sydney"]].map(([f,l,ph])=><div key={f} style={{marginBottom:10}}>
        <label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:3}}>{l}</label>
        <input value={form[f]} onChange={e=>upd(f,e.target.value)} placeholder={ph}/>
      </div>)}
      <div style={{height:1,background:BDR,margin:"14px 0"}}/>
      <SL>Organisational Context</SL>
      {[["purpose","Purpose & Strategy","What is the org trying to achieve?"],["pillars","Strategic Pillars","e.g. Customer experience, growth"],["challenges","Key Challenges","Biggest problems this role must solve"],["methodology","Operating Methodology","e.g. Scaling Up, Lean, OKRs"],["values","Company Values","e.g. Quality, Simplicity, Customer First"],["internal","Internal Stakeholders","e.g. CEO, SLT, Finance team"],["external","External Stakeholders","e.g. Key customers, suppliers"]].map(([f,l,ph])=><div key={f} style={{marginBottom:10}}>
        <label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:3}}>{l}</label>
        <textarea rows={2} value={form[f]} onChange={e=>upd(f,e.target.value)} placeholder={ph}/>
      </div>)}
      {committedInitiatives&&committedInitiatives.length>0&&<div>
        <div style={{height:1,background:BDR,margin:"14px 0"}}/>
        <SL>Linked Initiatives</SL>
        {committedInitiatives.filter(i=>i.weightedScore>=2.8).map(i=><button key={i.id} onClick={()=>toggleInit(i.name)} style={{display:"block",width:"100%",textAlign:"left",...mono,fontSize:10,padding:"5px 8px",marginBottom:4,background:form.initiatives.includes(i.name)?GOLD+"20":S3,border:`1px solid ${form.initiatives.includes(i.name)?GOLD:BDR}`,cursor:"pointer",color:form.initiatives.includes(i.name)?T1:T3}}>
          {form.initiatives.includes(i.name)?"✓ ":""}{i.name}
        </button>)}
      </div>}
      <div style={{height:1,background:BDR,margin:"14px 0"}}/>
      <GBtn onClick={analyse} disabled={loading||!form.role.trim()||!form.org.trim()} style={{width:"100%"}}>
        {loading?"Generating...":"Generate Profile →"}
      </GBtn>
      {loading&&<div style={{textAlign:"center",marginTop:12,...mono,fontSize:9,color:T4,letterSpacing:"0.08em"}}>This takes 15–20 seconds</div>}
      {result&&<button onClick={()=>setResult(null)} style={{width:"100%",background:"transparent",border:`1px solid ${BDR}`,color:T4,...mono,fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",padding:"8px",cursor:"pointer",marginTop:8}}>Start Over</button>}
      {error&&<div style={{background:"rgba(185,64,64,0.08)",border:"1px solid rgba(185,64,64,0.25)",padding:"10px 12px",marginTop:10,fontSize:12,color:RED}}>{error}</div>}
    </div>
    <div style={{padding:"20px 24px"}}>
      {loading&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400}}>
        <div style={{width:32,height:32,border:`3px solid ${GOLD}`,borderTop:"3px solid transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:16}}/>
        <div style={{...serif,fontSize:18,color:T3,marginBottom:4}}>Generating your Role Success Profile</div>
        <div style={{fontSize:12,color:T4}}>Tailoring to {form.role} at {form.org}...</div>
      </div>}
      {!loading&&!result&&!error&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,textAlign:"center"}}>
        <div style={{width:60,height:60,background:"rgba(44,74,62,0.08)",borderRadius:"50%",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:24,color:GOLD}}>◑</span></div>
        <div style={{...serif,fontSize:18,color:T3,marginBottom:6}}>Enter role details to begin</div>
        <div style={{fontSize:12,color:T4,lineHeight:1.6,maxWidth:280}}>Fill in the role title and organisation, add context, and generate a full Role Success Profile.</div>
      </div>}
      {result&&<div style={{animation:"fadeIn 0.3s ease"}}>
        <div style={{marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${BDR}`}}>
          <div style={{...serif,fontSize:24,fontWeight:700,color:T1,marginBottom:4}}>{form.role}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[form.org,form.level,form.reports].filter(Boolean).map((m,i)=><Pill key={i} color={T4}>{m}</Pill>)}
            {form.initiatives.map((ini,i)=><Pill key={"ini"+i} color={GOLD}>{ini}</Pill>)}
          </div>
        </div>
        {sections.map(sec=><div key={sec.id} style={{marginBottom:2,background:S2,border:`1px solid ${BDR}`}}>
          <div onClick={()=>setOpen(p=>({...p,[sec.id]:!p[sec.id]}))} style={{padding:"13px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,userSelect:"none"}}>
            <span style={{...mono,fontSize:10,color:GOLD}}>{sec.num}</span>
            <span style={{...serif,fontSize:14,fontWeight:700,color:T1}}>{sec.title}</span>
            <span style={{marginLeft:"auto",color:T4,fontSize:10,transform:open[sec.id]?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
          </div>
          {open[sec.id]&&<div style={{padding:"0 18px 18px",animation:"fadeIn 0.2s ease"}}>{sec.content}</div>}
        </div>)}
        <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}>
          <GBtn onClick={()=>exportRoleAnalyser({form,result})}>↓ Download Word Report</GBtn>
        </div>
      </div>}
    </div>
  </div>;
}

// ─── TOOL 5 — KPI & PERFORMANCE ══════════════════════════════════════════════
const KPI_PILLARS=[
  {id:"financial",label:"Financial Performance"},
  {id:"customer",label:"Customer & Market"},
  {id:"operational",label:"Operational Excellence"},
  {id:"people",label:"People & Capability"},
  {id:"strategic",label:"Strategic Delivery"},
];
const KPI_TEMPLATES={
  financial:[
    {name:"Revenue Growth",formula:"(Current Revenue - Prior Period Revenue) / Prior Period Revenue × 100",frequency:"Monthly",target:"≥ 15% YoY",lead:false},
    {name:"Gross Margin",formula:"(Revenue - COGS) / Revenue × 100",frequency:"Monthly",target:"≥ 55%",lead:false},
    {name:"Operating Cost Ratio",formula:"Operating Costs / Revenue × 100",frequency:"Monthly",target:"< 40%",lead:true},
    {name:"Cash Conversion Cycle",formula:"DIO + DSO - DPO (days)",frequency:"Monthly",target:"< 45 days",lead:true},
  ],
  customer:[
    {name:"Net Promoter Score",formula:"% Promoters - % Detractors",frequency:"Quarterly",target:"≥ 50",lead:false},
    {name:"Customer Retention Rate",formula:"(Customers End - New) / Customers Start × 100",frequency:"Monthly",target:"≥ 90%",lead:false},
    {name:"Lead Conversion Rate",formula:"Converted Leads / Total Leads × 100",frequency:"Weekly",target:"≥ 25%",lead:true},
    {name:"Customer Satisfaction (CSAT)",formula:"Satisfied Customers / Total Responses × 100",frequency:"Monthly",target:"≥ 85%",lead:true},
  ],
  operational:[
    {name:"DIFOT",formula:"On-time & in-full deliveries / Total deliveries × 100",frequency:"Weekly",target:"≥ 95%",lead:true},
    {name:"Process Cycle Time",formula:"Average time from start to completion (hours/days)",frequency:"Weekly",target:"< 3 days",lead:true},
    {name:"Error / Rework Rate",formula:"Defective outputs / Total outputs × 100",frequency:"Weekly",target:"< 2%",lead:true},
    {name:"Capacity Utilisation",formula:"Actual output / Maximum output × 100",frequency:"Monthly",target:"70–85%",lead:true},
  ],
  people:[
    {name:"Employee Engagement Score",formula:"Engaged employees / Total employees × 100",frequency:"Quarterly",target:"≥ 75%",lead:true},
    {name:"Retention Rate",formula:"(Employees End - New) / Employees Start × 100",frequency:"Quarterly",target:"≥ 85%",lead:false},
    {name:"Time to Fill Critical Roles",formula:"Average days from role open to accepted offer",frequency:"Monthly",target:"< 45 days",lead:true},
    {name:"Learning Hours per Employee",formula:"Total training hours / Total employees",frequency:"Monthly",target:"≥ 20 hrs/quarter",lead:true},
  ],
  strategic:[
    {name:"Strategic Initiative Completion",formula:"Completed milestones / Planned milestones × 100",frequency:"Monthly",target:"≥ 85%",lead:true},
    {name:"Portfolio Health Score",formula:"Green programmes / Total active × 100",frequency:"Monthly",target:"≥ 80% green",lead:true},
    {name:"Benefits Realisation Rate",formula:"Realised benefits / Planned benefits × 100",frequency:"Quarterly",target:"≥ 90% at 12 months",lead:false},
    {name:"Decision Velocity",formula:"Average days: issue raised to decision made",frequency:"Monthly",target:"< 5 business days",lead:true},
  ],
};

function Tool5KPIBuilder(){
  const[selectedKPIs,setSelectedKPIs]=useState({});
  const[customKPIs,setCustomKPIs]=useState([]);
  const[view,setView]=useState("build");
  const[pillar,setPillar]=useState("financial");

  function toggleKPI(pId,kIdx){
    const key=pId+"-"+kIdx;
    setSelectedKPIs(p=>({...p,[key]:!p[key]}));
  }
  function addCustom(){setCustomKPIs(p=>[...p,{name:"",formula:"",frequency:"Monthly",target:"",lead:true,pillar}]);}
  function updateCustom(idx,field,val){setCustomKPIs(p=>p.map((k,i)=>i===idx?{...k,[field]:val}:k));}
  function removeCustom(idx){setCustomKPIs(p=>p.filter((_,i)=>i!==idx));}

  const allSel=[
    ...KPI_PILLARS.flatMap(p=>(KPI_TEMPLATES[p.id]||[]).filter((_,i)=>selectedKPIs[p.id+"-"+i]).map(k=>({...k,pillar:p.id}))),
    ...customKPIs.filter(k=>k.name),
  ];

  if(view==="scorecard")return <div style={{animation:"fadeIn 0.3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{...serif,fontSize:20,fontWeight:700,color:T1}}>Performance Scorecard</div><div style={{fontSize:12,color:T4}}>{allSel.length} KPIs across {KPI_PILLARS.filter(p=>allSel.some(k=>k.pillar===p.id)).length} pillars</div></div>
      <div style={{display:"flex",gap:8}}>
        <OBtn onClick={()=>setView("build")}>← Edit</OBtn>
        <OBtn onClick={()=>exportKPIs({kpis:allSel,pillars:KPI_PILLARS})}>↓ Download</OBtn>
      </div>
    </div>
    {allSel.length===0&&<div style={{textAlign:"center",padding:48,color:T4,fontStyle:"italic"}}>No KPIs selected. Go back and select your metrics.</div>}
    {KPI_PILLARS.filter(p=>allSel.some(k=>k.pillar===p.id)).map(p=><div key={p.id} style={{marginBottom:16}}>
      <div style={{...mono,fontSize:10,color:GOLD,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${GOLD}`}}>{p.label}</div>
      <DataTable headers={["KPI","Target","Frequency","Type","Formula"]} rows={allSel.filter(k=>k.pillar===p.id).map(k=>[k.name,k.target,k.frequency,<Pill color={k.lead?G_MID:AMBER}>{k.lead?"Lead":"Lag"}</Pill>,<span style={{fontSize:11,color:T4}}>{k.formula}</span>])}/>
    </div>)}
    {allSel.length>0&&<div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><GBtn onClick={()=>exportKPIs({kpis:allSel,pillars:KPI_PILLARS})}>↓ Download Scorecard</GBtn></div>}
  </div>;

  return <div>
    <InfoBox>Select KPIs from the library or create custom metrics. Lead indicators predict future performance. Lag indicators confirm past results. Balance both for a complete picture.</InfoBox>
    <TabBar tabs={KPI_PILLARS.map(p=>({id:p.id,label:p.label}))} active={pillar} onChange={setPillar}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
      {(KPI_TEMPLATES[pillar]||[]).map((kpi,i)=>{
        const key=pillar+"-"+i;const sel=selectedKPIs[key];
        return <div key={i} onClick={()=>toggleKPI(pillar,i)} style={{background:sel?G+"12":S2,border:`1.5px solid ${sel?G:BDR}`,padding:"14px 16px",cursor:"pointer",transition:"all 0.15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{...serif,fontSize:13,fontWeight:700,color:sel?T1:T2}}>{kpi.name}</div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,marginLeft:8}}>
              <Pill color={kpi.lead?G_MID:AMBER}>{kpi.lead?"Lead":"Lag"}</Pill>
              {sel&&<span style={{color:GOLD,fontWeight:700}}>✓</span>}
            </div>
          </div>
          <div style={{fontSize:11,color:T4,marginBottom:4}}>Target: <strong style={{color:T3}}>{kpi.target}</strong> · {kpi.frequency}</div>
          <div style={{fontSize:10,color:T4,lineHeight:1.4,fontStyle:"italic"}}>{kpi.formula}</div>
        </div>;
      })}
    </div>
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{...mono,fontSize:10,color:T4,letterSpacing:"0.08em",textTransform:"uppercase"}}>Custom KPIs</span>
        <OBtn onClick={addCustom}>+ Add Custom</OBtn>
      </div>
      {customKPIs.map((kpi,idx)=><div key={idx} style={{background:S2,border:`1px solid ${BDR}`,padding:14,marginBottom:6}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 120px 120px",gap:8,marginBottom:6}}>
          <input value={kpi.name} onChange={e=>updateCustom(idx,"name",e.target.value)} placeholder="KPI Name"/>
          <input value={kpi.target} onChange={e=>updateCustom(idx,"target",e.target.value)} placeholder="Target"/>
          <select value={kpi.frequency} onChange={e=>updateCustom(idx,"frequency",e.target.value)}>
            {["Daily","Weekly","Monthly","Quarterly","Annually"].map(f=><option key={f}>{f}</option>)}
          </select>
          <select value={kpi.lead?"lead":"lag"} onChange={e=>updateCustom(idx,"lead",e.target.value==="lead")}>
            <option value="lead">Lead</option><option value="lag">Lag</option>
          </select>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={kpi.formula} onChange={e=>updateCustom(idx,"formula",e.target.value)} placeholder="Formula / how measured"/>
          <button onClick={()=>removeCustom(idx)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:16,flexShrink:0}}>×</button>
        </div>
      </div>)}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:12,color:T4}}>{allSel.length} KPI{allSel.length!==1?"s":""} selected</span>
      <GBtn disabled={allSel.length===0} onClick={()=>setView("scorecard")}>View Scorecard →</GBtn>
    </div>
  </div>;
}

// ─── TOOL 6 — OPERATING RHYTHM ════════════════════════════════════════════════
const RHYTHM_TYPES=[
  {id:"daily",label:"Daily Huddle",cadence:"Daily",duration:"15 min",purpose:"Surface blockers, align on day priorities",layer:"Team"},
  {id:"weekly",label:"Weekly Team Meeting",cadence:"Weekly",duration:"60 min",purpose:"Review progress, problem solve, align on week",layer:"Team"},
  {id:"1on1",label:"One-to-One",cadence:"Weekly / Fortnightly",duration:"30–45 min",purpose:"Individual performance, coaching, feedback",layer:"Individual"},
  {id:"monthly",label:"Monthly Business Review",cadence:"Monthly",duration:"90–120 min",purpose:"Performance vs target, financial review, risk",layer:"Leadership"},
  {id:"qbr",label:"Quarterly Business Review",cadence:"Quarterly",duration:"Half day",purpose:"Strategy review, portfolio health, priorities",layer:"Leadership"},
  {id:"steering",label:"Steering Committee",cadence:"Monthly",duration:"90 min",purpose:"Governance, decisions, escalations",layer:"Governance"},
  {id:"programme",label:"Programme Board",cadence:"Monthly",duration:"2 hours",purpose:"Portfolio status, resourcing, risk register",layer:"Governance"},
  {id:"retrospective",label:"Retrospective",cadence:"Fortnightly",duration:"60 min",purpose:"Improve ways of working, remove blockers",layer:"Team"},
  {id:"planning",label:"Sprint / Cycle Planning",cadence:"Fortnightly",duration:"2 hours",purpose:"Plan next cycle, assign work, set targets",layer:"Team"},
  {id:"comms",label:"All-Hands / Town Hall",cadence:"Quarterly",duration:"60 min",purpose:"Strategy update, wins, culture",layer:"Organisation"},
];

function Tool6OperatingRhythm(){
  const[orgName,setOrgName]=useState("");
  const[selected,setSelected]=useState({});
  const[customMtgs,setCustomMtgs]=useState([]);
  const[view,setView]=useState("build");
  const[detail,setDetail]=useState({});

  function toggleMtg(id){setSelected(p=>({...p,[id]:!p[id]}));}
  function updateDetail(id,field,val){setDetail(p=>({...p,[id]:{...p[id],[field]:val}}));}
  function addCustom(){setCustomMtgs(p=>[...p,{id:"custom-"+Date.now(),label:"",cadence:"",duration:"",purpose:"",owner:"",layer:"Team"}]);}

  const allMtgs=[
    ...RHYTHM_TYPES.filter(m=>selected[m.id]).map(m=>({...m,...detail[m.id],owner:detail[m.id]?.owner||""})),
    ...customMtgs.filter(m=>m.label),
  ];

  const layers=["Individual","Team","Leadership","Governance","Organisation"];

  if(view==="register")return <div style={{animation:"fadeIn 0.3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{...serif,fontSize:20,fontWeight:700,color:T1}}>Operating Rhythm Register</div>{orgName&&<div style={{fontSize:12,color:T4}}>{orgName}</div>}</div>
      <div style={{display:"flex",gap:8}}>
        <OBtn onClick={()=>setView("build")}>← Edit</OBtn>
        <OBtn onClick={()=>exportRhythm({orgName,meetings:allMtgs})}>↓ Download</OBtn>
      </div>
    </div>
    {layers.filter(l=>allMtgs.some(m=>m.layer===l)).map(l=><div key={l} style={{marginBottom:16}}>
      <div style={{...mono,fontSize:10,color:GOLD,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${GOLD}`}}>{l}</div>
      <DataTable headers={["Meeting","Cadence","Duration","Purpose","Owner"]} rows={allMtgs.filter(m=>m.layer===l).map(m=>[m.label,m.cadence,m.duration,m.purpose||"—",m.owner||"—"])}/>
    </div>)}
    {allMtgs.length===0&&<div style={{textAlign:"center",padding:48,color:T4,fontStyle:"italic"}}>No meetings selected.</div>}
    {allMtgs.length>0&&<div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><GBtn onClick={()=>exportRhythm({orgName,meetings:allMtgs})}>↓ Download Register</GBtn></div>}
  </div>;

  return <div>
    <InfoBox>An effective operating rhythm connects strategy to day-to-day delivery. Select the meetings that match your context, assign owners, and download a structured register.</InfoBox>
    <div style={{marginBottom:16}}>
      <label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Organisation / Programme Name</label>
      <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="e.g. Heka Hoods · FY25 Transformation Programme"/>
    </div>
    {layers.map(l=><div key={l} style={{marginBottom:20}}>
      <div style={{...mono,fontSize:10,color:T4,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${BDR}`}}>{l} Layer</div>
      {RHYTHM_TYPES.filter(m=>m.layer===l).map(m=><div key={m.id} style={{background:selected[m.id]?S2:S1,border:`1.5px solid ${selected[m.id]?G:BDR}`,marginBottom:4,overflow:"hidden"}}>
        <div onClick={()=>toggleMtg(m.id)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
            <span style={{width:16,height:16,border:`1.5px solid ${selected[m.id]?GOLD:BDR}`,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:selected[m.id]?GOLD:"transparent"}}>{selected[m.id]&&<span style={{color:G,fontSize:10,fontWeight:700}}>✓</span>}</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T1}}>{m.label}</div>
              <div style={{fontSize:11,color:T4}}>{m.cadence} · {m.duration}</div>
            </div>
          </div>
          <div style={{fontSize:11,color:T3,maxWidth:280,textAlign:"right"}}>{m.purpose}</div>
        </div>
        {selected[m.id]&&<div style={{padding:"0 16px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:3}}>Owner</label>
            <input value={detail[m.id]?.owner||""} onChange={e=>updateDetail(m.id,"owner",e.target.value)} placeholder="e.g. Head of Operations"/></div>
          <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:3}}>Notes / Agenda focus</label>
            <input value={detail[m.id]?.notes||""} onChange={e=>updateDetail(m.id,"notes",e.target.value)} placeholder="e.g. KPI review, risk register"/></div>
        </div>}
      </div>)}
    </div>)}
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{...mono,fontSize:10,color:T4,letterSpacing:"0.08em",textTransform:"uppercase"}}>Custom Meetings</span>
        <OBtn onClick={addCustom}>+ Add</OBtn>
      </div>
      {customMtgs.map((mtg,idx)=><div key={mtg.id} style={{background:S2,border:`1px solid ${BDR}`,padding:12,marginBottom:6}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:6}}>
          <input value={mtg.label} onChange={e=>{const u=[...customMtgs];u[idx].label=e.target.value;setCustomMtgs(u);}} placeholder="Meeting name"/>
          <input value={mtg.cadence} onChange={e=>{const u=[...customMtgs];u[idx].cadence=e.target.value;setCustomMtgs(u);}} placeholder="Cadence"/>
          <input value={mtg.duration} onChange={e=>{const u=[...customMtgs];u[idx].duration=e.target.value;setCustomMtgs(u);}} placeholder="Duration"/>
          <input value={mtg.owner} onChange={e=>{const u=[...customMtgs];u[idx].owner=e.target.value;setCustomMtgs(u);}} placeholder="Owner"/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={mtg.purpose} onChange={e=>{const u=[...customMtgs];u[idx].purpose=e.target.value;setCustomMtgs(u);}} placeholder="Purpose"/>
          <button onClick={()=>setCustomMtgs(p=>p.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:16,flexShrink:0}}>×</button>
        </div>
      </div>)}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:12,color:T4}}>{allMtgs.length} meeting{allMtgs.length!==1?"s":""} in rhythm</span>
      <GBtn disabled={allMtgs.length===0} onClick={()=>setView("register")}>View Register →</GBtn>
    </div>
  </div>;
}

// ─── TOOL 7 — CAPABILITY & GAP MAPPER ════════════════════════════════════════
const CAP_DOMAINS=[
  {id:"strategy",label:"Strategic Thinking",sub:"Ability to see and shape long-term direction"},
  {id:"leadership",label:"Leadership & Culture",sub:"Leading people through complexity and change"},
  {id:"delivery",label:"Delivery & Execution",sub:"Getting work done reliably and at pace"},
  {id:"data",label:"Data & Analytics",sub:"Using data to inform decisions and measure outcomes"},
  {id:"digital",label:"Digital & Technology",sub:"Leveraging technology to enable strategy"},
  {id:"finance",label:"Financial Acumen",sub:"Understanding and managing financial performance"},
  {id:"commercial",label:"Commercial Capability",sub:"Identifying and capturing market opportunity"},
  {id:"people",label:"People & Talent",sub:"Attracting, developing and retaining capability"},
  {id:"change",label:"Change Management",sub:"Managing the human side of transformation"},
  {id:"governance",label:"Governance & Risk",sub:"Making decisions with clarity and accountability"},
  {id:"customer",label:"Customer Experience",sub:"Designing and delivering exceptional customer outcomes"},
  {id:"operations",label:"Operational Excellence",sub:"Designing efficient, scalable processes"},
];
const CAP_LABELS=["","Critical Gap","Significant Gap","Partial","Capable","Strong"];
const CAP_ACTIONS={1:["Immediate external hire or partnership required","Assess whether this capability is core or can be outsourced","Define a 90-day plan to close the gap"],2:["Structured development programme or coaching","Consider interim resourcing while building","Set measurable capability targets with 6-month checkpoint"],3:["Targeted skill-building — courses, mentoring, on-the-job stretch","Pair developing team members with experienced practitioners","Review in next quarterly planning cycle"],4:["Maintain and deepen — don't let it atrophy","Leverage this capability on priority initiatives","Consider how to share this capability across the organisation"],5:["Protect and systemise — document what makes this excellent","Use as a competitive advantage","Export this capability to help others"]};

function Tool7CapabilityMapper(){
  const[scores,setScores]=useState({});
  const[imp,setImp]=useState({});
  const[notes,setNotes]=useState({});
  const[view,setView]=useState("assess");

  const scored=Object.keys(scores).filter(k=>scores[k]>0).length;
  const critGaps=CAP_DOMAINS.filter(d=>scores[d.id]===1);
  const sigGaps=CAP_DOMAINS.filter(d=>scores[d.id]===2);
  const strengths=CAP_DOMAINS.filter(d=>scores[d.id]>=4);

  const capColor=s=>!s?"#ccc":s===1?RED:s===2?"#C0622A":s===3?AMBER:s===4?G_MID:"#2C6B52";

  if(view==="map")return <div style={{animation:"fadeIn 0.3s ease"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
      {[["Critical Gaps",critGaps.length,RED],["Significant Gaps",sigGaps.length,"#C0622A"],["Strengths",strengths.length,G_MID]].map(([l,v,c])=><Card key={l} style={{padding:16,textAlign:"center"}}>
        <div style={{...serif,fontSize:36,fontWeight:700,color:c}}>{v}</div>
        <div style={{...mono,fontSize:9,color:T4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{l}</div>
      </Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:16}}>
      {CAP_DOMAINS.map(d=>{const s=scores[d.id]||0;const col=capColor(s);return <div key={d.id} style={{background:s?col+"15":S2,border:`1.5px solid ${s?col:BDR}`,padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div style={{...serif,fontSize:13,fontWeight:700,color:T1}}>{d.label}</div>
          {s>0&&<Pill color={col}>{CAP_LABELS[s]}</Pill>}
        </div>
        <div style={{fontSize:11,color:T4,marginBottom:s?8:0}}>{d.sub}</div>
        {s>0&&notes[d.id]&&<div style={{fontSize:11,color:T3,fontStyle:"italic",borderTop:`1px solid ${BDR}`,paddingTop:6,marginTop:4}}>{notes[d.id]}</div>}
        {s>0&&s<4&&<div style={{marginTop:8}}>
          {(CAP_ACTIONS[s]||[]).slice(0,2).map((a,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:3}}><span style={{color:GOLD,fontSize:10,flexShrink:0}}>—</span><span style={{fontSize:10,color:T3,lineHeight:1.4}}>{a}</span></div>)}
        </div>}
      </div>;})}
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
      <OBtn onClick={()=>setView("assess")}>← Back</OBtn>
      <OBtn onClick={()=>exportCapability({domains:CAP_DOMAINS,scores,imp,notes})}>↓ Download Gap Map</OBtn>
    </div>
  </div>;

  return <div>
    <InfoBox>Rate your organisation's current capability in each domain. Score 1–5 where 1 = Critical Gap and 5 = Strong. Add importance weighting and notes to sharpen the analysis.</InfoBox>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
      {CAP_DOMAINS.map(d=>{const s=scores[d.id]||0;const col=capColor(s);return <div key={d.id} style={{background:S2,border:`1.5px solid ${s?col:BDR}`,padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div><div style={{...serif,fontSize:13,fontWeight:700,color:T1}}>{d.label}</div><div style={{fontSize:11,color:T4,marginTop:1}}>{d.sub}</div></div>
          {s>0&&<Pill color={col}>{CAP_LABELS[s]}</Pill>}
        </div>
        <div style={{display:"flex",gap:3,marginBottom:8}}>
          {[1,2,3,4,5].map(v=><button key={v} onClick={()=>setScores(p=>({...p,[d.id]:v}))} style={{flex:1,padding:"6px 0",...mono,fontSize:10,cursor:"pointer",border:"none",background:s===v?capColor(v):S3,color:s===v?"#fff":T4,fontWeight:s===v?700:400,transition:"all 0.1s"}}>{v}</button>)}
        </div>
        <textarea rows={1} value={notes[d.id]||""} onChange={e=>setNotes(p=>({...p,[d.id]:e.target.value}))} placeholder="Notes..." style={{fontSize:11}}/>
      </div>;})}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:12,color:T4}}>{scored} of {CAP_DOMAINS.length} domains assessed</span>
      <GBtn disabled={scored===0} onClick={()=>setView("map")}>View Gap Map →</GBtn>
    </div>
  </div>;
}

// ─── TOOL 8 — CHANGE & ADOPTION ══════════════════════════════════════════════
const ADKAR=[
  {id:"awareness",label:"Awareness",color:"#3a6b8a",desc:"Do people understand why the change is happening?",interventions:["CEO / sponsor communication explaining the business reason","Town hall Q&A on the need for change","Manager briefing packs with FAQs","Visible leadership alignment messaging","Personal impact sessions by team"]},
  {id:"desire",label:"Desire",color:G_MID,desc:"Do people want to support and participate?",interventions:["Manager coaching on their role as change champions","Individual conversations on WIIFM (what's in it for me)","Involve influencers and early adopters","Address concerns transparently, not defensively","Recognise and reward early adoption"]},
  {id:"knowledge",label:"Knowledge",color:AMBER,desc:"Do people know how to change?",interventions:["Role-specific training sequenced before go-live","Process walkthroughs and simulations","Quick reference guides and job aids","Peer-to-peer learning sessions","Training effectiveness measurement"]},
  {id:"ability",label:"Ability",color:"#C0622A",desc:"Can people perform in the new way?",interventions:["Supervised practice in a safe environment","On-the-job coaching during and after go-live","Feedback loops to identify where people are struggling","Extended hypercare period post go-live","Performance support tools at point of need"]},
  {id:"reinforcement",label:"Reinforcement",color:RED,desc:"Is the change being sustained and embedded?",interventions:["Celebrate early wins publicly","Update performance reviews and accountability frameworks","Remove workarounds and old system access","Measure and report adoption rates monthly","Address non-compliance with coaching before consequences"]},
];
const RESISTANCE=[
  {id:"loss",label:"Fear of job loss or role change",risk:"High"},
  {id:"competence",label:"Lack of confidence in new skills",risk:"High"},
  {id:"trust",label:"Distrust of leadership intent",risk:"High"},
  {id:"overload",label:"Change saturation / too much at once",risk:"Medium"},
  {id:"process",label:"Disagreement with the process or approach",risk:"Medium"},
  {id:"benefit",label:"Can't see the personal benefit",risk:"Medium"},
  {id:"history",label:"Previous change initiatives failed",risk:"Low"},
  {id:"culture",label:"Cultural resistance to change",risk:"Low"},
];
const RES_RESP={loss:"Acknowledge the concern directly. Be transparent about what will and won't change. Involve people early in designing the new ways of working.",competence:"Build confidence through training, practice and visible management support. Create safe spaces to make mistakes during transition.",trust:"Demonstrate alignment through consistent leader behaviour. Involve sceptics as advisors. Deliver on small commitments before asking for big ones.",overload:"Map the total change load. Sequence or consolidate where possible. Give people permission to say when they're at capacity.",process:"Listen actively. Incorporate valid feedback. Explain clearly where the decision has been made and why revisiting isn't on the table.",benefit:"Make the personal benefit explicit. Connect the change to things individuals care about — job security, career, quality of work, less frustration.",history:"Acknowledge what went wrong before. Be specific about what's different this time. Deliver visible quick wins early.",culture:"Identify cultural champions at all levels. Make the new way of working feel like 'us' not something imposed on us."};

function Tool8ChangeAdoption(){
  const[step,setStep]=useState("setup");
  const[cname,setCname]=useState("");
  const[ctype,setCtype]=useState("");
  const[groups,setGroups]=useState("");
  const[scope,setScope]=useState(3);
  const[adkarScores,setAdkarScores]=useState({});
  const[rfactors,setRfactors]=useState([]);
  const[view,setView]=useState("adkar");

  const complete=ADKAR.every(e=>adkarScores[e.id]>0);
  const weakest=complete?ADKAR.reduce((min,el)=>!adkarScores[el.id]||adkarScores[el.id]<(adkarScores[min?.id]||6)?el:min,null):null;

  if(step==="setup")return <div>
    <InfoBox>The Change & Adoption Planner uses the ADKAR model (Prosci) to assess readiness and identify where your change is most at risk. Start with the basics, then score each element.</InfoBox>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Change Name *</label>
        <input value={cname} onChange={e=>setCname(e.target.value)} placeholder="e.g. New CRM Implementation"/></div>
      <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Change Type</label>
        <select value={ctype} onChange={e=>setCtype(e.target.value)}>
          <option value="">Select type...</option>
          {["Technology","Process","Structure","Culture","Strategy","Policy"].map(t=><option key={t}>{t}</option>)}
        </select></div>
      <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Impacted Groups</label>
        <input value={groups} onChange={e=>setGroups(e.target.value)} placeholder="e.g. Sales team, Finance, Customer service"/></div>
      <div><label style={{...mono,fontSize:9,color:T4,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:4}}>Scale of change (1–5)</label>
        <div style={{display:"flex",gap:4,marginTop:6}}>{[1,2,3,4,5].map(v=><button key={v} onClick={()=>setScope(v)} style={{flex:1,padding:"8px 0",...mono,fontSize:11,cursor:"pointer",border:"none",background:scope===v?GOLD:S3,color:scope===v?G:T4,fontWeight:scope===v?700:400,transition:"all 0.1s"}}>{v}</button>)}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:10,color:T4}}>Incremental</span><span style={{fontSize:10,color:T4}}>Transformational</span></div>
      </div>
    </div>
    <GBtn disabled={!cname} onClick={()=>setStep("adkar")}>Start ADKAR Assessment →</GBtn>
  </div>;

  if(step==="adkar")return <div>
    <div style={{...serif,fontSize:13,color:T3,fontStyle:"italic",marginBottom:16}}>Change: <strong style={{color:T1}}>{cname}</strong>{ctype&&<span> · {ctype}</span>}</div>
    <TabBar tabs={[{id:"adkar",label:"ADKAR Assessment"},{id:"resistance",label:"Resistance Factors"}]} active={view} onChange={setView}/>
    {view==="adkar"&&<div>
      {ADKAR.map(el=>{const s=adkarScores[el.id]||0;const isBarrier=el.id===weakest?.id;return <div key={el.id} style={{background:isBarrier?"rgba(185,64,64,0.06)":S2,border:`1.5px solid ${isBarrier?"rgba(185,64,64,0.3)":BDR}`,padding:"16px 18px",marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:el.color,flexShrink:0}}/>
            <div><div style={{...serif,fontSize:14,fontWeight:700,color:T1}}>{el.label}</div><div style={{fontSize:12,color:T3,marginTop:2}}>{el.desc}</div></div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,marginLeft:12}}>
            {isBarrier&&<Pill color={RED}>⚠ Barrier Point</Pill>}
            {s>0&&<Pill color={el.color}>{["","Very Low","Low","Moderate","High","Very High"][s]}</Pill>}
          </div>
        </div>
        <div style={{display:"flex",gap:3}}>
          {[1,2,3,4,5].map(v=><button key={v} onClick={()=>setAdkarScores(p=>({...p,[el.id]:v}))} style={{flex:1,padding:"8px 0",...mono,fontSize:11,cursor:"pointer",border:"none",background:s===v?el.color:S3,color:s===v?"#fff":T4,fontWeight:s===v?700:400,transition:"all 0.1s"}}>{v}</button>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:T4}}>Not present</span><span style={{fontSize:10,color:T4}}>Fully embedded</span></div>
      </div>;})}
    </div>}
    {view==="resistance"&&<div>
      <div style={{marginBottom:12,fontSize:12,color:T3}}>Select resistance factors present in this change. The plan will include tailored responses for each.</div>
      {RESISTANCE.map(r=><div key={r.id} onClick={()=>setRfactors(p=>p.includes(r.id)?p.filter(x=>x!==r.id):[...p,r.id])} style={{background:rfactors.includes(r.id)?G+"12":S2,border:`1.5px solid ${rfactors.includes(r.id)?G:BDR}`,padding:"12px 16px",marginBottom:4,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{width:14,height:14,border:`1.5px solid ${rfactors.includes(r.id)?GOLD:BDR}`,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:rfactors.includes(r.id)?GOLD:"transparent"}}>{rfactors.includes(r.id)&&<span style={{color:G,fontSize:9,fontWeight:700}}>✓</span>}</span>
          <span style={{fontSize:13,color:T2}}>{r.label}</span>
        </div>
        <Pill color={r.risk==="High"?RED:r.risk==="Medium"?AMBER:T4}>{r.risk} risk</Pill>
      </div>)}
    </div>}
    <div style={{display:"flex",gap:10,justifyContent:"space-between",marginTop:16}}>
      <OBtn onClick={()=>setStep("setup")}>← Back</OBtn>
      <GBtn onClick={()=>setStep("plan")}>Generate Plan →</GBtn>
    </div>
  </div>;

  if(step==="plan")return <div style={{animation:"fadeIn 0.3s ease"}}>
    {weakest&&<div style={{background:"rgba(185,64,64,0.06)",border:"1px solid rgba(185,64,64,0.25)",padding:"14px 18px",marginBottom:16}}>
      <div style={{...mono,fontSize:9,color:RED,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>⚠ Barrier Point Identified</div>
      <div style={{...serif,fontSize:16,fontWeight:700,color:T1,marginBottom:4}}>{weakest.label}</div>
      <div style={{fontSize:12,color:T3}}>This is your most critical gap. Address it first — all other elements depend on it being strong enough.</div>
    </div>}
    <Card style={{padding:24,marginBottom:12}}>
      <SL>ADKAR Summary</SL>
      {ADKAR.map(el=>{const s=adkarScores[el.id]||0;const pct=(s/5)*100;return <div key={el.id} style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:13,color:T2,fontWeight:600}}>{el.label}</span>
          <span style={{...mono,fontSize:10,color:el.color}}>{s}/5 · {["—","Very Low","Low","Moderate","High","Very High"][s]||"—"}</span>
        </div>
        <div style={{height:4,background:S3,borderRadius:2}}><div style={{height:"100%",width:pct+"%",background:el.color,borderRadius:2,transition:"width 0.6s"}}/></div>
      </div>;})}
    </Card>
    <Card style={{padding:24,marginBottom:12}}>
      <SL>Recommended Interventions</SL>
      {ADKAR.filter(el=>(adkarScores[el.id]||0)<4).map(el=><div key={el.id} style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:el.color}}/>
          <div style={{...serif,fontSize:14,fontWeight:700,color:T1}}>{el.label}</div>
          <Pill color={el.color}>{["","Very Low","Low","Moderate","High","Very High"][adkarScores[el.id]||0]||"Not scored"}</Pill>
        </div>
        {(el.interventions||[]).slice(0,adkarScores[el.id]===1?5:adkarScores[el.id]===2?4:3).map((a,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
          <span style={{color:GOLD,flexShrink:0}}>—</span><span style={{fontSize:12,color:T3,lineHeight:1.6}}>{a}</span>
        </div>)}
      </div>)}
    </Card>
    {rfactors.length>0&&<Card style={{padding:24,marginBottom:12,border:"1px solid rgba(185,64,64,0.2)",background:"rgba(185,64,64,0.03)"}}>
      <SL color={RED}>Resistance Response Plan</SL>
      {rfactors.map(id=>{const factor=RESISTANCE.find(r=>r.id===id);const rc=factor.risk==="High"?RED:AMBER;return <div key={id} style={{borderLeft:`2px solid ${rc}`,paddingLeft:14,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><div style={{...serif,fontSize:14,fontWeight:700,color:T1}}>{factor.label}</div><Pill color={rc}>{factor.risk} risk</Pill></div>
        <div style={{fontSize:12,color:T3,lineHeight:1.7}}>{RES_RESP[id]}</div>
      </div>;})}
    </Card>}
    <div style={{display:"flex",gap:10,justifyContent:"space-between",alignItems:"center"}}>
      <OBtn onClick={()=>setStep("adkar")}>← Revise</OBtn>
      <OBtn onClick={()=>exportChange({changeName:cname,changeType:ctype,groups,scope,adkarScores,rfactors,adkar:ADKAR,resistance:RESISTANCE,resResp:RES_RESP,interventions:ADKAR.reduce((acc,el)=>({...acc,[el.id]:el.interventions}),[])})}>↓ Download Plan</OBtn>
    </div>
  </div>;
  return null;
}

// ─── MAIN APP SHELL ═══════════════════════════════════════════════════════════
const TOOLS=[
  {id:"diagnostic",     num:"01",label:"Strategy Diagnostic",       sub:"Where are the gaps?",          phase:"Diagnose"},
  {id:"prioritisation", num:"02",label:"Initiative Prioritisation",  sub:"What matters most?",           phase:"Choose"},
  {id:"decision",       num:"03",label:"Decision Stack",             sub:"What are we committing to?",   phase:"Commit"},
  {id:"role",           num:"04",label:"Role Success Profiles",      sub:"Who owns execution?",          phase:"Assign"},
  {id:"kpi",            num:"05",label:"KPI & Performance",          sub:"How do we measure it?",        phase:"Measure"},
  {id:"rhythm",         num:"06",label:"Operating Rhythm",           sub:"How do we run it?",            phase:"Operate"},
  {id:"capability",     num:"07",label:"Capability & Gap Mapping",   sub:"Can we actually do it?",       phase:"Enable"},
  {id:"change",         num:"08",label:"Change & Adoption",          sub:"Will people make it real?",    phase:"Sustain"},
];


// ─── TOOLS REGISTRY ═══════════════════════════════════════════════════════════
const TOOLS=[
  {id:"diagnostic",     num:"01",label:"Strategy Diagnostic",       sub:"Where are the gaps?",          phase:"Diagnose"},
  {id:"prioritisation", num:"02",label:"Initiative Prioritisation",  sub:"What matters most?",           phase:"Choose"},
  {id:"decision",       num:"03",label:"Decision Stack",             sub:"What are we committing to?",   phase:"Commit"},
  {id:"role",           num:"04",label:"Role Success Profiles",      sub:"Who owns execution?",          phase:"Assign"},
  {id:"kpi",            num:"05",label:"KPI & Performance",          sub:"How do we measure it?",        phase:"Measure"},
  {id:"rhythm",         num:"06",label:"Operating Rhythm",           sub:"How do we run it?",            phase:"Operate"},
  {id:"capability",     num:"07",label:"Capability & Gap Mapping",   sub:"Can we actually do it?",       phase:"Enable"},
  {id:"change",         num:"08",label:"Change & Adoption",          sub:"Will people make it real?",    phase:"Sustain"},
];

// ─── MAIN EXPORT (Next.js — receives user + onSignOut from dashboard) ═════════
export default function SMRSuite({ user, onSignOut }) {
  const[activeTool,setActiveTool]=useState("diagnostic");
  const[diagnosticScores,setDiagnosticScores]=useState({});
  const[initiatives,setInitiatives]=useState([]);
  const active=TOOLS.find(t=>t.id===activeTool);

  function handleDiagnosticComplete(scores){setDiagnosticScores(scores);setActiveTool("prioritisation");}
  function handlePrioritisationComplete(inits){setInitiatives(inits);setActiveTool("decision");}

  return <div style={{minHeight:"100vh",background:S1,display:"flex",flexDirection:"column"}}>
    <style>{CSS}</style>

    {/* Header */}
    <header style={{background:G,padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"stretch",position:"sticky",top:0,zIndex:200,flexShrink:0,minHeight:58,borderBottom:`3px solid ${GOLD}`}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <svg width="34" height="34" viewBox="0 0 512 512" fill="none">
          <ellipse cx="280" cy="256" rx="200" ry="220" stroke="rgba(247,244,239,0.3)" strokeWidth="8" fill="none"/>
          <ellipse cx="310" cy="256" rx="135" ry="220" stroke="rgba(247,244,239,0.3)" strokeWidth="8" fill="none"/>
          <ellipse cx="270" cy="256" rx="75" ry="85" stroke="rgba(247,244,239,0.3)" strokeWidth="8" fill="none"/>
          <circle cx="320" cy="256" r="42" fill={GOLD}/>
          <circle cx="320" cy="256" r="20" fill="rgba(44,74,62,0.5)"/>
          <line x1="160" y1="120" x2="185" y2="385" stroke="rgba(247,244,239,0.25)" strokeWidth="7"/>
        </svg>
        <div>
          <div style={{...serif,fontSize:14,fontWeight:700,color:CREAM,lineHeight:1.1}}>STRATEGY <em style={{fontWeight:400,color:GOLD}}>Made Real</em></div>
          <div style={{...mono,fontSize:8,color:"rgba(247,244,239,0.4)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>Where strategy becomes owned, measurable, and executed.</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"stretch",gap:0}}>
        {TOOLS.map((t,i)=>{
          const isActive=t.id===activeTool;
          const isDone=TOOLS.findIndex(x=>x.id===activeTool)>i;
          return <button key={t.id} onClick={()=>setActiveTool(t.id)} style={{background:"none",border:"none",borderBottom:isActive?`3px solid ${GOLD}`:"3px solid transparent",borderTop:"3px solid transparent",padding:"0 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,transition:"all 0.15s",minWidth:40}}>
            <div style={{...mono,fontSize:8,color:isActive?GOLD:isDone?"rgba(212,168,71,0.45)":"rgba(247,244,239,0.22)",letterSpacing:"0.04em",transition:"color 0.15s"}}>{t.num}</div>
            <div style={{width:4,height:4,borderRadius:"50%",background:isActive?GOLD:isDone?"rgba(212,168,71,0.35)":"rgba(247,244,239,0.15)",transition:"background 0.15s"}}/>
          </button>;
        })}
      </div>
      {/* User + Sign Out */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {user?.email&&<div style={{...mono,fontSize:8,color:"rgba(247,244,239,0.35)",letterSpacing:"0.06em"}}>{user.email}</div>}
        <button onClick={onSignOut} style={{background:"transparent",border:"1px solid rgba(247,244,239,0.2)",color:"rgba(247,244,239,0.5)",padding:"5px 12px",...mono,fontSize:8,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Sign Out</button>
      </div>
    </header>

    {/* Body */}
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      {/* Sidebar */}
      <nav style={{width:220,flexShrink:0,background:G,overflowY:"auto",position:"sticky",top:58,height:"calc(100vh - 58px)",display:"flex",flexDirection:"column",borderRight:`1px solid rgba(212,168,71,0.15)`}}>
        <div style={{padding:"10px 0",flex:1}}>
          {TOOLS.map((t,i)=>{
            const isActive=activeTool===t.id;
            const isDone=TOOLS.findIndex(x=>x.id===activeTool)>i;
            return <button key={t.id} onClick={()=>setActiveTool(t.id)} style={{width:"100%",background:isActive?"rgba(212,168,71,0.12)":"transparent",border:"none",borderLeft:isActive?`3px solid ${GOLD}`:"3px solid transparent",padding:"10px 14px 10px 16px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",display:"block",position:"relative"}}>
              <div style={{...mono,fontSize:8,color:isActive?GOLD:isDone?"rgba(212,168,71,0.4)":"rgba(247,244,239,0.28)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{t.num} · {t.phase}</div>
              <div style={{fontSize:12,fontWeight:600,color:isActive?CREAM:"rgba(247,244,239,0.65)",lineHeight:1.25,marginBottom:1}}>{t.label}</div>
              <div style={{fontSize:10,color:isActive?"rgba(247,244,239,0.55)":"rgba(247,244,239,0.28)"}}>{t.sub}</div>
              {isDone&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"rgba(212,168,71,0.4)",fontSize:10}}>✓</div>}
            </button>;
          })}
        </div>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(247,244,239,0.06)"}}>
          <div style={{...mono,fontSize:8,color:"rgba(247,244,239,0.2)",letterSpacing:"0.06em",lineHeight:1.9}}>Strategy Made Real<br/>Eight Tools · One Suite</div>
        </div>
      </nav>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",background:S1}}>
        <div style={{padding:"20px 28px 16px",background:S1,borderBottom:`1px solid ${BDR}`,flexShrink:0}}>
          <div style={{display:"inline-block",...mono,fontSize:9,color:G,background:GOLD,padding:"2px 8px",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Tool {active.num} · {active.phase}</div>
          <div style={{...serif,fontSize:"clamp(20px,2.2vw,30px)",fontWeight:700,color:T1,lineHeight:1.15}}>{active.label}</div>
          <div style={{fontSize:13,color:T3,marginTop:3}}>{active.sub}</div>
        </div>
        <div style={{padding:"24px 28px 64px",maxWidth:activeTool==="role"?"none":980}}>
          {activeTool==="diagnostic"     && <Tool1Diagnostic onComplete={handleDiagnosticComplete}/>}
          {activeTool==="prioritisation" && <Tool2Prioritisation diagnosticScores={diagnosticScores} onComplete={handlePrioritisationComplete}/>}
          {activeTool==="decision"       && <Tool3DecisionStack initiatives={initiatives}/>}
          {activeTool==="role"           && <Tool4RoleAnalyser committedInitiatives={initiatives}/>}
          {activeTool==="kpi"            && <Tool5KPIBuilder/>}
          {activeTool==="rhythm"         && <Tool6OperatingRhythm/>}
          {activeTool==="capability"     && <Tool7CapabilityMapper/>}
          {activeTool==="change"         && <Tool8ChangeAdoption/>}
        </div>
      </div>
    </div>
  </div>;
}
