import React, { useState } from 'react';
import { Stamp, ReceiptCard, CodeBlock, CoverageGauge, Chip, HealthChip, CounterChip, RecommendationCard, Treemap, Seal, ChainBlock, Button, } from '../components';
import { Terminal, Shield, ArrowUpRight, Check, Sliders } from 'lucide-react';
export const StyleguidePage = () => {
    const [gaugeValue, setGaugeValue] = useState(58);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedTreemapTile, setSelectedTreemapTile] = useState('orders.py');
    const treemapItems = [
        {
            id: '1',
            name: 'orders.py',
            path: 'api/routes/orders.py',
            size: 420,
            status: 'proven',
            meta: '420 SLOC',
            span: 'col-span-3 row-span-2',
            isPulsing: true,
            paperTag: 'orders.py changed 12 s ago',
        },
        {
            id: '2',
            name: 'test_orders.py',
            path: 'tests/test_orders.py',
            size: 180,
            status: 'proven',
            meta: '8 assertions',
            span: 'col-span-2 row-span-1',
        },
        {
            id: '3',
            name: 'Dockerfile',
            path: 'build/Dockerfile',
            size: 45,
            status: 'basic',
            meta: 'Single-stage',
            span: 'col-span-1 row-span-1',
        },
        {
            id: '4',
            name: 'db/queries.py',
            path: 'db/queries.py',
            size: 0,
            status: 'not_shown',
            meta: '0 files',
            span: 'col-span-2 row-span-1',
        },
        {
            id: '5',
            name: 'cache.py',
            path: 'lib/cache.py',
            size: 30,
            status: 'unclear',
            meta: '0 get/set',
            span: 'col-span-1 row-span-1',
        },
        {
            id: '6',
            name: 'auth/jwt.py',
            path: 'security/jwt.py',
            size: 140,
            status: 'proven',
            meta: 'HS256 signed',
            span: 'col-span-2 row-span-1',
        },
        {
            id: '7',
            name: '.github/ci.yml',
            path: '.github/workflows/ci.yml',
            size: 25,
            status: 'unclear',
            meta: 'inactive',
            span: 'col-span-1 row-span-1',
        },
    ];
    const samplePythonCode = `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/orders", tags=["orders"])

# Invariant-backed order pipeline
@router.post("/", status_code=201, response_model=OrderReceipt)
async def create_order(payload: OrderPayload, db: Session = Depends()):
    validated = await validator.verify_items(payload.items)
    if not validated.is_ok:
        raise HTTPException(status_code=400, detail="Invalid SKU")
    receipt = await orderService.process_transaction(payload)
    return receipt`;
    return (<div className="min-h-screen bg-[#0A0C0F] text-[#F4F2EC] desk-grid relative selection:bg-emerald-500/30 selection:text-white pb-24">
      {/* Ambient Radial Vignette and Glows */}
      <div className="fixed inset-0 pointer-events-none desk-vignette z-0"/>
      <div className="fixed -top-40 -left-40 w-[700px] h-[700px] bg-[#1F8A5B] opacity-[0.10] rounded-full blur-[140px] pointer-events-none z-0"/>
      <div className="fixed bottom-0 right-0 w-[750px] h-[750px] bg-[#6D5BD0] opacity-[0.09] rounded-full blur-[160px] pointer-events-none z-0"/>

      {/* Top Console Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 px-6 lg:px-12 bg-[#0A0C0F]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center text-[#34D399] shadow-md">
            <Terminal className="w-4 h-4"/>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-base">ProofStack</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#9AA3AE] border border-white/10">
                v2.4
              </span>
              <span className="text-[#9AA3AE]/40">/</span>
              <span className="text-xs font-mono text-[#34D399] font-medium tracking-wide">
                SHARED COMPONENT LIBRARY
              </span>
            </div>
          </div>
        </div>

        {/* Live Service Health & Refused Counters */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-4 border border-white/5 bg-white/[0.02] px-3.5 py-1.5 rounded-lg">
            <HealthChip label="GitHub" isHealthy={true}/>
            <HealthChip label="Webhook" isHealthy={true}/>
            <HealthChip label="Model" isHealthy={true}/>
            <HealthChip label="Rate limit" isHealthy={true}/>
          </div>

          <CounterChip label="Hollow signals refused" count={14} variant="attack"/>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1360px] mx-auto px-6 lg:px-12 pt-8 z-10 relative space-y-12">
        {/* Styleguide Hero Banner */}
        <section className="glass-panel rounded-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-[#1F8A5B]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F8A5B]/15 text-[#34D399] font-mono text-[11px] font-bold tracking-wider">
              <Shield className="w-3.5 h-3.5"/>
              <span>AUTHENTIC EVIDENCE LEDGER DESIGN SYSTEM</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-tight">
              Design Tokens &amp; Component Archetypes
            </h1>
            <p className="text-sm text-[#9AA3AE] max-w-2xl leading-relaxed">
              Every component adheres strictly to the ProofStack physical paper ledger rules:
              dark desk canvas (<code className="text-[#F4F2EC]">#0A0C0F</code>), only receipts as light paper objects (<code className="text-[#F4F2EC]">#F7F5F0</code>), double-bordered status stamps rotated -4°, self-hosted typography, and zero HTML injection.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
            {['all', 'stamps', 'receipts', 'code', 'charts', 'actions'].map((tab) => (<button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg transition-all capitalize ${activeTab === tab
                ? 'bg-[#1F8A5B] text-[#0A0C0F] font-bold shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                : 'text-[#9AA3AE] hover:text-white'}`}>
                {tab}
              </button>))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 1. STAMPS SECTION                                                         */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'stamps') && (<section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1F8A5B]"/>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  Status Stamps
                </h2>
                <span className="text-xs font-mono text-[#9AA3AE]">
                  (Double border, rotated -4°, icon + word pairing)
                </span>
              </div>
            </div>

            {/* Matrix of all 10 Statuses */}
            <div className="glass-panel rounded-panel p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
                  All Status Variants (Size MD)
                </h3>
                <div className="flex flex-wrap gap-4 items-center pt-2">
                  <Stamp status="proven"/>
                  <Stamp status="basic"/>
                  <Stamp status="not_shown"/>
                  <Stamp status="unclear"/>
                  <Stamp status="attack"/>
                  <Stamp status="refused"/>
                  <Stamp status="hollow"/>
                  <Stamp status="fulfilled"/>
                  <Stamp status="partly"/>
                  <Stamp status="not_fulfilled"/>
                </div>
              </div>

              {/* Sizes and Animation */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
                    Size Scale (SM, MD, LG)
                  </h3>
                  <div className="flex items-center gap-4">
                    <Stamp status="proven" size="sm"/>
                    <Stamp status="proven" size="md"/>
                    <Stamp status="proven" size="lg"/>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
                    Animated Pulse Invariant
                  </h3>
                  <div className="flex items-center gap-4">
                    <Stamp status="proven" animate={true}/>
                    <Stamp status="refused" animate={true}/>
                  </div>
                </div>
              </div>
            </div>
          </section>)}

        {/* ========================================================================= */}
        {/* 2. RECEIPT CARDS SECTION                                                  */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'receipts') && (<section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1F8A5B]"/>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  Physical Receipt Cards
                </h2>
                <span className="text-xs font-mono text-[#9AA3AE]">
                  (Sawtooth 12px tear edge, paper grain substrate, shadow, optional tilt)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Receipt 1: Proven Commit Contract */}
              <div className="relative p-1">
                <div className="absolute -top-3 right-6 z-20">
                  <Stamp status="proven" size="lg"/>
                </div>
                <ReceiptCard serial="CC-SPEC-0842 // COMMIT_CONTRACT" timestamp="2026-10-16 14:02:18 UTC" tilt={-0.5}>
                  <h3 className="font-display text-2xl text-[#14171A] leading-tight">
                    REST API Implementation
                  </h3>
                  <p className="text-xs text-[#575D65] mt-1 font-sans">
                    Checked across 2 independent verifiable GitHub signals.
                  </p>

                  <div className="my-4">
                    <CodeBlock code={samplePythonCode} fileName="api/routes/orders.py" startLine={40} highlightLines={[45, 46]} highlightType="emerald"/>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Chip label="Mounted route" variant="proven" icon={<Check className="w-3 h-3"/>}/>
                    <Chip label="Returns values" variant="proven" icon={<Check className="w-3 h-3"/>}/>
                    <Chip label="Tested (8 assertions)" variant="proven" icon={<Check className="w-3 h-3"/>}/>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#D3CDBD]">
                    <Button variant="solid_ink" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5"/>} iconPosition="right">
                      Open on GitHub
                    </Button>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      commit a182c4f
                    </span>
                  </div>
                </ReceiptCard>
              </div>

              {/* Receipt 2: Rejected / Hollow Claim */}
              <div className="relative p-1">
                <div className="absolute -top-3 right-6 z-20">
                  <Stamp status="hollow" size="lg"/>
                </div>
                <ReceiptCard serial="AUDIT-REJECT-0091" timestamp="2026-10-16 14:02:18 UTC" tilt={0.5} variant="cream">
                  <h3 className="font-display text-2xl text-[#14171A] leading-tight">
                    Automated Testing Invariant
                  </h3>
                  <p className="text-xs text-[#575D65] mt-1 font-sans">
                    Candidate claim in <code className="font-mono text-xs">tests/test_orders.py</code>
                  </p>

                  <div className="my-4">
                    <CodeBlock code={`def test_orders_endpoint_status():\n    response = client.get("/orders")\n    pass  # No assertion executed`} fileName="tests/test_orders.py" startLine={1} highlightLines={[3]} highlightType="red"/>
                  </div>

                  <div className="p-3 rounded bg-[#FFF2F0] border border-[#FF5C4D]/30 text-[#C2362B] mb-4 text-xs font-medium flex items-center justify-between">
                    <span>Test has no assertions. Refused, not counted.</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#FF5C4D]/15 px-1.5 py-0.5 rounded">
                      Refused
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#D3CDBD]">
                    <Button variant="ghost" size="sm">
                      Inspect in Raw Tree
                    </Button>
                    <span className="font-mono text-[11px] text-[#C2362B] font-bold">
                      Zero invariant rules checked
                    </span>
                  </div>
                </ReceiptCard>
              </div>
            </div>
          </section>)}

        {/* ========================================================================= */}
        {/* 3. CODEBLOCK SECTION                                                      */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'code') && (<section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1F8A5B]"/>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  CodeBlock
                </h2>
                <span className="text-xs font-mono text-[#9AA3AE]">
                  (Line numbers, highlighted line bars, JetBrains Mono, escaped text)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#34D399]">
                  Verified Pass (Emerald Gutter)
                </span>
                <CodeBlock code={`@router.get("/metrics")\nasync def get_metrics():\n    # Checked against live contract\n    return {"status": "proven"}`} fileName="src/api/routes/metrics.py" startLine={10} highlightLines={[12]} highlightType="emerald"/>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-[#FF5C4D]">
                  Rejected Regression (Red Gutter)
                </span>
                <CodeBlock code={`def authenticate_user():\n    # Missing HS256 signature verification\n    return True`} fileName="security/auth.py" startLine={88} highlightLines={[90]} highlightType="red"/>
              </div>
            </div>
          </section>)}

        {/* ========================================================================= */}
        {/* 4. CHARTS: GAUGE & TREEMAP                                                */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'charts') && (<section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1F8A5B]"/>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  Evidence Coverage Gauge &amp; Proof Map Treemap
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CoverageGauge with Interactive Slider */}
              <div className="lg:col-span-4 space-y-4">
                <CoverageGauge percentage={gaugeValue} assessedCount={7} totalCount={10} baseline={50} target={78}/>

                {/* Interactive controller for the gauge */}
                <div className="glass-panel rounded-panel p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-[#9AA3AE]">
                      <Sliders className="w-3.5 h-3.5"/> Test Gauge Value
                    </span>
                    <span className="font-bold text-[#34D399]">{gaugeValue}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={gaugeValue} onChange={(e) => setGaugeValue(Number(e.target.value))} className="w-full accent-[#1F8A5B] cursor-pointer"/>
                </div>
              </div>

              {/* Treemap */}
              <div className="lg:col-span-8">
                <Treemap items={treemapItems} title="Proof Map" onSelectTile={(item) => setSelectedTreemapTile(item.name)}/>
                <div className="mt-2 text-right text-xs font-mono text-[#9AA3AE]">
                  Active Selected Tile: <span className="text-[#34D399] font-bold">{selectedTreemapTile}</span>
                </div>
              </div>
            </div>
          </section>)}

        {/* ========================================================================= */}
        {/* 5. RECOMMENDATIONS & VERIFICATION BLOCKS                                 */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'actions') && (<section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1F8A5B]"/>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  Recommendation Cards, Seals &amp; Ledger ChainBlocks
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Recommendation Card */}
              <RecommendationCard title="Next commit: add one query + one test" delta="+13% DELTA" description="Establish SQLite schema migration in db/queries.py to prove persistence invariant." targetRequirement="SQL" targetStatus="proven" buttonLabel="Open contract" onAction={() => alert('Contract CC-0842 opened for dry run')}/>

              {/* ChainBlock */}
              <ChainBlock blockHeight={842} commitHash="a182c4f" previousHash="0x8e1a...41b0" timestamp="14:02:18 UTC" invariantsProven={4} author="Auditor" merkleRoot="0x981A7b91c04f981023d8..."/>

              {/* Seal Badges */}
              <div className="glass-panel rounded-panel p-6 flex flex-col items-center justify-center space-y-4 text-center">
                <span className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
                  Notarized Verification Seals
                </span>
                <div className="flex items-center justify-center gap-4">
                  <Seal size="sm" status="proven"/>
                  <Seal size="md" status="proven"/>
                </div>
                <p className="text-[11px] font-mono text-[#6B7280]">
                  Ed25519 Immutable Attestation Mark
                </p>
              </div>
            </div>
          </section>)}

        {/* ========================================================================= */}
        {/* 6. BUTTONS & CHIPS MATRIX                                                 */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'actions') && (<section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1F8A5B]"/>
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                  Button Variants &amp; Chip Collections
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button Variants */}
              <div className="glass-panel rounded-panel p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
                  Four Button Variants (Solid Paper, Solid Ink, Ghost, Quiet Text)
                </h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="solid_paper">Solid Paper</Button>
                  <Button variant="solid_ink">Solid Ink</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="quiet_text">Quiet Text</Button>
                  <Button variant="emerald">Emerald Action</Button>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3 items-center">
                  <Button variant="solid_ink" size="sm">Small</Button>
                  <Button variant="solid_ink" size="md">Medium</Button>
                  <Button variant="solid_ink" size="lg">Large</Button>
                  <Button variant="solid_ink" isLoading={true}>Saving</Button>
                  <Button variant="solid_ink" disabled={true}>Disabled</Button>
                </div>
              </div>

              {/* Chips Collection */}
              <div className="glass-panel rounded-panel p-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
                  Chips &amp; Service Health Monitors
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Chip label="Python" variant="proven"/>
                  <Chip label="FastAPI" variant="proven"/>
                  <Chip label="Docker" variant="basic"/>
                  <Chip label="PostgreSQL" variant="notshown"/>
                  <Chip label="Redis" variant="unclear"/>
                  <Chip label="Unchecked" variant="dashed"/>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap gap-4 items-center">
                  <HealthChip label="GitHub" isHealthy={true}/>
                  <HealthChip label="Rate limit" isHealthy={true}/>
                  <CounterChip label="Hollow signals refused" count={14} variant="attack"/>
                </div>
              </div>
            </div>
          </section>)}
      </main>
    </div>);
};
