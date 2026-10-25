import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * GitCommitGraphBackground
 * 
 * Replaces generic tech particle clouds with a purposeful, deterministic Git Commit DAG
 * & Merkle Ledger background. Features branching Git tracks (main, feature, security),
 * commit nodes with real short SHAs, cubic bezier merge arcs, and glowing verification
 * pulses that travel down rails to visually represent continuous code auditing.
 */
export const GitCommitGraphBackground = ({ className = 'fixed inset-0 pointer-events-none z-0' }) => {
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

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
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
      buildGraph();
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial canvas sizing
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Color definitions for Git branches
    const BRANCH_COLORS = {
      main: { stroke: 'rgba(16, 185, 129, 0.4)', glow: '#10B981', text: '#34D399', name: 'main // PROVEN' },
      ast: { stroke: 'rgba(56, 189, 248, 0.35)', glow: '#38BDF8', text: '#7DD3FC', name: 'feat/ast-callgraph' },
      security: { stroke: 'rgba(139, 92, 246, 0.35)', glow: '#8B5CF6', text: '#C4B5FD', name: 'sec/invariant-consensus' },
      audit: { stroke: 'rgba(245, 158, 11, 0.3)', glow: '#F59E0B', text: '#FCD34D', name: 'ci/test-reachability' },
    };

    // Commits data definition
    const COMMITS = [
      { sha: '7f83b16', branch: 'main', msg: 'param query cursor', tag: 'PROVEN', yPct: 0.16 },
      { sha: '3e91a0c', branch: 'ast', msg: 'ast call-tree visit', tag: 'SYNTAX MATCH', yPct: 0.24 },
      { sha: 'b4d8f21', branch: 'security', msg: 'assert sql reject', tag: 'INVARIANT', yPct: 0.36 },
      { sha: 'a182c4f', branch: 'main', msg: 'sqlite wal migrate', tag: 'ATTESTED', yPct: 0.48 },
      { sha: '9f3c2ab', branch: 'ast', msg: 'reachability check', tag: 'PASS 100%', yPct: 0.60 },
      { sha: 'd0dd1f6', branch: 'audit', msg: 'merkle root digest', tag: 'CRYPTOGRAPHIC', yPct: 0.72 },
      { sha: 'c0ffee1', branch: 'security', msg: 'zero-lock failover', tag: 'VERIFIED', yPct: 0.82 },
      { sha: 'e28a4c9', branch: 'main', msg: 'a4 physical seal', tag: 'IMMUTABLE', yPct: 0.92 },
    ];

    let rails = [];
    let nodes = [];
    let pulses = [];
    let mergeArcs = [];

    const buildGraph = () => {
      // Setup 4 distinct vertical Git rails framing the page
      // Far-left gutter (audit), Center gutter (main), Far-right gutters (security, ast)
      const xPositions = {
        audit: Math.max(35, width * 0.04),
        main: width * 0.49,
        security: Math.min(width - 130, width * 0.88),
        ast: Math.min(width - 35, width * 0.95),
      };

      rails = [
        { id: 'audit', x: xPositions.audit, branch: 'audit' },
        { id: 'main', x: xPositions.main, branch: 'main' },
        { id: 'security', x: xPositions.security, branch: 'security' },
        { id: 'ast', x: xPositions.ast, branch: 'ast' },
      ];

      // Build commit nodes with coordinates
      nodes = COMMITS.map((c) => {
        const rail = rails.find((r) => r.branch === c.branch) || rails[1];
        return {
          ...c,
          x: rail.x,
          y: height * c.yPct,
          radius: 4.5,
          pulseRing: 0,
          color: BRANCH_COLORS[c.branch],
        };
      });

      // Build merge arcs (branching out and merging back into main)
      mergeArcs = [
        // Arc 1: main branches into AST
        { fromX: xPositions.main, fromY: height * 0.18, toX: xPositions.ast, toY: height * 0.24, color: BRANCH_COLORS.ast },
        // Arc 2: AST merges back into main
        { fromX: xPositions.ast, fromY: height * 0.40, toX: xPositions.main, toY: height * 0.48, color: BRANCH_COLORS.ast },
        // Arc 3: main branches into Security
        { fromX: xPositions.main, fromY: height * 0.28, toX: xPositions.security, toY: height * 0.36, color: BRANCH_COLORS.security },
        // Arc 4: Security merges back into main
        { fromX: xPositions.security, fromY: height * 0.52, toX: xPositions.main, toY: height * 0.58, color: BRANCH_COLORS.security },
        // Arc 5: audit branch merges into main at the bottom
        { fromX: xPositions.audit, fromY: height * 0.74, toX: xPositions.main, toY: height * 0.86, color: BRANCH_COLORS.audit },
      ];

      // Verification Pulses traveling down rails
      pulses = [
        { railIdx: 1, y: 0, speed: 1.8, color: BRANCH_COLORS.main.glow, len: 45 },
        { railIdx: 1, y: height * 0.45, speed: 2.1, color: BRANCH_COLORS.main.glow, len: 55 },
        { railIdx: 3, y: height * 0.15, speed: 1.5, color: BRANCH_COLORS.ast.glow, len: 40 },
        { railIdx: 2, y: height * 0.28, speed: 1.7, color: BRANCH_COLORS.security.glow, len: 40 },
        { railIdx: 0, y: height * 0.60, speed: 1.4, color: BRANCH_COLORS.audit.glow, len: 35 },
      ];
    };

    buildGraph();

    let lastTime = performance.now();

    const render = (currentTime) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Parallax easing toward mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      const offsetX = (mouseX / width - 0.5) * 18;
      const offsetY = (mouseY / height - 0.5) * 12;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // 1. Draw subtle background CAD grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      const gridPitch = 80;
      for (let x = 0; x < width; x += gridPitch) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 2. Draw Branch Rails (Vertical Git Tracks)
      rails.forEach((rail) => {
        const col = BRANCH_COLORS[rail.branch];
        // Ambient soft track line
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = col.stroke;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(rail.x, 0);
        ctx.lineTo(rail.x, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Branch header label at top (safely below navbar)
        ctx.font = '10px "JetBrains Mono", Menlo, monospace';
        ctx.fillStyle = col.text;
        ctx.globalAlpha = 0.5;
        const isRight = rail.x > width * 0.5;
        ctx.textAlign = isRight ? 'right' : 'left';
        ctx.fillText(col.name, isRight ? rail.x - 8 : rail.x + 8, 92);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
      });

      // 3. Draw Merge Arcs (Smooth cubic bezier curves)
      mergeArcs.forEach((arc) => {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = arc.color.stroke;
        ctx.setLineDash([3, 3]);

        const midY = (arc.fromY + arc.toY) / 2;
        ctx.moveTo(arc.fromX, arc.fromY);
        ctx.bezierCurveTo(arc.fromX, midY, arc.toX, midY, arc.toX, arc.toY);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 4. Update & Render Verification Pulses
      pulses.forEach((pulse) => {
        const rail = rails[pulse.railIdx];
        if (!shouldReduceMotion) {
          pulse.y += pulse.speed;
          if (pulse.y > height + 60) {
            pulse.y = -40;
          }
        }

        // Check if pulse passes a node on this rail to trigger a ring ping
        nodes.forEach((node) => {
          if (node.x === rail.x && Math.abs(pulse.y - node.y) < 6 && node.pulseRing <= 0) {
            node.pulseRing = 1.0; // trigger ripple
          }
        });

        // Draw glowing light packet with gradient trail
        const grad = ctx.createLinearGradient(rail.x, pulse.y - pulse.len, rail.x, pulse.y);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.7, pulse.color + '44');
        grad.addColorStop(1, pulse.color);

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = grad;
        ctx.moveTo(rail.x, Math.max(0, pulse.y - pulse.len));
        ctx.lineTo(rail.x, pulse.y);
        ctx.stroke();

        // Bright leading particle head
        ctx.beginPath();
        ctx.arc(rail.x, pulse.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 5. Draw Commit Nodes & Cryptographic Labels
      nodes.forEach((node) => {
        // Node outer ring ripple if triggered
        if (node.pulseRing > 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (1 - node.pulseRing) * 22, 0, Math.PI * 2);
          ctx.strokeStyle = node.color.glow;
          ctx.globalAlpha = node.pulseRing * 0.7;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          if (!shouldReduceMotion) {
            node.pulseRing -= delta * 1.6;
            if (node.pulseRing < 0) node.pulseRing = 0;
          }
        }

        // Node circle background (dark obsidian center)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = '#08090B';
        ctx.fill();

        // Node glowing border ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.color.glow;
        ctx.shadowColor = node.color.glow;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Node center solid dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Monospace Commit Tag (e.g. "7f83b16 [PROVEN]")
        ctx.font = '10px "JetBrains Mono", Menlo, monospace';
        const tagText = `${node.sha}`;
        const subText = `${node.tag} · ${node.msg}`;

        // Commit label box styling
        const isLeftOriented = node.x > width * 0.5;
        const textX = isLeftOriented ? node.x - 12 : node.x + 12;
        ctx.textAlign = isLeftOriented ? 'right' : 'left';

        // SHA Pill
        ctx.fillStyle = node.color.text;
        ctx.globalAlpha = 0.65;
        ctx.fillText(tagText, textX, node.y - 2);

        // Verification metadata
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px "JetBrains Mono", Menlo, monospace';
        ctx.globalAlpha = 0.4;
        ctx.fillText(subText, textX, node.y + 11);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
      });

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
