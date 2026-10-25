import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * CodeProofLedgerBackground
 * 
 * Directly visualizes the ProofStack Problem & Solution:
 * 1. Git Commit Topology: 4 vertical Git rails (main/proven, ast/callgraph, hollow-guard/refused, contracts/predicted).
 * 2. Real Code Receipts & Invariants: Floating verified AST snippets and refused hollow mocks.
 * 3. Hollow Signal Guard in Action: Visual representations of 'assert True' and unimported packages being refused.
 * 4. Merkle Ledger Hash Chain: Continuous cryptographic pulses traveling down Git tracks.
 * 5. Interactive Cursor Raycaster: Mouse connects to nearest code proofs with verification lasers.
 */
export const CodeProofLedgerBackground = ({ 
  className = 'fixed inset-0 pointer-events-none z-0',
  density = 'normal',
  opacity = 0.95
}) => {
  const canvasRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let isVisible = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initEntities();
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Canvas coordinate setup
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Git Branch Profiles directly matching the product
    const BRANCHES = {
      main: {
        name: 'git // main [PROVEN]',
        stroke: 'rgba(16, 185, 129, 0.45)',
        glow: '#10B981',
        text: '#34D399',
      },
      ast: {
        name: 'ast // call-graph-reachability',
        stroke: 'rgba(6, 182, 212, 0.4)',
        glow: '#06B6D4',
        text: '#22D3EE',
      },
      guard: {
        name: 'guard // hollow-signals-refused',
        stroke: 'rgba(239, 68, 68, 0.35)',
        glow: '#EF4444',
        text: '#F87171',
      },
      contracts: {
        name: 'predictive // commit-contracts',
        stroke: 'rgba(168, 85, 247, 0.4)',
        glow: '#A855F7',
        text: '#C084FC',
      },
    };

    // Concrete Code Receipts framed cleanly in the left and right screen gutters
    const CODE_RECEIPTS_DATA = [
      {
        file: 'api/routes.py:L14',
        code: '@router.get("/v1/orders")',
        type: 'VERIFIED',
        tag: 'DEMONSTRATED: STRONG',
        color: '#10B981',
        detail: 'AST route handler reachable',
        xPct: 0.08,
        yPct: 0.24,
      },
      {
        file: 'tests/test_audit.py:L38',
        code: 'def test_foo(): assert True',
        type: 'REFUSED',
        tag: 'HOLLOW MOCK BLOCKED',
        color: '#EF4444',
        detail: 'Refused: 0 code exercised',
        xPct: 0.92,
        yPct: 0.20,
      },
      {
        file: 'models/queries.py:L45',
        code: 'SELECT * FROM ledger WHERE id = :id',
        type: 'VERIFIED',
        tag: 'SQL: DEMONSTRATED',
        color: '#06B6D4',
        detail: 'Parameterized query verified',
        xPct: 0.08,
        yPct: 0.58,
      },
      {
        file: 'package.json:L29',
        code: '"psycopg2": "^2.9.0"',
        type: 'REFUSED',
        tag: 'UNUSED DEPENDENCY',
        color: '#F59E0B',
        detail: 'Refused: never imported in AST',
        xPct: 0.92,
        yPct: 0.52,
      },
      {
        file: 'contract/next_commit.json',
        code: '+1 parameterized route & test',
        type: 'CONTRACT',
        tag: 'PREDICTIVE COMMIT CONTRACT',
        color: '#A855F7',
        detail: 'SQL moves to Strong · 0 regression',
        xPct: 0.08,
        yPct: 0.82,
      },
      {
        file: 'proof/merkle_head.sig',
        code: 'ed25519:7f83b16...e28a4c9',
        type: 'LEDGER',
        tag: 'TAMPER-EVIDENT RECEIPT',
        color: '#38BDF8',
        detail: 'Cryptographic hash chain verified',
        xPct: 0.92,
        yPct: 0.82,
      },
    ];

    let rails = [];
    let commitNodes = [];
    let pulses = [];
    let mergeArcs = [];
    let codeReceipts = [];

    const initEntities = () => {
      // 4 Git Rails positioned in the left and right margins framing the page
      const xPositions = {
        guard: Math.max(24, width * 0.035),
        main: Math.max(120, width * 0.12),
        ast: Math.min(width - 120, width * 0.88),
        contracts: Math.min(width - 24, width * 0.965),
      };

      rails = [
        { id: 'guard', x: xPositions.guard, branch: 'guard' },
        { id: 'main', x: xPositions.main, branch: 'main' },
        { id: 'ast', x: xPositions.ast, branch: 'ast' },
        { id: 'contracts', x: xPositions.contracts, branch: 'contracts' },
      ];

      // Concrete Commit Nodes along tracks
      commitNodes = [
        { sha: '7f83b16', rail: 'main', msg: 'param query verified', status: 'STRONG', yPct: 0.14 },
        { sha: '3e91a0c', rail: 'ast', msg: 'ast call-tree visit', status: 'MATCH', yPct: 0.28 },
        { sha: 'b4d8f21', rail: 'guard', msg: 'assert True blocked', status: 'REFUSED', yPct: 0.36 },
        { sha: 'a182c4f', rail: 'main', msg: 'sqlite wal signed', status: 'PROVEN', yPct: 0.50 },
        { sha: '9f3c2ab', rail: 'ast', msg: 'reachability 100%', status: 'PASS', yPct: 0.64 },
        { sha: 'd0dd1f6', rail: 'guard', msg: 'unimported pkg removed', status: 'CLEANSED', yPct: 0.72 },
        { sha: 'c0ffee1', rail: 'contracts', msg: 'contract fulfilled', status: 'LEVEL-UP', yPct: 0.40 },
        { sha: 'e28a4c9', rail: 'contracts', msg: 'testing unregressed', status: 'SEALED', yPct: 0.84 },
      ].map((c) => {
        const rail = rails.find((r) => r.id === c.rail) || rails[1];
        return {
          ...c,
          x: rail.x,
          y: height * c.yPct,
          radius: 4.5,
          pulseRing: 0,
          branchProfile: BRANCHES[rail.branch],
        };
      });

      // Merge Arcs (Branching Git Topology)
      mergeArcs = [
        { fromX: xPositions.main, fromY: height * 0.20, toX: xPositions.ast, toY: height * 0.28, color: BRANCHES.ast },
        { fromX: xPositions.ast, fromY: height * 0.38, toX: xPositions.main, toY: height * 0.48, color: BRANCHES.ast },
        { fromX: xPositions.main, fromY: height * 0.32, toX: xPositions.guard, toY: height * 0.36, color: BRANCHES.guard },
        { fromX: xPositions.main, fromY: height * 0.42, toX: xPositions.contracts, toY: height * 0.40, color: BRANCHES.contracts },
        { fromX: xPositions.contracts, fromY: height * 0.60, toX: xPositions.main, toY: height * 0.68, color: BRANCHES.contracts },
      ];

      // Continuous Traveling Verification Pulses
      pulses = [
        { railIdx: 1, y: 0, speed: 2.0, color: BRANCHES.main.glow, len: 50 },
        { railIdx: 1, y: height * 0.5, speed: 2.2, color: BRANCHES.main.glow, len: 50 },
        { railIdx: 2, y: height * 0.15, speed: 1.6, color: BRANCHES.ast.glow, len: 40 },
        { railIdx: 0, y: height * 0.3, speed: 1.4, color: BRANCHES.guard.glow, len: 35 },
        { railIdx: 3, y: height * 0.2, speed: 1.8, color: BRANCHES.contracts.glow, len: 45 },
      ];

      // Code Receipts positioned in clear negative spaces
      codeReceipts = CODE_RECEIPTS_DATA.map((r) => ({
        ...r,
        currentX: width * r.xPct,
        currentY: height * r.yPct,
        baseX: width * r.xPct,
        baseY: height * r.yPct,
        floatPhase: Math.random() * Math.PI * 2,
        isHovered: false,
      }));
    };

    initEntities();

    let lastTime = performance.now();

    const render = (currentTime) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Parallax mouse follow
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;
      const offsetX = mouseX > 0 ? (mouseX / width - 0.5) * 14 : 0;
      const offsetY = mouseY > 0 ? (mouseY / height - 0.5) * 10 : 0;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(offsetX, offsetY);

      // 1. Engineering Workbench Grid Crosses
      const gridPitch = 88;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      for (let x = gridPitch / 2; x < width; x += gridPitch) {
        for (let y = gridPitch / 2; y < height; y += gridPitch) {
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const factor = 1 - dist / 140;
            ctx.fillStyle = `rgba(52, 211, 153, ${factor * 0.25})`;
            ctx.fillRect(x - 2, y - 2, 4, 4);
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      }

      // 2. Render Git Branch Rails
      rails.forEach((rail) => {
        const col = BRANCHES[rail.branch];
        ctx.beginPath();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = col.stroke;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(rail.x, 0);
        ctx.lineTo(rail.x, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rail Top Header Label
        ctx.font = '10px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = col.text;
        ctx.globalAlpha = 0.5;
        const isRight = rail.x > width * 0.5;
        ctx.textAlign = isRight ? 'right' : 'left';
        ctx.fillText(col.name, isRight ? rail.x - 10 : rail.x + 10, 84);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
      });

      // 3. Render Merge Arcs (Cubic Bezier branch curves)
      mergeArcs.forEach((arc) => {
        ctx.beginPath();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = arc.color.stroke;
        ctx.setLineDash([4, 4]);

        const midY = (arc.fromY + arc.toY) / 2;
        ctx.moveTo(arc.fromX, arc.fromY);
        ctx.bezierCurveTo(arc.fromX, midY, arc.toX, midY, arc.toX, arc.toY);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 4. Verification Laser Pulses traveling down rails
      pulses.forEach((pulse) => {
        const rail = rails[pulse.railIdx];
        if (!shouldReduceMotion) {
          pulse.y += pulse.speed;
          if (pulse.y > height + 50) pulse.y = -30;
        }

        // Trigger node ring ripples when pulse hits a commit
        commitNodes.forEach((node) => {
          if (node.x === rail.x && Math.abs(pulse.y - node.y) < 6 && node.pulseRing <= 0) {
            node.pulseRing = 1.0;
          }
        });

        // Light trail
        const grad = ctx.createLinearGradient(rail.x, pulse.y - pulse.len, rail.x, pulse.y);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.7, pulse.color + '33');
        grad.addColorStop(1, pulse.color);

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = grad;
        ctx.moveTo(rail.x, Math.max(0, pulse.y - pulse.len));
        ctx.lineTo(rail.x, pulse.y);
        ctx.stroke();

        // Bright particle tip
        ctx.beginPath();
        ctx.arc(rail.x, pulse.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Render Commit Nodes along rails
      commitNodes.forEach((node) => {
        if (node.pulseRing > 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (1 - node.pulseRing) * 20, 0, Math.PI * 2);
          ctx.strokeStyle = node.branchProfile.glow;
          ctx.globalAlpha = node.pulseRing * 0.7;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          if (!shouldReduceMotion) {
            node.pulseRing -= delta * 1.5;
            if (node.pulseRing < 0) node.pulseRing = 0;
          }
        }

        // Dark backplate
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = '#07090E';
        ctx.fill();

        // Node ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.branchProfile.glow;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Monospace commit info
        const isRightAligned = node.x > width * 0.5;
        const textX = isRightAligned ? node.x - 12 : node.x + 12;
        ctx.textAlign = isRightAligned ? 'right' : 'left';

        ctx.font = '10px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = node.branchProfile.text;
        ctx.globalAlpha = 0.75;
        ctx.fillText(`${node.sha} [${node.status}]`, textX, node.y - 2);

        ctx.font = '9px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.globalAlpha = 0.45;
        ctx.fillText(node.msg, textX, node.y + 11);

        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
      });

      // 6. Render Floating Real Code Receipts & AST Invariants
      const time = currentTime * 0.001;

      codeReceipts.forEach((receipt, idx) => {
        if (!shouldReduceMotion) {
          receipt.currentY = receipt.baseY + Math.sin(time * 0.8 + receipt.floatPhase) * 6;
          receipt.currentX = receipt.baseX + Math.cos(time * 0.6 + receipt.floatPhase) * 4;
        }

        const rx = receipt.currentX;
        const ry = receipt.currentY;

        // Proximity detection to mouse
        const dist = Math.sqrt((rx - mouseX) * (rx - mouseX) + (ry - mouseY) * (ry - mouseY));
        receipt.isHovered = dist < 120;

        // Interactive verification laser from cursor to code receipt
        if (receipt.isHovered && mouseX > 0) {
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = receipt.color + '44';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Receipt Card Plaque
        const cardW = 220;
        const cardH = 54;
        const cardX = rx - cardW / 2;
        const cardY = ry - cardH / 2;

        // Card glass background
        ctx.fillStyle = receipt.isHovered ? 'rgba(15, 23, 42, 0.85)' : 'rgba(10, 14, 23, 0.65)';
        ctx.strokeStyle = receipt.isHovered ? receipt.color : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = receipt.isHovered ? 1.5 : 1;

        // Rounded box
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(cardX + r, cardY);
        ctx.lineTo(cardX + cardW - r, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
        ctx.lineTo(cardX + cardW, cardY + cardH - r);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
        ctx.lineTo(cardX + r, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
        ctx.lineTo(cardX, cardY + r);
        ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Card Header: File & Tag
        ctx.font = '9px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = '#64748B';
        ctx.fillText(receipt.file, cardX + 10, cardY + 16);

        ctx.fillStyle = receipt.color;
        ctx.textAlign = 'right';
        ctx.fillText(receipt.tag, cardX + cardW - 10, cardY + 16);
        ctx.textAlign = 'left';

        // Code Line
        ctx.font = '10px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = receipt.type === 'REFUSED' ? '#F87171' : '#F1F5F9';
        ctx.fillText(receipt.code, cardX + 10, cardY + 32);

        // Strikethrough for refused hollow signals
        if (receipt.type === 'REFUSED') {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cardX + 10, cardY + 29);
          ctx.lineTo(cardX + 175, cardY + 29);
          ctx.stroke();
        }

        // Subtext Detail
        ctx.font = '8.5px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.globalAlpha = 0.7;
        ctx.fillText(receipt.detail, cardX + 10, cardY + 46);
        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion, opacity]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
