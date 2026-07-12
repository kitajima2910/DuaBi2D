/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Trophy, 
  Settings, Zap, RefreshCw, Eye, Award, Clock, Skull, CirclePlay
} from "lucide-react";

// --- AUDIO MANAGER (Web Audio API) ---
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playBounce(volume = 0.05, pitch = 1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(400 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(120 * pitch, now + 0.08);
      
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // Audio context block
    }
  }

  playBumper() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        gain.gain.setValueAtTime(0.1, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
        
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } catch (e) {}
  }

  playEliminated() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.3);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playBeep(freq = 440, duration = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playTimeoutBuzz() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.6);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }
}

const sounds = new SoundManager();

// --- COUNTRY DATA & PROCEDURAL FLAG RENDERING ---
interface Country {
  code: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  drawFlag: (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void;
}

const countries: Country[] = [
  {
    code: "VN", name: "Việt Nam", primaryColor: "#da251d", secondaryColor: "#ffff00",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.fillStyle = "#da251d";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      // Draw Yellow Star
      ctx.fillStyle = "#ffff00";
      drawStar(ctx, cx, cy, 5, r * 0.55, r * 0.22);
    }
  },
  {
    code: "JP", name: "Nhật Bản", primaryColor: "#ffffff", secondaryColor: "#bc002d",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#bc002d";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2); ctx.fill();
    }
  },
  {
    code: "FR", name: "Pháp", primaryColor: "#00209f", secondaryColor: "#f64242",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const w = (r * 2) / 3;
      ctx.fillStyle = "#00209f"; ctx.fillRect(cx - r, cy - r, w, r * 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r + w, cy - r, w, r * 2);
      ctx.fillStyle = "#f64242"; ctx.fillRect(cx - r + w * 2, cy - r, w, r * 2);
      ctx.restore();
    }
  },
  {
    code: "DE", name: "Đức", primaryColor: "#000000", secondaryColor: "#ffcf00",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const h = (r * 2) / 3;
      ctx.fillStyle = "#000000"; ctx.fillRect(cx - r, cy - r, r * 2, h);
      ctx.fillStyle = "#dd0000"; ctx.fillRect(cx - r, cy - r + h, r * 2, h);
      ctx.fillStyle = "#ffcf00"; ctx.fillRect(cx - r, cy - r + h * 2, r * 2, h);
      ctx.restore();
    }
  },
  {
    code: "BR", name: "Brazil", primaryColor: "#009c3b", secondaryColor: "#ffdf00",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.fillStyle = "#009c3b";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffdf00";
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.7, cy);
      ctx.lineTo(cx, cy + r * 0.6);
      ctx.lineTo(cx - r * 0.7, cy);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#00218f";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2); ctx.fill();
    }
  },
  {
    code: "US", name: "Mỹ", primaryColor: "#0a254c", secondaryColor: "#b22234",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#b22234";
      const sh = (r * 2) / 13;
      for (let i = 0; i < 13; i += 2) {
        ctx.fillRect(cx - r, cy - r + i * sh, r * 2, sh);
      }
      ctx.fillStyle = "#3c3b6e";
      ctx.fillRect(cx - r, cy - r, r, r);
      ctx.fillStyle = "#ffffff";
      drawStar(ctx, cx - r * 0.5, cy - r * 0.5, 5, r * 0.15, r * 0.06);
      ctx.restore();
    }
  },
  {
    code: "GB", name: "Anh", primaryColor: "#012169", secondaryColor: "#c8102e",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#012169"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = r * 0.35;
      ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r); ctx.stroke();
      ctx.strokeStyle = "#c8102e"; ctx.lineWidth = r * 0.15;
      ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r, cy - r * 0.3, r * 2, r * 0.6); ctx.fillRect(cx - r * 0.3, cy - r, r * 0.6, r * 2);
      ctx.fillStyle = "#c8102e"; ctx.fillRect(cx - r, cy - r * 0.18, r * 2, r * 0.36); ctx.fillRect(cx - r * 0.18, cy - r, r * 0.36, r * 2);
      ctx.restore();
    }
  },
  {
    code: "KR", name: "Hàn Quốc", primaryColor: "#ffffff", secondaryColor: "#cd2e3a",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = "#cd2e3a";
      ctx.beginPath(); ctx.arc(0, 0, r * 0.45, Math.PI, 0, false); ctx.fill();
      ctx.fillStyle = "#0047a0";
      ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI, false); ctx.fill();
      ctx.fillStyle = "#cd2e3a";
      ctx.beginPath(); ctx.arc(-r * 0.225, 0, r * 0.225, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0047a0";
      ctx.beginPath(); ctx.arc(r * 0.225, 0, r * 0.225, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
  {
    code: "ES", name: "Tây Ban Nha", primaryColor: "#ad1519", secondaryColor: "#fabd00",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#ad1519"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#fabd00"; ctx.fillRect(cx - r, cy - r * 0.5, r * 2, r);
      ctx.fillStyle = "#ad1519";
      ctx.beginPath(); ctx.arc(cx - r * 0.3, cy, r * 0.18, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
  {
    code: "CA", name: "Canada", primaryColor: "#ff0000", secondaryColor: "#ffffff",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#ff0000"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r * 0.5, cy - r, r, r * 2);
      ctx.fillStyle = "#ff0000";
      drawStar(ctx, cx, cy, 11, r * 0.35, r * 0.18);
      ctx.restore();
    }
  },
  {
    code: "IT", name: "Ý", primaryColor: "#009246", secondaryColor: "#ce2b37",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const w = (r * 2) / 3;
      ctx.fillStyle = "#009246"; ctx.fillRect(cx - r, cy - r, w, r * 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r + w, cy - r, w, r * 2);
      ctx.fillStyle = "#ce2b37"; ctx.fillRect(cx - r + w * 2, cy - r, w, r * 2);
      ctx.restore();
    }
  },
  {
    code: "AR", name: "Argentina", primaryColor: "#74acdf", secondaryColor: "#f6b40e",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const h = (r * 2) / 3;
      ctx.fillStyle = "#74acdf"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r, cy - r + h, r * 2, h);
      ctx.fillStyle = "#f6b40e";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
  {
    code: "AU", name: "Úc", primaryColor: "#00003f", secondaryColor: "#ffffff",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#00003f"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#ffffff";
      drawStar(ctx, cx - r * 0.4, cy + r * 0.4, 7, r * 0.22, r * 0.09);
      drawStar(ctx, cx + r * 0.4, cy - r * 0.4, 7, r * 0.15, r * 0.06);
      drawStar(ctx, cx + r * 0.5, cy, 7, r * 0.12, r * 0.05);
      ctx.restore();
    }
  },
  {
    code: "IN", name: "Ấn Độ", primaryColor: "#ff9933", secondaryColor: "#138808",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const h = (r * 2) / 3;
      ctx.fillStyle = "#ff9933"; ctx.fillRect(cx - r, cy - r, r * 2, h);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r, cy - r + h, r * 2, h);
      ctx.fillStyle = "#138808"; ctx.fillRect(cx - r, cy - r + h * 2, r * 2, h);
      ctx.strokeStyle = "#000080"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  },
  {
    code: "MX", name: "Mexico", primaryColor: "#006847", secondaryColor: "#ce1126",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const w = (r * 2) / 3;
      ctx.fillStyle = "#006847"; ctx.fillRect(cx - r, cy - r, w, r * 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r + w, cy - r, w, r * 2);
      ctx.fillStyle = "#ce1126"; ctx.fillRect(cx - r + w * 2, cy - r, w, r * 2);
      ctx.fillStyle = "#8b5a2b";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
  {
    code: "SE", name: "Thụy Điển", primaryColor: "#006aa7", secondaryColor: "#fecc00",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#006aa7"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#fecc00";
      ctx.fillRect(cx - r, cy - r * 0.25, r * 2, r * 0.5);
      ctx.fillRect(cx - r * 0.4, cy - r, r * 0.5, r * 2);
      ctx.restore();
    }
  },
  {
    code: "CH", name: "Thụy Sĩ", primaryColor: "#d52b1e", secondaryColor: "#ffffff",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.fillStyle = "#d52b1e";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - r * 0.5, cy - r * 0.15, r, r * 0.3);
      ctx.fillRect(cx - r * 0.15, cy - r * 0.5, r * 0.3, r);
    }
  },
  {
    code: "BE", name: "Bỉ", primaryColor: "#000000", secondaryColor: "#ff0000",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const w = (r * 2) / 3;
      ctx.fillStyle = "#000000"; ctx.fillRect(cx - r, cy - r, w, r * 2);
      ctx.fillStyle = "#ffe300"; ctx.fillRect(cx - r + w, cy - r, w, r * 2);
      ctx.fillStyle = "#ff0000"; ctx.fillRect(cx - r + w * 2, cy - r, w, r * 2);
      ctx.restore();
    }
  },
  {
    code: "NL", name: "Hà Lan", primaryColor: "#ae1c28", secondaryColor: "#21468b",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      const h = (r * 2) / 3;
      ctx.fillStyle = "#ae1c28"; ctx.fillRect(cx - r, cy - r, r * 2, h);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - r, cy - r + h, r * 2, h);
      ctx.fillStyle = "#21468b"; ctx.fillRect(cx - r, cy - r + h * 2, r * 2, h);
      ctx.restore();
    }
  },
  {
    code: "ZA", name: "Nam Phi", primaryColor: "#007a3d", secondaryColor: "#ffb612",
    drawFlag: (ctx, cx, cy, r) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#e03c31"; ctx.fillRect(cx - r, cy - r, r * 2, r);
      ctx.fillStyle = "#007a3d"; ctx.fillRect(cx - r, cy, r * 2, r);
      ctx.fillStyle = "#002395"; ctx.fillRect(cx - r, cy + r * 0.2, r * 2, r * 0.8);
      ctx.fillStyle = "#000000";
      ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx, cy); ctx.lineTo(cx - r, cy + r); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
];

// Draw Star Helper
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

// --- PROCEDURAL FLAG COMPONENT ---
const CountryFlag = ({ country, size = 20 }: { country: Country; size?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, size, size);
    
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 0.5;
    
    // Draw the procedural flag using the country's vector drawing function
    country.drawFlag(ctx, cx, cy, r);
  }, [country, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="rounded-full shadow-md border border-slate-700/50 shrink-0"
      style={{ width: `${size}px`, height: `${size}px`, display: "block" }}
    />
  );
};

// --- WAVING FLAG WITH POLE COMPONENT ---
const WavingFlagWithPole = ({ country, size = 28, delay = "0s" }: { country: Country; size?: number; delay?: string }) => {
  return (
    <div className="relative flex flex-col items-center" style={{ height: "65px", width: "80px" }}>
      {/* Flagpole (Cột cờ bạc ánh kim) */}
      <div className="absolute bottom-0 left-1 w-[3px] h-[65px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full shadow z-10">
        {/* Flagpole top finial (Chóp cột cờ mạ vàng) */}
        <div className="absolute -top-[5px] -left-[2.5px] w-[8px] h-[8px] bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow border border-amber-600/30" />
      </div>

      {/* Flag cloth (Lá cờ bay phấp phới) */}
      <div 
        className="absolute left-[7px] top-[4px] origin-left z-20"
        style={{
          animation: "flag-wave 2s ease-in-out infinite",
          animationDelay: delay,
          perspective: "800px",
          transformStyle: "preserve-3d"
        }}
      >
        <div className="relative flex items-center shadow-lg rounded-r bg-slate-900/90 border border-slate-700/30 p-0.5 pr-1.5 pl-1 gap-1">
          <CountryFlag country={country} size={size} />
          {/* Quốc gia code */}
          <span className="text-[9px] font-black tracking-wider text-white select-none">
            {country.code}
          </span>

          {/* Realistic 3D shading wave overlays */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50 rounded-r"
            style={{
              background: "linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.35) 25%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.4) 75%, rgba(255,255,255,0.3) 100%)",
              backgroundSize: "200% 100%",
              animation: "flag-shading 2s linear infinite",
              animationDelay: delay,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// --- CORE GAME INTERFACES ---
interface MarbleState {
  id: string;
  country: Country;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  // Attributes (balanced, normalized 0.5 - 1.0)
  mass: number;
  bounce: number;
  friction: number;
  luck: number;
  grip: number;
  // Stat trackers
  trail: { x: number; y: number }[];
  eliminated: boolean;
  finished: boolean;
  finishTime?: number;
  rank?: number;
  checkpointProgress: number; // 0 to 1
  shakeIntensity: number;
  loopCount?: number;
  lastBounceX?: number;
  lastBounceY?: number;
  stuckTimer?: number;
  lastPositionX?: number;
  lastPositionY?: number;
  isSuperBouncing?: number;
  preVx?: number;
  preVy?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number; // 0 to 1
  maxLife: number;
}

type ObstacleType = 
  | "funnel" 
  | "pegs" 
  | "spinning_wheels" 
  | "pendulums" 
  | "bumpers" 
  | "jump_pads" 
  | "moving_platforms" 
  | "split_paths" 
  | "rotating_gates" 
  | "gravity_drops"
  | "elevators";

interface Obstacle {
  type: ObstacleType;
  y: number;
  h: number;
  update?: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  checkCollision: (marble: MarbleState) => void;
}

type GameMode = "quick" | "tournament" | "survival" | "time_trial" | "world_cup";
type GameStateStatus = "idle" | "countdown" | "racing" | "paused" | "finished";

// Preset seeds
const SEEDS = ["Gold", "Victory", "Olympics", "FastTrack", "Infinity", "Chaos"];

export default function App() {
  const [mode, setMode] = useState<GameMode>("tournament");
  const [status, setStatus] = useState<GameStateStatus>("idle");
  const [numMarbles, setNumMarbles] = useState<number>(countries.length);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mapSeed, setMapSeed] = useState<string>("Victory");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [scores, setScores] = useState<{ [countryCode: string]: number }>({});
  const [fps, setFps] = useState<number>(60);

  // --- WORLD CUP COOLDOWN / TIMEOUT STATES ---
  const [countdownVal, setCountdownVal] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const lastSecondsRef = useRef<number>(120);

  // --- WORLD CUP 2026 STATES ---
  const [worldCupStage, setWorldCupStage] = useState<"idle" | "groups" | "quarterfinals" | "semifinals" | "finals" | "finished">("idle");
  const [worldCupMatchIndex, setWorldCupMatchIndex] = useState<number>(0); 
  const [worldCupGroups, setWorldCupGroups] = useState<{ [key: string]: Country[] }>({
    "A": [], "B": [], "C": [], "D": []
  });
  const [worldCupGroupRankings, setWorldCupGroupRankings] = useState<{ [key: string]: Country[] }>({});
  const [worldCupQuarterTeams, setWorldCupQuarterTeams] = useState<Country[]>([]); 
  const [worldCupSemiTeams, setWorldCupSemiTeams] = useState<Country[]>([]); 
  const [worldCupFinalTeams, setWorldCupFinalTeams] = useState<Country[]>([]); 
  const [worldCupWinner, setWorldCupWinner] = useState<Country | null>(null);
  const [worldCupPodium, setWorldCupPodium] = useState<Country[]>([]);

  // Active Leaderboard for top HUD
  const [leaderboard, setLeaderboard] = useState<{ country: Country; time?: number; progress: number; finished: boolean; rank?: number }[]>([]);

  // Simulation ref/states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const framesSinceLastUpdateRef = useRef<number>(0);
  const elapsedRaceTimeRef = useRef<number>(0);

  // High performance references for physics loop
  const marblesRef = useRef<MarbleState[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraYRef = useRef<number>(0);
  const cameraShakeRef = useRef<number>(0);
  const confettiRef = useRef<Particle[]>([]);

  // Track Dimensions
  const trackWidth = 540;
  const trackHeight = 10800;

  // Synchronized refs to avoid stale closures in the physics loop
  const statusRef = useRef<GameStateStatus>("idle");
  const modeRef = useRef<GameMode>("tournament");
  const speedMultiplierRef = useRef<number>(1);
  const scoresRef = useRef<{ [countryCode: string]: number }>({});

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Handle initialization of game or reset when seed or mode changes
  useEffect(() => {
    if (mode === "world_cup") {
      if (worldCupStage === "idle") {
        initWorldCup();
      } else {
        resetGame();
      }
    } else {
      resetGame();
    }
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [mode, mapSeed, numMarbles]);

  // --- DRAG TO SCROLL FOR MOUSE & TOUCH CONTROLS ---
  const handleDragScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (!element) return;

    const startY = e.clientY;
    const scrollTop = element.scrollTop;
    let isDragging = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      if (Math.abs(deltaY) > 2) {
        isDragging = true;
        element.scrollTop = scrollTop - deltaY;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (isDragging) {
        const preventClick = (clickEvent: MouseEvent) => {
          clickEvent.stopImmediatePropagation();
          clickEvent.preventDefault();
        };
        element.addEventListener("click", preventClick, { capture: true, once: true });
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Generate stable custom physics values based on Country luck/mass
  const initMarbles = () => {
    const pool = [...countries];
    const result: MarbleState[] = [];
    const count = Math.min(numMarbles, pool.length);
    
    // Seeded Random Helper
    const rng = seedRandom(mapSeed);

    for (let i = 0; i < count; i++) {
      // Pick random country from pool
      const countryIndex = Math.floor(rng() * pool.length);
      const country = pool.splice(countryIndex, 1)[0];

      // Procedural slight randomization but highly balanced
      const luck = 0.5 + rng() * 0.5;
      const mass = 0.7 + rng() * 0.6; // heavy balls roll faster downwards, light bounce higher
      const bounce = 0.45 + rng() * 0.25;
      const friction = 0.98 + rng() * 0.012; // lower is slippery, higher grips
      const grip = 0.5 + rng() * 0.5;

      result.push({
        id: country.code,
        country,
        x: trackWidth / 2 - (count * 12) / 2 + i * 12 + (rng() - 0.5) * 8,
        y: 80 + (i % 5) * 16,
        vx: (rng() - 0.5) * 2,
        vy: 0,
        radius: 10,
        angle: rng() * Math.PI * 2,
        mass,
        bounce,
        friction,
        luck,
        grip,
        trail: [],
        eliminated: false,
        finished: false,
        checkpointProgress: 0,
        shakeIntensity: 0
      });
    }
    marblesRef.current = result;
  };

  // Seeded Random Generator
  function seedRandom(seedStr: string) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  // --- PROCEDURAL GENERATOR ---
  const generateTrack = () => {
    const rng = seedRandom(mapSeed);
    const obstacles: Obstacle[] = [];
    
    // Static Start Area Gates
    obstacles.push({
      type: "gravity_drops",
      y: 180,
      h: 80,
      draw: (ctx) => {
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Starter gate pin
        ctx.moveTo(trackWidth / 2 - 100, 210);
        ctx.lineTo(trackWidth / 2 - 40, 240);
        ctx.moveTo(trackWidth / 2 + 100, 210);
        ctx.lineTo(trackWidth / 2 + 40, 240);
        ctx.stroke();
      },
      checkCollision: (m) => {
        // Handled by default boundary and gravity
      }
    });

    const segmentHeight = 320;
    const numSegments = 29; // Total height ~10000px
    const poolOfObstacles: ObstacleType[] = [
      "funnel", "pegs", "spinning_wheels", "pendulums", "bumpers", 
      "jump_pads", "moving_platforms", "split_paths", "rotating_gates", "elevators"
    ];

    // Build segments
    for (let i = 0; i < numSegments; i++) {
      const segY = 280 + i * segmentHeight;
      // Choose obstacle randomly based on seed
      const typeIndex = Math.floor(rng() * poolOfObstacles.length);
      const type = poolOfObstacles[typeIndex];

      switch(type) {
        case "funnel":
          obstacles.push(createFunnel(segY, rng));
          break;
        case "pegs":
          obstacles.push(createPegs(segY, rng));
          break;
        case "spinning_wheels":
          obstacles.push(createSpinningWheels(segY, rng));
          break;
        case "pendulums":
          obstacles.push(createPendulums(segY, rng));
          break;
        case "bumpers":
          obstacles.push(createBumpers(segY, rng));
          break;
        case "jump_pads":
          obstacles.push(createJumpPads(segY, rng));
          break;
        case "moving_platforms":
          obstacles.push(createMovingPlatforms(segY, rng));
          break;
        case "split_paths":
          obstacles.push(createSplitPaths(segY, rng));
          break;
        case "rotating_gates":
          obstacles.push(createRotatingGates(segY, rng));
          break;
        case "elevators":
          obstacles.push(createElevators(segY, rng));
          break;
        default:
          obstacles.push(createPegs(segY, rng));
      }
    }

    // Finish Funnel at the end
    obstacles.push({
      type: "funnel",
      y: trackHeight - 400,
      h: 200,
      draw: (ctx) => {
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(0, trackHeight - 400);
        ctx.lineTo(trackWidth / 2 - 40, trackHeight - 250);
        ctx.lineTo(trackWidth / 2 - 40, trackHeight - 200);
        ctx.lineTo(0, trackHeight - 200);
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(trackWidth, trackHeight - 400);
        ctx.lineTo(trackWidth / 2 + 40, trackHeight - 250);
        ctx.lineTo(trackWidth / 2 + 40, trackHeight - 200);
        ctx.lineTo(trackWidth, trackHeight - 200);
        ctx.closePath(); ctx.fill();
      },
      checkCollision: (m) => {
        const topY = trackHeight - 400;
        const botY = trackHeight - 250;
        const midX = trackWidth / 2;
        
        if (m.y >= topY && m.y <= botY) {
          // Left funnel wall
          // Line equation from (0, topY) to (midX - 40, botY)
          const leftLineX = (m.y - topY) * ((midX - 40) / (botY - topY));
          if (m.x - m.radius < leftLineX) {
            m.x = leftLineX + m.radius;
            m.vx = Math.abs(m.vx) * m.bounce * 0.8 + 0.5;
            sounds.playBounce(0.01);
          }
          // Right funnel wall
          const rightLineX = trackWidth - (m.y - topY) * ((midX - 40) / (botY - topY));
          if (m.x + m.radius > rightLineX) {
            m.x = rightLineX - m.radius;
            m.vx = -Math.abs(m.vx) * m.bounce * 0.8 - 0.5;
            sounds.playBounce(0.01);
          }
        } else if (m.y > botY && m.y < trackHeight - 200) {
          if (m.x - m.radius < midX - 40) {
            m.x = midX - 40 + m.radius;
            m.vx = Math.abs(m.vx) * m.bounce;
          }
          if (m.x + m.radius > midX + 40) {
            m.x = midX + 40 - m.radius;
            m.vx = -Math.abs(m.vx) * m.bounce;
          }
        }
      }
    });

    obstaclesRef.current = obstacles;
  };

  // --- OBSTACLE CONSTRUCTORS ---
  const createFunnel = (segY: number, rng: () => number): Obstacle => {
    const leftSlope = 0.3 + rng() * 0.3; // Angle slope
    const rightSlope = 0.3 + rng() * 0.3;
    const funnelOpening = 70 + rng() * 40;
    const centerOffset = (rng() - 0.5) * 60; // Slightly off-center funnels for chaos
    const midX = trackWidth / 2 + centerOffset;

    return {
      type: "funnel",
      y: segY,
      h: 220,
      draw: (ctx) => {
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;

        // Draw Left Funnel block
        ctx.beginPath();
        ctx.moveTo(0, segY);
        ctx.lineTo(midX - funnelOpening / 2, segY + 120);
        ctx.lineTo(midX - funnelOpening / 2, segY + 180);
        ctx.lineTo(0, segY + 220);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Draw Right Funnel block
        ctx.beginPath();
        ctx.moveTo(trackWidth, segY);
        ctx.lineTo(midX + funnelOpening / 2, segY + 120);
        ctx.lineTo(midX + funnelOpening / 2, segY + 180);
        ctx.lineTo(trackWidth, segY + 220);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      },
      checkCollision: (m) => {
        const topY = segY;
        const funnelEnd = segY + 120;
        const openingY = segY + 180;
        
        if (m.y >= topY && m.y <= funnelEnd) {
          const ratio = (m.y - topY) / 120;
          const leftWall = ratio * (midX - funnelOpening / 2);
          const rightWall = trackWidth - ratio * (trackWidth - (midX + funnelOpening / 2));
          
          if (m.x - m.radius < leftWall) {
            m.x = leftWall + m.radius;
            m.vx = Math.abs(m.vx) * m.bounce + 0.3;
            m.vy += 0.2;
            sounds.playBounce(0.01);
          }
          if (m.x + m.radius > rightWall) {
            m.x = rightWall - m.radius;
            m.vx = -Math.abs(m.vx) * m.bounce - 0.3;
            m.vy += 0.2;
            sounds.playBounce(0.01);
          }
        } else if (m.y > funnelEnd && m.y < openingY) {
          // Narrow tube
          const leftWall = midX - funnelOpening / 2;
          const rightWall = midX + funnelOpening / 2;
          if (m.x - m.radius < leftWall) {
            m.x = leftWall + m.radius;
            m.vx = Math.abs(m.vx) * m.bounce;
          }
          if (m.x + m.radius > rightWall) {
            m.x = rightWall - m.radius;
            m.vx = -Math.abs(m.vx) * m.bounce;
          }
        }
      }
    };
  };

  const createPegs = (segY: number, rng: () => number): Obstacle => {
    const pegList: { x: number; y: number; r: number }[] = [];
    const rows = 4;
    const cols = 7;
    for (let r = 0; r < rows; r++) {
      const isOdd = r % 2 !== 0;
      const count = isOdd ? cols - 1 : cols;
      const spacingX = trackWidth / (cols + 1);
      const startX = isOdd ? spacingX * 1.5 : spacingX;
      for (let c = 0; c < count; c++) {
        pegList.push({
          x: startX + c * spacingX + (rng() - 0.5) * 10,
          y: segY + 40 + r * 50 + (rng() - 0.5) * 8,
          r: 5 + rng() * 3
        });
      }
    }

    return {
      type: "pegs",
      y: segY,
      h: 240,
      draw: (ctx) => {
        ctx.fillStyle = "#cbd5e1";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 4;
        pegList.forEach(peg => {
          ctx.beginPath();
          ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      },
      checkCollision: (m) => {
        pegList.forEach(p => {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = m.radius + p.r;
          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            m.x = p.x + Math.cos(angle) * minDist;
            m.y = p.y + Math.sin(angle) * minDist;
            
            // Standard circle-circle reflection
            const nx = Math.cos(angle);
            const ny = Math.sin(angle);
            const k = m.vx * nx + m.vy * ny;
            m.vx = (m.vx - 2 * k * nx) * m.bounce;
            m.vy = (m.vy - 2 * k * ny) * m.bounce;
            
            sounds.playBounce(0.04, 1.2);
            spawnParticles(p.x, p.y, "#94a3b8", 3);
          }
        });
      }
    };
  };

  const createSpinningWheels = (segY: number, rng: () => number): Obstacle => {
    const wheels: { x: number; y: number; r: number; speed: number; angle: number; blades: number }[] = [
      { x: trackWidth * 0.25, y: segY + 110, r: 50, speed: (0.02 + rng() * 0.03) * (rng() > 0.5 ? 1 : -1), angle: rng() * Math.PI, blades: 5 },
      { x: trackWidth * 0.75, y: segY + 110, r: 50, speed: (0.02 + rng() * 0.03) * (rng() > 0.5 ? 1 : -1), angle: rng() * Math.PI, blades: 5 }
    ];

    return {
      type: "spinning_wheels",
      y: segY,
      h: 220,
      update: (dt) => {
        wheels.forEach(w => {
          w.angle += w.speed * dt;
        });
      },
      draw: (ctx) => {
        wheels.forEach(w => {
          ctx.save();
          ctx.translate(w.x, w.y);
          ctx.rotate(w.angle);

          // Outer ring
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, w.r, 0, Math.PI * 2);
          ctx.stroke();

          // Blades
          ctx.fillStyle = "#fb7185";
          for (let i = 0; i < w.blades; i++) {
            ctx.rotate((Math.PI * 2) / w.blades);
            ctx.fillRect(-4, 0, 8, w.r);
            ctx.beginPath();
            ctx.arc(0, w.r - 2, 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Center pin
          ctx.fillStyle = "#e11d48";
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      },
      checkCollision: (m) => {
        wheels.forEach(w => {
          const dx = m.x - w.x;
          const dy = m.y - w.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Collision with the blade spikes
          if (dist < w.r + m.radius) {
            // Check approximate angular hit
            const angleToMarble = Math.atan2(dy, dx);
            let relAngle = (angleToMarble - w.angle) % (Math.PI * 2);
            if (relAngle < 0) relAngle += Math.PI * 2;
            
            const step = (Math.PI * 2) / w.blades;
            for (let i = 0; i < w.blades; i++) {
              const bladeAngle = i * step;
              let diff = Math.abs(relAngle - bladeAngle);
              if (diff > Math.PI) diff = Math.PI * 2 - diff;
              
              if (diff < 0.22) { // hits a blade
                const hitX = w.x + Math.cos(angleToMarble) * w.r;
                const hitY = w.y + Math.sin(angleToMarble) * w.r;
                
                const pushAngle = angleToMarble;
                m.x = w.x + Math.cos(pushAngle) * (w.r + m.radius);
                m.y = w.y + Math.sin(pushAngle) * (w.r + m.radius);
                
                // Spin momentum adds tangent speed
                const tanX = -Math.sin(pushAngle);
                const tanY = Math.cos(pushAngle);
                const rotVel = w.speed * w.r * 12;

                m.vx = Math.cos(pushAngle) * 5 + tanX * rotVel;
                m.vy = Math.sin(pushAngle) * 5 + tanY * rotVel;
                
                sounds.playBounce(0.08, 0.9);
                spawnParticles(hitX, hitY, "#fb7185", 4);
              }
            }
          }
        });
      }
    };
  };

  const createPendulums = (segY: number, rng: () => number): Obstacle => {
    const pendulums = [
      { x: trackWidth * 0.33, length: 110, angle: 0, maxAngle: 0.7, t: rng() * 10, speed: 0.05, r: 20 },
      { x: trackWidth * 0.67, length: 110, angle: 0, maxAngle: -0.7, t: rng() * 10, speed: 0.05, r: 20 }
    ];

    return {
      type: "pendulums",
      y: segY,
      h: 220,
      update: (dt) => {
        pendulums.forEach(p => {
          p.t += p.speed * dt;
          p.angle = Math.sin(p.t) * p.maxAngle;
        });
      },
      draw: (ctx) => {
        pendulums.forEach(p => {
          const bobX = p.x + Math.sin(p.angle) * p.length;
          const bobY = segY + Math.cos(p.angle) * p.length;

          // Wire
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, segY);
          ctx.lineTo(bobX, bobY);
          ctx.stroke();

          // Anchor
          ctx.fillStyle = "#475569";
          ctx.beginPath();
          ctx.arc(p.x, segY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Bob (heavy heavy metal)
          ctx.fillStyle = "#8b5cf6";
          ctx.beginPath();
          ctx.arc(bobX, bobY, p.r, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = "#a78bfa";
          ctx.beginPath();
          ctx.arc(bobX - 4, bobY - 4, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      },
      checkCollision: (m) => {
        pendulums.forEach(p => {
          const bobX = p.x + Math.sin(p.angle) * p.length;
          const bobY = segY + Math.cos(p.angle) * p.length;

          const dx = m.x - bobX;
          const dy = m.y - bobY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = m.radius + p.r;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            m.x = bobX + Math.cos(angle) * minDist;
            m.y = bobY + Math.sin(angle) * minDist;

            // Pendulum is heavy so it acts as moving wall
            // Dynamic push velocity
            const pVx = Math.cos(p.angle) * p.speed * p.length * 10;
            const pVy = -Math.sin(p.angle) * p.speed * p.length * 10;

            const nx = Math.cos(angle);
            const ny = Math.sin(angle);
            // Reflect marble vx/vy with respect to pendulum speed
            const rVx = m.vx - pVx;
            const rVy = m.vy - pVy;
            const k = rVx * nx + rVy * ny;
            
            m.vx = (rVx - 2 * k * nx) * m.bounce + pVx * 1.2;
            m.vy = (rVy - 2 * k * ny) * m.bounce + pVy * 1.2;

            sounds.playBounce(0.08, 0.8);
            spawnParticles(m.x, m.y, "#a78bfa", 5);
          }
        });
      }
    };
  };

  const createBumpers = (segY: number, rng: () => number): Obstacle => {
    const bumperList = [
      { x: trackWidth * 0.2, y: segY + 60, r: 24, force: 14, active: 0 },
      { x: trackWidth * 0.5, y: segY + 120, r: 28, force: 16, active: 0 },
      { x: trackWidth * 0.8, y: segY + 60, r: 24, force: 14, active: 0 },
      { x: trackWidth * 0.35, y: segY + 180, r: 22, force: 13, active: 0 },
      { x: trackWidth * 0.65, y: segY + 180, r: 22, force: 13, active: 0 }
    ];

    return {
      type: "bumpers",
      y: segY,
      h: 240,
      update: (dt) => {
        bumperList.forEach(b => {
          if (b.active > 0) b.active -= 0.1 * dt;
        });
      },
      draw: (ctx) => {
        bumperList.forEach(b => {
          ctx.save();
          // Active lighting
          const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r);
          if (b.active > 0) {
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(0.5, "#ec4899");
            grad.addColorStop(1, "#f43f5e");
            ctx.shadowColor = "#f43f5e";
            ctx.shadowBlur = 15;
          } else {
            grad.addColorStop(0, "#fbcfe8");
            grad.addColorStop(0.6, "#db2777");
            grad.addColorStop(1, "#9d174d");
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + (b.active > 0 ? 4 : 0), 0, Math.PI * 2);
          ctx.fill();

          // Stroke ring
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r - 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
      },
      checkCollision: (m) => {
        bumperList.forEach(b => {
          const dx = m.x - b.x;
          const dy = m.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = m.radius + b.r;
          
          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            m.x = b.x + Math.cos(angle) * minDist;
            m.y = b.y + Math.sin(angle) * minDist;

            // Insane repelling bumper force!
            m.vx = Math.cos(angle) * b.force * m.bounce;
            m.vy = Math.sin(angle) * b.force * m.bounce;
            
            b.active = 1.0;
            cameraShakeRef.current = 6;
            sounds.playBumper();
            spawnParticles(m.x, m.y, "#f43f5e", 10);
          }
        });
      }
    };
  };

  const createJumpPads = (segY: number, rng: () => number): Obstacle => {
    const pads = [
      { x: trackWidth * 0.15, y: segY + 160, w: 70, h: 12, force: -12, active: 0 },
      { x: trackWidth * 0.5, y: segY + 100, w: 90, h: 12, force: -14, active: 0 },
      { x: trackWidth * 0.85, y: segY + 160, w: 70, h: 12, force: -12, active: 0 }
    ];

    return {
      type: "jump_pads",
      y: segY,
      h: 220,
      update: (dt) => {
        pads.forEach(p => {
          if (p.active > 0) p.active -= 0.15 * dt;
        });
      },
      draw: (ctx) => {
        pads.forEach(p => {
          ctx.save();
          // Pad support base
          ctx.fillStyle = "#334155";
          ctx.fillRect(p.x - p.w / 2 - 4, p.y + 4, p.w + 8, 8);

          // Springy visual
          ctx.fillStyle = p.active > 0 ? "#22c55e" : "#10b981";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.fillRect(p.x - p.w / 2, p.y - (p.active > 0 ? 0 : 4), p.w, p.h);
          ctx.strokeRect(p.x - p.w / 2, p.y - (p.active > 0 ? 0 : 4), p.w, p.h);
          ctx.restore();
        });
      },
      checkCollision: (m) => {
        pads.forEach(p => {
          const px = p.x - p.w / 2;
          const py = p.y - 4;
          if (m.x >= px && m.x <= px + p.w && m.y + m.radius >= py && m.y - m.radius <= py + p.h) {
            // Must hit from above or near top
            if (m.vy > 0) {
              m.y = py - m.radius;
              m.vy = p.force * m.bounce;
              p.active = 1.0;
              sounds.playBounce(0.12, 1.4);
              spawnParticles(m.x, m.y + m.radius, "#10b981", 6);
            }
          }
        });
      }
    };
  };

  const createMovingPlatforms = (segY: number, rng: () => number): Obstacle => {
    const platforms = [
      { x: trackWidth / 2, y: segY + 70, w: 140, h: 16, vx: 2, range: 160, startX: trackWidth / 2 },
      { x: trackWidth / 4, y: segY + 160, w: 120, h: 16, vx: -2.5, range: 100, startX: trackWidth / 4 }
    ];

    return {
      type: "moving_platforms",
      y: segY,
      h: 240,
      update: (dt) => {
        platforms.forEach(p => {
          p.x += p.vx * dt;
          if (Math.abs(p.x - p.startX) > p.range) {
            p.vx *= -1;
          }
        });
      },
      draw: (ctx) => {
        platforms.forEach(p => {
          ctx.fillStyle = "#e2e8f0";
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 3;
          ctx.fillRect(p.x - p.w / 2, p.y, p.w, p.h);
          ctx.strokeRect(p.x - p.w / 2, p.y, p.w, p.h);

          // Track guide line
          ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p.startX - p.range, p.y + p.h / 2);
          ctx.lineTo(p.startX + p.range, p.y + p.h / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      },
      checkCollision: (m) => {
        platforms.forEach(p => {
          const px = p.x - p.w / 2;
          const py = p.y;
          if (m.x >= px - m.radius && m.x <= px + p.w + m.radius && m.y + m.radius >= py && m.y - m.radius <= py + p.h) {
            // Top/Bottom bounce
            if (m.y < py + p.h / 2) {
              m.y = py - m.radius;
              m.vy = -Math.abs(m.vy) * m.bounce;
              m.vx += p.vx * 0.3; // Carry momentum
            } else {
              m.y = py + p.h + m.radius;
              m.vy = Math.abs(m.vy) * m.bounce;
            }
            sounds.playBounce(0.02);
          }
        });
      }
    };
  };

  const createSplitPaths = (segY: number, rng: () => number): Obstacle => {
    const centerBlock = { x: trackWidth / 2, y: segY + 100, w: 100, h: 40 };

    return {
      type: "split_paths",
      y: segY,
      h: 220,
      draw: (ctx) => {
        // Triangular obstacle in center splitting flow left/right
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerBlock.x, centerBlock.y);
        ctx.lineTo(centerBlock.x + centerBlock.w, centerBlock.y + centerBlock.h);
        ctx.lineTo(centerBlock.x - centerBlock.w, centerBlock.y + centerBlock.h);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      },
      checkCollision: (m) => {
        // Simple triangle boundary collision
        const ty1 = centerBlock.y;
        const ty2 = centerBlock.y + centerBlock.h;
        const tx1 = centerBlock.x;
        const txLeft = centerBlock.x - centerBlock.w;
        const txRight = centerBlock.x + centerBlock.w;

        if (m.y >= ty1 && m.y <= ty2) {
          const ratio = (m.y - ty1) / centerBlock.h;
          const leftBound = tx1 - ratio * centerBlock.w;
          const rightBound = tx1 + ratio * centerBlock.w;

          if (m.x > leftBound && m.x < rightBound) {
            // Push left or right depending on which side it is closer to
            if (m.x < tx1) {
              m.x = leftBound - m.radius;
              m.vx = -Math.abs(m.vx) * m.bounce - 1;
            } else {
              m.x = rightBound + m.radius;
              m.vx = Math.abs(m.vx) * m.bounce + 1;
            }
            sounds.playBounce(0.01);
          }
        }
      }
    };
  };

  const createRotatingGates = (segY: number, rng: () => number): Obstacle => {
    const gates = [
      { x: trackWidth * 0.33, y: segY + 110, length: 65, angle: rng() * Math.PI, av: 0 },
      { x: trackWidth * 0.67, y: segY + 110, length: 65, angle: rng() * Math.PI, av: 0 }
    ];

    return {
      type: "rotating_gates",
      y: segY,
      h: 220,
      update: (dt) => {
        gates.forEach(g => {
          // Add friction to rotation
          g.angle += g.av * dt;
          g.av *= Math.pow(0.96, dt);
        });
      },
      draw: (ctx) => {
        gates.forEach(g => {
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.rotate(g.angle);

          // Bar
          ctx.fillStyle = "#e2e8f0";
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 4;
          ctx.fillRect(-g.length, -4, g.length * 2, 8);
          ctx.strokeRect(-g.length, -4, g.length * 2, 8);

          // Center hinge
          ctx.fillStyle = "#059669";
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      },
      checkCollision: (m) => {
        gates.forEach(g => {
          const dx = m.x - g.x;
          const dy = m.y - g.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < g.length + m.radius) {
            // Calculate relative angle to see if it crosses the bar
            const marbleAng = Math.atan2(dy, dx);
            let diff = (marbleAng - g.angle) % Math.PI;
            if (diff > Math.PI / 2) diff -= Math.PI;
            if (diff < -Math.PI / 2) diff += Math.PI;

            if (Math.abs(diff) < 0.2) { // Hit
              // Reflect and apply angular velocity
              const normalX = -Math.sin(g.angle);
              const normalY = Math.cos(g.angle);
              
              // Move out of collision
              const sign = diff > 0 ? 1 : -1;
              m.x += normalX * sign * 4;
              m.y += normalY * sign * 4;

              const relVel = m.vx * normalX + m.vy * normalY;
              m.vx -= 2 * relVel * normalX * m.bounce;
              m.vy -= 2 * relVel * normalY * m.bounce;

              // Spin the gate!
              const torque = relVel * (dist / g.length) * 0.04;
              g.av += torque;

              sounds.playBounce(0.02, 1.1);
            }
          }
        });
      }
    };
  };

  const createElevators = (segY: number, rng: () => number): Obstacle => {
    // Air flow / zero-gravity fields lifting marbles up for chaotic drops
    const liftField = { x: trackWidth / 2 - 70, y: segY + 40, w: 140, h: 140, liftForce: -0.42 };

    return {
      type: "elevators",
      y: segY,
      h: 220,
      draw: (ctx) => {
        ctx.save();
        // Drawing an glowing elevator portal tube
        const grad = ctx.createLinearGradient(0, liftField.y, 0, liftField.y + liftField.h);
        grad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
        ctx.fillStyle = grad;
        ctx.fillRect(liftField.x, liftField.y, liftField.w, liftField.h);

        // Arrows rising up
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        const timeOffset = (Date.now() / 200) % 30;
        for (let i = 0; i < 4; i++) {
          const arrowY = liftField.y + liftField.h - i * 40 - timeOffset;
          if (arrowY > liftField.y && arrowY < liftField.y + liftField.h) {
            ctx.beginPath();
            ctx.moveTo(liftField.x + 40, arrowY + 10);
            ctx.lineTo(liftField.x + liftField.w / 2, arrowY);
            ctx.lineTo(liftField.x + liftField.w - 40, arrowY + 10);
            ctx.stroke();
          }
        }
        ctx.restore();
      },
      checkCollision: (m) => {
        if (m.x >= liftField.x && m.x <= liftField.x + liftField.w && m.y >= liftField.y && m.y <= liftField.y + liftField.h) {
          m.vy += liftField.liftForce; // Strong vertical lift anti-gravity!
          m.vx += (Math.sin(m.y * 0.1) * 0.1);
        }
      }
    };
  };

  // Particle Emitter
  const spawnParticles = (x: number, y: number, color: string, count = 5) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 2 + Math.random() * 3,
        life: 1.0,
        maxLife: 15 + Math.random() * 20
      });
    }
  };

  const spawnConfetti = () => {
    for (let i = 0; i < 80; i++) {
      const colors = ["#f43f5e", "#10b981", "#3b82f6", "#eab308", "#a855f7", "#f97316"];
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      confettiRef.current.push({
        x: Math.random() * trackWidth,
        y: trackHeight - 100 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 6,
        color: randColor,
        radius: 3 + Math.random() * 4,
        life: 1.0,
        maxLife: 100 + Math.random() * 50
      });
    }
  };

  // --- MAIN PHYSICS & SIMULATION LOOP ---
  const updatePhysics = (dt: number) => {
    const marbles = marblesRef.current;
    const obstacles = obstaclesRef.current;
    const gravity = 0.065; // vertical acceleration (lowered from 0.10 for slower, smoother descent)

    // Cap dt to prevent massive jumps when tab loses focus
    const actualDt = Math.min(dt, 2.0) * speedMultiplierRef.current;

    // Accumulate actual simulated time elapsed (1.0 dt = 16.666ms)
    elapsedRaceTimeRef.current += actualDt * 16.666;

    // 1. Update Dynamic Obstacles
    obstacles.forEach(obs => {
      if (obs.update) obs.update(actualDt);
    });

    // 2. Update Marbles Physics
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (m.eliminated) continue;

      m.preVx = m.vx;
      m.preVy = m.vy;

      if (!m.finished) {
        // Apply Gravity with slight custom mass effect
        // heavier balls drop faster with less wind drag
        m.vy += gravity * m.mass * actualDt;

        // Velocity cap to prevent tunneling/infinite speed (lowered from 18 to 11.5 for smoother, eye-safe action)
        const speedCap = 11.5;
        const currentSpeed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        if (currentSpeed > speedCap) {
          m.vx = (m.vx / currentSpeed) * speedCap;
          m.vy = (m.vy / currentSpeed) * speedCap;
        }

        // Apply friction (slightly stronger damping on vertical axis for fluid smoothness)
        m.vx *= Math.pow(m.friction, actualDt);
        m.vy *= Math.pow(0.992, actualDt);

        // Position update
        m.x += m.vx * actualDt;
        m.y += m.vy * actualDt;

        // Angle rotation based on rolling distance
        m.angle += (m.vx * 0.08) * actualDt;

        // Track limits boundary collision (Left / Right Walls)
        if (m.x - m.radius < 0) {
          m.x = m.radius;
          m.vx = Math.abs(m.vx) * m.bounce;
          sounds.playBounce(0.01);
        }
        if (m.x + m.radius > trackWidth) {
          m.x = trackWidth - m.radius;
          m.vx = -Math.abs(m.vx) * m.bounce;
          sounds.playBounce(0.01);
        }

        // Checkpoint/Lap calculation
        m.checkpointProgress = Math.min(m.y / trackHeight, 1.0);

        // Finish line handler
        if (m.y >= trackHeight - 30) {
          m.finished = true;
          m.finishTime = elapsedRaceTimeRef.current; // precise elapsed simulation time in ms
          
          sounds.playWin();
          spawnConfetti();
        }
      } else {
        // Slow down finished marbles in finish buffer zone
        m.vx *= 0.92;
        m.vy *= 0.92;
        m.y += m.vy * actualDt;
        m.x += m.vx * actualDt;
        // prevent escaping bottom
        if (m.y > trackHeight - 10) m.y = trackHeight - 10;
      }

      // Add trail point for leaders to look incredibly aesthetic
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 15) m.trail.shift();
    }

    // 3. Collision Checker: Marble vs. Obstacles
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (m.eliminated) continue;
      obstacles.forEach(obs => {
        // Rough AABB segment check to avoid redundant physics checks
        if (m.y + m.radius >= obs.y && m.y - m.radius <= obs.y + obs.h) {
          obs.checkCollision(m);
        }
      });
    }

    // 4. Collision Checker: Marble vs. Marble (High performance optimized)
    // Dynamic physics response with restitution
    for (let i = 0; i < marbles.length; i++) {
      const m1 = marbles[i];
      if (m1.eliminated) continue;
      for (let j = i + 1; j < marbles.length; j++) {
        const m2 = marbles[j];
        if (m2.eliminated) continue;

        const dx = m2.x - m1.x;
        const dy = m2.y - m1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = m1.radius + m2.radius;

        if (dist < minDist) {
          // Push them apart to prevent overlapping
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Simple mass-weighted position displacement
          const totalMass = m1.mass + m2.mass;
          m1.x -= nx * overlap * (m2.mass / totalMass);
          m1.y -= ny * overlap * (m2.mass / totalMass);
          m2.x += nx * overlap * (m1.mass / totalMass);
          m2.y += ny * overlap * (m1.mass / totalMass);

          // Elastic collision physics
          const kx = m1.vx - m2.vx;
          const ky = m1.vy - m2.vy;
          const p = 2 * (kx * nx + ky * ny) / totalMass;

          m1.vx -= p * m2.mass * nx;
          m1.vy -= p * m2.mass * ny;
          m2.vx += p * m1.mass * nx;
          m2.vy += p * m1.mass * ny;

          // Trigger tick sound
          sounds.playBounce(0.005);
        }
      }
    }

    // 4.5. Stuck & Loop Detection and Rescue System
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (m.eliminated || m.finished) continue;

      // Decrease super bounce effect countdown
      if (m.isSuperBouncing && m.isSuperBouncing > 0) {
        m.isSuperBouncing -= actualDt;
      }

      const preVx = m.preVx !== undefined ? m.preVx : m.vx;
      const preVy = m.preVy !== undefined ? m.preVy : m.vy;

      // Calculate sudden velocity change from collisions in this frame
      const dvx = m.vx - preVx;
      const dvy = m.vy - preVy;
      const velocityChange = Math.sqrt(dvx * dvx + dvy * dvy);

      // A bounce is registered if there's a significant velocity change or a reversal in direction
      const isBounced = velocityChange > 1.5 || 
                        (Math.sign(m.vx) !== Math.sign(preVx) && Math.abs(preVx) > 0.5) ||
                        (Math.sign(m.vy) !== Math.sign(preVy) && Math.abs(preVy) > 0.5);

      if (isBounced) {
        const lastBX = m.lastBounceX !== undefined ? m.lastBounceX : m.x;
        const lastBY = m.lastBounceY !== undefined ? m.lastBounceY : m.y;
        
        const dx = m.x - lastBX;
        const dy = m.y - lastBY;
        const distToLastBounce = Math.sqrt(dx * dx + dy * dy);

        // If the bounce is very close to the last bounce, increment loop counter
        if (distToLastBounce < 45) {
          m.loopCount = (m.loopCount || 0) + 1;
        } else {
          m.loopCount = 0;
        }

        m.lastBounceX = m.x;
        m.lastBounceY = m.y;
        m.stuckTimer = 0; // Reset stuck timer on active bounces
      } else {
        // If no bounce, check if marble is statically stuck in one place
        const lastX = m.lastPositionX !== undefined ? m.lastPositionX : m.x;
        const lastY = m.lastPositionY !== undefined ? m.lastPositionY : m.y;
        const dx = m.x - lastX;
        const dy = m.y - lastY;
        const movement = Math.sqrt(dx * dx + dy * dy);

        // If movement is negligible and velocity is extremely low
        if (movement < 0.15 && Math.sqrt(m.vx * m.vx + m.vy * m.vy) < 0.5) {
          m.stuckTimer = (m.stuckTimer || 0) + actualDt;
        } else {
          m.stuckTimer = 0;
        }
      }

      m.lastPositionX = m.x;
      m.lastPositionY = m.y;

      // TRIGGER RESCUE CONDITION:
      // - Loop detected 3 or more times (user requested: loop 2, 3 times)
      // - Or stuck in place for more than 90 frames (approx. 1.5s in 60 FPS)
      const isLoopingTooMuch = (m.loopCount || 0) >= 3;
      const isStuckTooLong = (m.stuckTimer || 0) > 90;

      if (isLoopingTooMuch || isStuckTooLong) {
        // Push outwards depending on track side to prevent hugging walls
        const pushDirectionX = m.x < trackWidth / 2 ? 1 : -1;

        if (isLoopingTooMuch) {
          // If in an infinite loop, blast it up and out in a spectacular arc!
          m.vy = -10 - Math.random() * 6; // High leap upwards
          m.vx = (Math.random() - 0.5) * 16; // Wide sideways dispersion
        } else {
          // If statically stuck, punch it downwards strongly to clear the obstacle
          m.vx = pushDirectionX * (8 + Math.random() * 5);
          m.vy = 10 + Math.random() * 5;
        }

        m.isSuperBouncing = 45; // Start super bounce rendering (45 frames fade)
        m.shakeIntensity = 6;

        // Spawn a burst of rich, eye-catching particles
        spawnParticles(m.x, m.y, "#facc15", 15); // Golden sparks
        spawnParticles(m.x, m.y, "#f97316", 10); // Amber fire trail
        spawnParticles(m.x, m.y, "#ffffff", 5);  // White sparks of energy

        // Play high-impact sound
        sounds.playBumper();

        // Induce nice tactile camera shake
        cameraShakeRef.current = 8;

        // Reset counters
        m.loopCount = 0;
        m.stuckTimer = 0;
      }
    }

    // 5. Survival Mode Rules (checkpoint elimination)
    // Every 450px down the track, check if any marble lags behind severely
    if (modeRef.current === "survival" && statusRef.current === "racing") {
      const activeMarbles = marbles.filter(m => !m.eliminated && !m.finished);
      if (activeMarbles.length > 1) {
        // We eliminate the last place marble if it falls past certain vertical thresholds
        // Let's check for continuous elimination every few seconds or vertical segments
        const lowestProgress = Math.min(...activeMarbles.map(m => m.y));
        const highestProgress = Math.max(...activeMarbles.map(m => m.y));
        
        // If team is spread out across 900px, eliminate the slowest
        if (highestProgress - lowestProgress > 1000) {
          const slowest = activeMarbles.reduce((prev, curr) => prev.y < curr.y ? prev : curr);
          slowest.eliminated = true;
          sounds.playEliminated();
          spawnParticles(slowest.x, slowest.y, "#94a3b8", 15);
        }
      }
    }

    // 6. Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx * actualDt;
      p.y += p.vy * actualDt;
      p.life -= 1 / p.maxLife * actualDt;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    confettiRef.current.forEach(p => {
      p.x += p.vx * actualDt;
      p.y += p.vy * actualDt;
      p.vy += 0.08 * actualDt; // slightly pull confetti down
      p.life -= 1 / p.maxLife * actualDt;
    });
    confettiRef.current = confettiRef.current.filter(p => p.life > 0);

    // 7. Update Live Leaderboard
    const sorted = [...marbles]
      .filter(m => !m.eliminated)
      .map(m => ({
        country: m.country,
        progress: m.checkpointProgress,
        finished: m.finished,
        time: m.finishTime
      }))
      .sort((a, b) => {
        if (a.finished && b.finished) return (a.time || 0) - (b.time || 0);
        if (a.finished) return -1;
        if (b.finished) return 1;
        return b.progress - a.progress;
      });

    setLeaderboard(sorted);

    // If top 10 finished (or all remaining active marbles are finished/eliminated), wrap up!
    const finishedMarbles = marbles.filter(m => m.finished);
    const finishedCount = finishedMarbles.length;
    const activeLeft = marbles.filter(m => !m.finished && !m.eliminated);
    const maxFinishedAllowed = modeRef.current === "world_cup" ? 2 : Math.min(10, marbles.length);

    const isWorldCupTimeout = modeRef.current === "world_cup" && elapsedRaceTimeRef.current >= 120000;

    if ((finishedCount >= maxFinishedAllowed || activeLeft.length === 0 || isWorldCupTimeout) && statusRef.current === "racing") {
      setStatus("finished");
      if (isWorldCupTimeout) {
        sounds.playTimeoutBuzz();
      } else {
        sounds.playWin();
      }
      
      // Calculate final ranks
      const finalRankings = [...marbles]
        .filter(m => !m.eliminated)
        .sort((a, b) => {
          if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
          if (a.finished) return -1;
          if (b.finished) return 1;
          return b.checkpointProgress - a.checkpointProgress; // Unfinished are ranked by checkpoint progress!
        });

      // Award Tournament points if in tournament mode
      if (modeRef.current === "tournament") {
        const nextScores = { ...scoresRef.current };
        finalRankings.forEach((m, idx) => {
          const pts = idx === 0 ? 15 : idx === 1 ? 12 : idx === 2 ? 10 : idx === 3 ? 8 : idx === 4 ? 6 : idx === 5 ? 4 : 1;
          nextScores[m.country.code] = (nextScores[m.country.code] || 0) + pts;
        });
        setScores(nextScores);
      }
    }
  };

  // --- DRAWING THE GAME CANVAS ---
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find current leader directly to avoid stale leaderboard state on canvas drawing
    // Only select among active running marbles (not eliminated and not finished) to always display the running leader's name on top
    const activeMarblesList = marblesRef.current.filter(m => !m.eliminated && !m.finished);
    const leadingMarble = activeMarblesList.length > 0 ? [...activeMarblesList].sort((a, b) => {
      return b.checkpointProgress - a.checkpointProgress;
    })[0] : null;

    // Responsive sizing inside parent container
    const pr = window.devicePixelRatio || 1;
    ctx.save();

    // Clear Canvas
    ctx.fillStyle = "#0f172a"; // slate-900 background
    ctx.fillRect(0, 0, trackWidth, canvas.height);

    // --- CAMERA SCROLL LOGIC ---
    // Camera follows leader smoothly
    const activeMarbles = marblesRef.current.filter(m => !m.eliminated && !m.finished);
    let targetCameraY = 0;
    
    if (activeMarbles.length > 0) {
      // Find leader
      const leader = activeMarbles.reduce((prev, curr) => prev.y > curr.y ? prev : curr);
      targetCameraY = leader.y - canvas.height / 3;
    } else {
      // Camera sits at finish line
      targetCameraY = trackHeight - canvas.height;
    }

    // Clamp camera
    const maxCameraY = trackHeight - canvas.height;
    targetCameraY = Math.max(0, Math.min(targetCameraY, maxCameraY));

    // Smooth Interpolation with asymmetrical speed
    // Fast when moving forward to catch up with the leader; smooth and responsive when moving backward to remain exciting and elegant
    const diff = targetCameraY - cameraYRef.current;
    if (diff > 0) {
      cameraYRef.current += diff * 0.12; // Snappier forward follow (increased from 0.08)
    } else {
      cameraYRef.current += diff * 0.04; // Fast yet smooth backward scroll to keep transitions exciting (increased from 0.005)
    }

    // Apply Shake Effect
    if (cameraShakeRef.current > 0.1) {
      ctx.translate((Math.random() - 0.5) * cameraShakeRef.current, (Math.random() - 0.5) * cameraShakeRef.current);
      cameraShakeRef.current *= 0.9;
    }

    ctx.translate(0, -cameraYRef.current);

    // Draw Grid Lines / Track Aesthetics
    ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
    ctx.lineWidth = 1;
    for (let y = 0; y < trackHeight; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(trackWidth, y);
      ctx.stroke();
    }

    // Draw Track Limits / Side Glow Walls
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(4, trackHeight);
    ctx.moveTo(trackWidth - 4, 0);
    ctx.lineTo(trackWidth - 4, trackHeight);
    ctx.stroke();

    // Side wall stripes (aesthetic race track styling)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(12, trackHeight);
    ctx.moveTo(trackWidth - 12, 0);
    ctx.lineTo(trackWidth - 12, trackHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Start Banner
    ctx.fillStyle = "rgba(51, 65, 85, 0.8)";
    ctx.fillRect(15, 40, trackWidth - 30, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px 'Inter', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("MARBLE RACE COUNTRY - START", trackWidth / 2, 65);

    // Draw Checkpoint milestones on left/right walls
    ctx.fillStyle = "#0284c7";
    ctx.font = "bold 10px monospace";
    for (let y = 500; y < trackHeight - 500; y += 500) {
      ctx.fillText(`${y}M`, 30, y);
      ctx.fillText(`${y}M`, trackWidth - 30, y);
    }

    // Draw All Obstacles
    obstaclesRef.current.forEach(obs => {
      obs.draw(ctx);
    });

    // Draw Marble Trails (Pre-render below balls)
    marblesRef.current.forEach(m => {
      if (m.eliminated || m.trail.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(m.trail[0].x, m.trail[0].y);
      for (let i = 1; i < m.trail.length; i++) {
        ctx.lineTo(m.trail[i].x, m.trail[i].y);
      }
      ctx.strokeStyle = `${m.country.primaryColor}88`; // half transparency
      ctx.lineWidth = m.radius * 0.9;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    });

    // Draw All Active Marbles with their Country Flags
    marblesRef.current.forEach(m => {
      if (m.eliminated) return;
      ctx.save();
      
      // Draw ball shadow
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Draw Flag on Marble
      m.country.drawFlag(ctx, m.x, m.y, m.radius);

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw shiny 3D bubble overlay
      const shinyGrad = ctx.createRadialGradient(m.x - m.radius * 0.3, m.y - m.radius * 0.3, m.radius * 0.1, m.x, m.y, m.radius);
      shinyGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      shinyGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.3)");
      shinyGrad.addColorStop(0.8, "rgba(0, 0, 0, 0.1)");
      shinyGrad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
      ctx.fillStyle = shinyGrad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer boundary stroke
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw super bounce visual effect (golden energy ring + expanding aura + rotating sparks)
      if (m.isSuperBouncing && m.isSuperBouncing > 0) {
        ctx.save();
        const progress = m.isSuperBouncing / 45; // 1.0 down to 0.0

        // Expanding outer glowing energy wave
        const auraRadius = m.radius + (1 - progress) * 16;
        ctx.strokeStyle = `rgba(250, 204, 21, ${progress})`; // Gold color
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(m.x, m.y, auraRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fiery plasma ring
        ctx.strokeStyle = `rgba(249, 115, 22, ${progress * 0.75})`; // Orange color
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating magical energy sparks
        ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          const sparkDistance = m.radius + 6 + (1 - progress) * 8;
          const sx = m.x + Math.cos(a + progress * 4) * sparkDistance;
          const sy = m.y + Math.sin(a + progress * 4) * sparkDistance;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Name label tag for leader
      if (leadingMarble && leadingMarble.id === m.id && !m.finished && (statusRef.current === "racing" || statusRef.current === "paused")) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(m.x - 30, m.y - 25, 60, 14);
        ctx.strokeStyle = m.country.primaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(m.x - 30, m.y - 25, 60, 14);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px 'Montserrat', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.country.name.substring(0, 10), m.x, m.y - 15);
      }

      ctx.restore();
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Confetti
    confettiRef.current.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Finished Lane Gate & Vạch Đích (Finish Line Area)
    ctx.save();
    // Finish Area floor background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(10, trackHeight - 160, trackWidth - 20, 160);

    // Checkered board finish banner
    const flagRowHeight = 10;
    const blockWidth = 10;
    ctx.fillStyle = "#fff";
    for (let fy = trackHeight - 40; fy < trackHeight - 20; fy += flagRowHeight) {
      for (let fx = 15; fx < trackWidth - 15; fx += blockWidth * 2) {
        ctx.fillStyle = (fy / flagRowHeight + fx / blockWidth) % 2 === 0 ? "#000" : "#fff";
        ctx.fillRect(fx, fy, blockWidth, flagRowHeight);
        ctx.fillRect(fx + blockWidth, fy, blockWidth, flagRowHeight);
      }
    }

    // Finish Text
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 20px 'Montserrat', system-ui";
    ctx.textAlign = "center";
    ctx.fillText("VỀ ĐÍCH", trackWidth / 2, trackHeight - 50);

    // Visual Dividers for finished marbles
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 1;
    for (let l = 1; l < 8; l++) {
      ctx.beginPath();
      ctx.moveTo(l * (trackWidth / 8), trackHeight - 150);
      ctx.lineTo(l * (trackWidth / 8), trackHeight);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  // --- RENDERING SCHEDULER (60 FPS) ---
  const tick = (time: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    let dt = (time - lastTimeRef.current) / 16.666; // scale near 1.0 at 60fps
    lastTimeRef.current = time;

    // Keep FPS counter updated smoothly (avoiding jitter and performance heavy React re-renders)
    framesSinceLastUpdateRef.current++;
    if (lastFpsUpdateRef.current === 0) lastFpsUpdateRef.current = time;
    const elapsed = time - lastFpsUpdateRef.current;
    if (elapsed >= 500) {
      const actualFps = Math.round((framesSinceLastUpdateRef.current * 1000) / elapsed);
      setFps(Math.min(actualFps, 120));
      framesSinceLastUpdateRef.current = 0;
      lastFpsUpdateRef.current = time;
    }

    if (statusRef.current === "racing") {
      updatePhysics(dt);

      if (modeRef.current === "world_cup") {
        const remaining = Math.max(0, 120 - elapsedRaceTimeRef.current / 1000);
        const currentSecs = Math.ceil(remaining);
        if (currentSecs !== lastSecondsRef.current) {
          lastSecondsRef.current = currentSecs;
          setTimeRemaining(currentSecs);
          if (currentSecs <= 5 && currentSecs > 0) {
            sounds.playBeep(600, 0.1); // High pitch countdown warning
          }
        }
      }
    }

    drawGame();
    loopRef.current = requestAnimationFrame(tick);
  };

  // Trigger game reset
  const resetGame = () => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    setStatus("idle");
    setCountdownVal(null);
    setTimeRemaining(120);
    lastSecondsRef.current = 120;
    cameraYRef.current = 0;
    cameraShakeRef.current = 0;
    particlesRef.current = [];
    confettiRef.current = [];
    lastTimeRef.current = 0;
    lastFpsUpdateRef.current = 0;
    framesSinceLastUpdateRef.current = 0;
    elapsedRaceTimeRef.current = 0;
    setFps(60);

    if (mode === "world_cup" && worldCupStage !== "idle") {
      setupWorldCupTrack(worldCupStage, worldCupMatchIndex, worldCupGroups, worldCupQuarterTeams, worldCupSemiTeams, worldCupFinalTeams);
    } else {
      initMarbles();
      generateTrack();
      
      // Draw initial state once
      setTimeout(() => {
        drawGame();
      }, 50);
    }
  };

  // --- WORLD CUP 2026 SYSTEM ---
  const initWorldCup = () => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    setStatus("idle");
    setCountdownVal(null);
    setTimeRemaining(120);
    lastSecondsRef.current = 120;
    cameraYRef.current = 0;
    cameraShakeRef.current = 0;
    particlesRef.current = [];
    confettiRef.current = [];
    lastTimeRef.current = 0;
    lastFpsUpdateRef.current = 0;
    framesSinceLastUpdateRef.current = 0;
    elapsedRaceTimeRef.current = 0;
    setFps(60);

    // Trộn ngẫu nhiên 16 quốc gia từ danh sách các quốc gia
    const shuffled = [...countries].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 16);

    const groups = {
      "A": selected.slice(0, 4),
      "B": selected.slice(4, 8),
      "C": selected.slice(8, 12),
      "D": selected.slice(12, 16)
    };

    setWorldCupGroups(groups);
    setWorldCupGroupRankings({});
    setWorldCupQuarterTeams([]);
    setWorldCupSemiTeams([]);
    setWorldCupFinalTeams([]);
    setWorldCupWinner(null);
    setWorldCupPodium([]);
    
    setWorldCupStage("groups");
    setWorldCupMatchIndex(0); 

    setupWorldCupTrack("groups", 0, groups, [], [], []);
  };

  const setupWorldCupTrack = (
    stage: "groups" | "quarterfinals" | "semifinals" | "finals" | "finished" | "idle",
    matchIdx: number,
    groups: { [key: string]: Country[] },
    quarters: Country[],
    semis: Country[],
    finals: Country[]
  ) => {
    let activeCountries: Country[] = [];

    if (stage === "groups") {
      const groupKeys = ["A", "B", "C", "D"];
      const activeGroupKey = groupKeys[matchIdx];
      activeCountries = groups[activeGroupKey] || [];
    } else if (stage === "quarterfinals") {
      if (matchIdx === 0) {
        activeCountries = quarters.slice(0, 4); 
      } else {
        activeCountries = quarters.slice(4, 8); 
      }
    } else if (stage === "semifinals") {
      activeCountries = semis;
    } else if (stage === "finals") {
      activeCountries = finals;
    }

    if (activeCountries.length === 0) return;

    // Khởi tạo các viên bi dựa trên danh sách các quốc gia đang tranh đấu
    const result: MarbleState[] = [];
    const rng = seedRandom(mapSeed + "_" + stage + "_" + matchIdx);

    for (let i = 0; i < activeCountries.length; i++) {
      const country = activeCountries[i];
      const luck = 0.5 + rng() * 0.5;
      const mass = 0.7 + rng() * 0.6;
      const bounce = 0.45 + rng() * 0.25;
      const friction = 0.98 + rng() * 0.012;
      const grip = 0.5 + rng() * 0.5;

      result.push({
        id: country.code,
        country,
        x: trackWidth / 2 - (activeCountries.length * 12) / 2 + i * 12 + (rng() - 0.5) * 8,
        y: 80 + (i % 5) * 16,
        vx: (rng() - 0.5) * 2,
        vy: 0,
        radius: 10,
        angle: rng() * Math.PI * 2,
        mass,
        bounce,
        friction,
        luck,
        grip,
        trail: [],
        eliminated: false,
        finished: false,
        checkpointProgress: 0,
        shakeIntensity: 0
      });
    }

    marblesRef.current = result;
    generateTrack();

    setStatus("idle");
    cameraYRef.current = 0;
    cameraShakeRef.current = 0;
    particlesRef.current = [];
    confettiRef.current = [];
    lastTimeRef.current = 0;
    lastFpsUpdateRef.current = 0;
    framesSinceLastUpdateRef.current = 0;
    elapsedRaceTimeRef.current = 0;
    setFps(60);

    setTimeout(() => {
      drawGame();
    }, 50);
  };

  const advanceWorldCup = () => {
    // Lấy bảng xếp hạng thực tế của trận đấu vừa hoàn thành
    const matchRankings = [...leaderboard].map(entry => entry.country);
    if (matchRankings.length === 0) return;

    if (worldCupStage === "groups") {
      const groupKeys = ["A", "B", "C", "D"];
      const activeGroupKey = groupKeys[worldCupMatchIndex];
      
      const newGroupRankings = {
        ...worldCupGroupRankings,
        [activeGroupKey]: matchRankings
      };
      setWorldCupGroupRankings(newGroupRankings);

      if (worldCupMatchIndex < 3) {
        const nextIdx = worldCupMatchIndex + 1;
        setWorldCupMatchIndex(nextIdx);
        setupWorldCupTrack("groups", nextIdx, worldCupGroups, [], [], []);
      } else {
        // Hoàn thành vòng bảng, lọc Top 2 của mỗi bảng vào Tứ kết
        const qTeams: Country[] = [];
        groupKeys.forEach(k => {
          const rank = newGroupRankings[k] || [];
          if (rank[0]) qTeams.push(rank[0]);
          if (rank[1]) qTeams.push(rank[1]);
        });

        setWorldCupQuarterTeams(qTeams);
        setWorldCupStage("quarterfinals");
        setWorldCupMatchIndex(0);
        setupWorldCupTrack("quarterfinals", 0, worldCupGroups, qTeams, [], []);
      }
    } else if (worldCupStage === "quarterfinals") {
      if (worldCupMatchIndex === 0) {
        const nextSemiTeams = matchRankings.slice(0, 2);
        setWorldCupSemiTeams(nextSemiTeams);

        setWorldCupMatchIndex(1);
        setupWorldCupTrack("quarterfinals", 1, worldCupGroups, worldCupQuarterTeams, [], []);
      } else {
        const q2Winners = matchRankings.slice(0, 2);
        const allSemis = [...worldCupSemiTeams, ...q2Winners];
        setWorldCupSemiTeams(allSemis);

        setWorldCupStage("semifinals");
        setWorldCupMatchIndex(0);
        setupWorldCupTrack("semifinals", 0, worldCupGroups, worldCupQuarterTeams, allSemis, []);
      }
    } else if (worldCupStage === "semifinals") {
      // Bán kết: Toàn bộ 4 đội xuất sắc nhất tiến vào Chung kết
      setWorldCupFinalTeams(matchRankings);
      setWorldCupStage("finals");
      setWorldCupMatchIndex(0);
      setupWorldCupTrack("finals", 0, worldCupGroups, worldCupQuarterTeams, worldCupSemiTeams, matchRankings);
    } else if (worldCupStage === "finals") {
      setWorldCupWinner(matchRankings[0]);
      setWorldCupPodium(matchRankings.slice(0, 3));
      setWorldCupStage("finished");
    }
  };

  const startRace = () => {
    if (mode === "world_cup") {
      setStatus("countdown");
      setCountdownVal(3);
      sounds.playBeep(440, 0.15); // beep for 3
      
      const timer = setInterval(() => {
        setCountdownVal(prev => {
          if (prev === null) {
            clearInterval(timer);
            return null;
          }
          if (prev > 1) {
            sounds.playBeep(440, 0.15); // beep for 2, 1
            return prev - 1;
          } else {
            clearInterval(timer);
            sounds.playBeep(880, 0.4); // high beep for GO!
            
            // Start the actual physics loop
            lastTimeRef.current = 0;
            elapsedRaceTimeRef.current = 0;
            setStatus("racing");
            sounds.playBounce(0.2, 0.8);
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
            loopRef.current = requestAnimationFrame(tick);
            return null;
          }
        });
      }, 1000);
    } else {
      lastTimeRef.current = 0;
      elapsedRaceTimeRef.current = 0;
      setStatus("racing");
      sounds.playBounce(0.2, 0.8);
      // Begin continuous update loop
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = requestAnimationFrame(tick);
    }
  };

  const togglePause = () => {
    if (status === "racing") {
      setStatus("paused");
    } else if (status === "paused") {
      setStatus("racing");
      lastTimeRef.current = 0;
    }
  };

  const startNextTournamentTrack = () => {
    // Pick next seed randomly
    const newSeed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    setMapSeed(newSeed);
    setCurrentTrackIndex(prev => prev + 1);
    resetGame();
  };

  // --- STATS HELPER ---
  const totalCompetitors = marblesRef.current.length;
  const finishedMarblesCount = leaderboard.filter(m => m.finished).length;
  const activeCount = leaderboard.filter(m => !m.finished).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-x-hidden">
      
      {/* Left panel containing race settings */}
      <div className="w-full lg:w-96 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Marble Race Country
            </h1>
            <p className="text-xs text-slate-400">Dự án Mô phỏng Vật lý 2D Đỉnh cao</p>
          </div>
        </div>

        {/* Chế độ chơi (Game Modes) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chế Độ Đua</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (status === "racing") return;
                setMode("tournament");
                resetGame();
              }}
              disabled={status === "racing"}
              className={`flex items-center justify-center gap-1.5 p-2 px-1 rounded-lg border text-xs font-bold transition ${
                mode === "tournament"
                  ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>Giải Vòng Tròn</span>
            </button>
            <button
              onClick={() => {
                if (status === "racing") return;
                setMode("world_cup");
              }}
              disabled={status === "racing"}
              className={`flex items-center justify-center gap-1.5 p-2 px-1 rounded-lg border text-xs font-bold transition ${
                mode === "world_cup"
                  ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/5"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>World Cup 2026</span>
            </button>
          </div>
        </div>

        {/* Thiết lập tham số */}
        <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          {mode !== "world_cup" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Số lượng Quốc gia</span>
                <span className="text-sky-400 font-bold">{numMarbles} / {countries.length}</span>
              </div>
              <input
                type="range"
                min="8"
                max={countries.length}
                step="1"
                value={numMarbles}
                onChange={(e) => setNumMarbles(parseInt(e.target.value))}
                disabled={status === "racing"}
                className="w-full accent-sky-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">Bản đồ (Seed)</label>
            <div className="flex gap-2">
              <select
                value={mapSeed}
                onChange={(e) => setMapSeed(e.target.value)}
                disabled={status === "racing"}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm outline-none text-slate-200 focus:border-sky-500"
              >
                {SEEDS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const rSeed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
                  setMapSeed(rSeed);
                }}
                disabled={status === "racing"}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Bản đồ ngẫu nhiên"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bảng xếp hạng giải đấu (Tournament / World Cup) */}
        {mode === "tournament" ? (
          <div className="flex-1 min-h-[160px] bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Giải Đấu (Đường Đua #{currentTrackIndex + 1})
              </span>
            </div>
            <div className="overflow-y-auto max-h-[220px] pr-1 space-y-1 no-scrollbar cursor-grab active:cursor-grabbing select-none" onMouseDown={handleDragScroll}>
              {Object.keys(scores).length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-6">Giải đấu chưa bắt đầu</div>
              ) : (
                (Object.entries(scores) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, score], index) => {
                    const country = countries.find(c => c.code === code);
                    return (
                      <div key={code} className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/60">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-4 font-mono">#{index + 1}</span>
                          {country && <CountryFlag country={country} size={16} />}
                          <span className="font-semibold text-slate-200">{country?.name}</span>
                        </div>
                        <span className="font-bold text-sky-400">{score} điểm</span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        ) : (
          /* WORLD CUP 2026 PROGRESS PANEL */
          <div className="flex-1 min-h-[260px] bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 animate-bounce" /> World Cup 2026
              </span>
              <button
                onClick={initWorldCup}
                className="text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-2 py-1 rounded border border-purple-500/30 transition"
              >
                Khởi Tranh Lại
              </button>
            </div>

            {/* World Cup stages tracker */}
            <div className="flex justify-between text-[9px] font-bold text-slate-500 border-b border-slate-900 pb-2">
              <span className={worldCupStage === "groups" ? "text-purple-400" : ""}>VÒNG BẢNG</span>
              <span className={worldCupStage === "quarterfinals" ? "text-purple-400" : ""}>TỨ KẾT</span>
              <span className={worldCupStage === "semifinals" ? "text-purple-400" : ""}>BÁN KẾT</span>
              <span className={worldCupStage === "finals" ? "text-purple-400" : ""}>CHUNG KẾT</span>
            </div>

            {/* Active World Cup visual progress */}
            <div className="overflow-y-auto max-h-[280px] pr-1 space-y-3 no-scrollbar text-xs cursor-grab active:cursor-grabbing select-none" onMouseDown={handleDragScroll}>
              
              {worldCupStage === "groups" && (
                <div className="space-y-3">
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-center">
                    <span className="font-bold text-purple-300">
                      Đang đấu: Bảng {["A", "B", "C", "D"][worldCupMatchIndex]}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Top 2 quốc gia sẽ đi tiếp vào Tứ Kết</p>
                  </div>

                  {["A", "B", "C", "D"].map((groupKey, gIdx) => {
                    const groupTeams = worldCupGroups[groupKey] || [];
                    const rank = worldCupGroupRankings[groupKey];
                    const isCurrent = worldCupMatchIndex === gIdx;

                    return (
                      <div key={groupKey} className={`p-2 rounded-lg border transition ${
                        isCurrent ? "bg-slate-900 border-purple-500/50 shadow" : "bg-slate-950/40 border-slate-900"
                      }`}>
                        <div className="flex justify-between items-center mb-1.5 border-b border-slate-800/50 pb-1">
                          <span className={`font-bold uppercase ${isCurrent ? "text-purple-400" : "text-slate-400"}`}>
                            Bảng {groupKey} {isCurrent && "• ĐANG ĐUA"}
                          </span>
                          {rank ? (
                            <span className="text-[9px] text-emerald-400 font-bold uppercase">Xong</span>
                          ) : (
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Chờ</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {groupTeams.map((team) => {
                            const finalRankIdx = rank ? rank.findIndex(t => t.code === team.code) : -1;
                            const isQualified = finalRankIdx === 0 || finalRankIdx === 1;
                            const isEliminated = finalRankIdx > 1;

                            return (
                              <div key={team.code} className="flex justify-between items-center py-0.5 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  {rank ? (
                                    <span className={`text-[10px] font-mono w-4 ${isQualified ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                                      #{finalRankIdx + 1}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-600 font-mono w-4">•</span>
                                  )}
                                  <CountryFlag country={team} size={14} />
                                  <span className={`truncate max-w-[120px] ${
                                    isEliminated ? "text-slate-600 line-through" : isQualified ? "text-emerald-400 font-bold" : "text-slate-300"
                                  }`}>
                                    {team.name}
                                  </span>
                                </div>

                                {rank && (
                                  <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                                    isQualified ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                                  }`}>
                                    {isQualified ? "ĐI TIẾP" : "LOẠI"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* QUARTERFINALS STAGE */}
              {worldCupStage === "quarterfinals" && (
                <div className="space-y-3">
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-center">
                    <span className="font-bold text-purple-300">
                      VÒNG TỨ KẾT (Trận {worldCupMatchIndex + 1}/2)
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Top 2 mỗi trận sẽ tiến vào Bán Kết</p>
                  </div>

                  {/* Quarter 1 (A & B) */}
                  <div className={`p-2.5 rounded-lg border ${worldCupMatchIndex === 0 ? "bg-slate-900 border-purple-500/50" : "bg-slate-950/40 border-slate-900"}`}>
                    <span className="font-bold text-[11px] block text-purple-400 border-b border-slate-800 pb-1 mb-1.5">
                      Trận Tứ Kết 1 (Bảng A & B)
                    </span>
                    <div className="space-y-1">
                      {worldCupQuarterTeams.slice(0, 4).map((team) => {
                        const isDone = worldCupMatchIndex > 0 || worldCupStage === "semifinals" || worldCupStage === "finals" || worldCupStage === "finished";
                        const inSemis = worldCupSemiTeams.some(t => t.code === team.code);
                        return (
                          <div key={team.code} className="flex justify-between items-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <CountryFlag country={team} size={14} />
                              <span className={isDone && !inSemis ? "text-slate-600 line-through" : inSemis ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                {team.name}
                              </span>
                            </div>
                            {isDone && (
                              <span className={`text-[8px] font-bold px-1 rounded ${inSemis ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"}`}>
                                {inSemis ? "BÁN KẾT" : "LOẠI"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quarter 2 (C & D) */}
                  <div className={`p-2.5 rounded-lg border ${worldCupMatchIndex === 1 ? "bg-slate-900 border-purple-500/50" : "bg-slate-950/40 border-slate-900"}`}>
                    <span className="font-bold text-[11px] block text-purple-400 border-b border-slate-800 pb-1 mb-1.5">
                      Trận Tứ Kết 2 (Bảng C & D)
                    </span>
                    <div className="space-y-1">
                      {worldCupQuarterTeams.slice(4, 8).map((team) => {
                        const isDone = worldCupStage === "semifinals" || worldCupStage === "finals" || worldCupStage === "finished";
                        const inSemis = worldCupSemiTeams.some(t => t.code === team.code);
                        return (
                          <div key={team.code} className="flex justify-between items-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <CountryFlag country={team} size={14} />
                              <span className={isDone && !inSemis ? "text-slate-600 line-through" : inSemis ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                {team.name}
                              </span>
                            </div>
                            {isDone && (
                              <span className={`text-[8px] font-bold px-1 rounded ${inSemis ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"}`}>
                                {inSemis ? "BÁN KẾT" : "LOẠI"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SEMIFINALS STAGE */}
              {worldCupStage === "semifinals" && (
                <div className="space-y-3">
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-center">
                    <span className="font-bold text-purple-300">VÒNG BÁN KẾT ĐẤU LỬA</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">4 nước cùng tranh tài khốc liệt</p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-slate-900 border-purple-500/50">
                    <span className="font-bold text-[11px] block text-purple-400 border-b border-slate-800 pb-1 mb-1.5">
                      Các nước tranh tấm vé Vàng Chung Kết
                    </span>
                    <div className="space-y-1">
                      {worldCupSemiTeams.map((team) => {
                        const inFinals = worldCupFinalTeams.some(t => t.code === team.code);
                        const isDone = worldCupStage === "finals" || worldCupStage === "finished";
                        return (
                          <div key={team.code} className="flex justify-between items-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <CountryFlag country={team} size={14} />
                              <span className={isDone && !inFinals ? "text-slate-600 line-through" : "text-slate-300"}>
                                {team.name}
                              </span>
                            </div>
                            <span className="text-[8px] bg-purple-500/10 text-purple-400 font-bold px-1 rounded">
                              BÁN KẾT
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* FINALS STAGE */}
              {(worldCupStage === "finals" || worldCupStage === "finished") && (
                <div className="space-y-3">
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="font-bold text-amber-300">TRẬN CHUNG KẾT TỐI CAO</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Quyết định Ngôi Vương thế giới</p>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-slate-900 border-amber-500/50">
                    <span className="font-bold text-[11px] block text-amber-400 border-b border-slate-800 pb-1 mb-1.5">
                      Thành viên tranh Cúp Vàng
                    </span>
                    <div className="space-y-1">
                      {worldCupFinalTeams.map((team) => {
                        const isWinner = worldCupWinner?.code === team.code;
                        const isSecond = worldCupPodium[1]?.code === team.code;
                        const isThird = worldCupPodium[2]?.code === team.code;
                        
                        let awardText = "";
                        let awardStyle = "text-slate-400";
                        if (isWinner) { awardText = "VÔ ĐỊCH 🏆"; awardStyle = "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"; }
                        else if (isSecond) { awardText = "HẠNG NHÌ 🥈"; awardStyle = "bg-slate-300/20 text-slate-200 border border-slate-300/30"; }
                        else if (isThird) { awardText = "HẠNG BA 🥉"; awardStyle = "bg-amber-700/20 text-amber-600 border border-amber-700/30"; }

                        return (
                          <div key={team.code} className="flex justify-between items-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <CountryFlag country={team} size={14} />
                              <span className={isWinner ? "text-amber-400 font-bold" : "text-slate-300"}>
                                {team.name}
                              </span>
                            </div>
                            {awardText ? (
                              <span className={`text-[8px] px-1 py-0.2 rounded font-black ${awardStyle}`}>
                                {awardText}
                              </span>
                            ) : (
                              <span className="text-[8px] bg-slate-800 text-slate-500 px-1 py-0.2 rounded">
                                CHUNG KẾT
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sound and quick tips */}
        <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="flex justify-between items-center">
            <span>Hiệu ứng Âm thanh</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg transition ${
                soundEnabled ? "bg-sky-500/10 text-sky-400" : "bg-slate-800 text-slate-500"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
            💡 Mỗi quốc gia sở hữu thuộc tính khối lượng, độ nảy và chỉ số may mắn riêng biệt mang tới những khúc cua ngoạn mục!
          </div>
        </div>
      </div>

      {/* Main Game Screen Center Area */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 lg:p-6 gap-4">
        
        {/* TOP HUD SCREEN */}
        <div className="w-full max-w-xl bg-slate-900 rounded-xl border border-slate-800 p-4 flex justify-between items-center shadow-lg gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tốc Độ Đua</span>
            <div className="flex gap-1.5 mt-1">
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2 py-0.5 text-xs rounded-md font-mono font-bold transition ${
                    speedMultiplier === s 
                      ? "bg-sky-500 text-slate-950" 
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">FPS</span>
              <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{fps}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Cạnh Tranh</span>
              <span className="text-sm font-mono font-bold text-sky-400 mt-0.5">{activeCount} / {totalCompetitors}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Hoàn Thành</span>
              <span className="text-sm font-mono font-bold text-amber-400 mt-0.5">{finishedMarblesCount}</span>
            </div>
            {mode === "world_cup" && (
              <>
                <div className="w-px h-8 bg-slate-800" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider animate-pulse">Thời Gian</span>
                  <span className={`text-sm font-mono font-black mt-0.5 ${timeRemaining <= 5 ? "text-red-500 animate-bounce" : "text-purple-400"}`}>
                    {timeRemaining}s
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status === "idle" && (
              <button
                onClick={startRace}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg transition transform active:scale-95 shadow-md shadow-emerald-500/20 text-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Đua Ngay
              </button>
            )}
            {status === "countdown" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold rounded-lg text-xs select-none">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                Đếm Ngược...
              </div>
            )}
            {status === "racing" && (
              <button
                onClick={togglePause}
                className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition animate-fade-in"
                title="Tạm dừng"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            {status === "paused" && (
              <button
                onClick={togglePause}
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition animate-fade-in"
                title="Tiếp tục"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={resetGame}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Chơi lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRIMARY GAME AREA SPLIT SECTION */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 items-stretch justify-center">
          
          {/* LEAD BOARD SIDE RAIL */}
          <div className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-3 block">
              Bảng Xếp Hạng Thực Tế
            </span>
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[480px] md:max-h-none pr-1 no-scrollbar cursor-grab active:cursor-grabbing select-none" onMouseDown={handleDragScroll}>
              {leaderboard.length === 0 ? (
                <div className="text-xs text-slate-500 py-10 text-center">Chuẩn bị xuất phát...</div>
              ) : (
                leaderboard.slice(0, 15).map((entry, idx) => {
                  let badgeColor = "bg-slate-800 text-slate-400";
                  if (idx === 0) badgeColor = "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30";
                  if (idx === 1) badgeColor = "bg-slate-300/20 text-slate-200 border border-slate-400/30";
                  if (idx === 2) badgeColor = "bg-amber-700/20 text-amber-600 border border-amber-700/30";

                  return (
                    <div 
                      key={entry.country.code} 
                      className={`flex items-center justify-between p-2 rounded-lg text-xs transition ${
                        entry.finished ? "bg-slate-800/80 border border-slate-700" : "bg-slate-950/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] ${badgeColor}`}>
                          {idx + 1}
                        </span>
                        <CountryFlag country={entry.country} size={20} />
                        <span className="font-semibold text-slate-200 max-w-[100px] truncate">{entry.country.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-sky-400">
                        {entry.finished ? (
                          <span className="text-amber-400">
                            {(entry.time! / 1000).toFixed(2)}s
                          </span>
                        ) : (
                          `${Math.round(entry.progress * 100)}%`
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GAME CANVAS */}
          <div className="flex-1 flex justify-center bg-slate-950 p-2 rounded-2xl border border-slate-800 relative shadow-2xl overflow-hidden">
            {/* Visual stage frame */}
            <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-800 font-mono z-10">
              STAGE: {mapSeed}
            </div>

            {/* Floating World Cup timer limit */}
            {mode === "world_cup" && status === "racing" && (
              <div className="absolute top-2 right-2 bg-purple-950/90 px-3 py-1 rounded-full text-xs font-black text-purple-300 border border-purple-500/30 font-mono flex items-center gap-1.5 shadow-lg shadow-purple-500/10 z-10">
                <span className={`w-2 h-2 rounded-full bg-purple-500 ${timeRemaining <= 5 ? "animate-ping bg-red-500" : ""}`} />
                <span className={timeRemaining <= 5 ? "text-red-400 animate-pulse font-black" : ""}>
                  TIME: {timeRemaining}s
                </span>
              </div>
            )}

            {/* BIG PRE-RACE COUNTDOWN OVERLAY */}
            {status === "countdown" && countdownVal !== null && (
              <div className="absolute inset-0 bg-slate-950/75 rounded-2xl flex items-center justify-center pointer-events-none select-none backdrop-blur-sm z-20 animate-fade-in">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-purple-400 font-extrabold mb-1">
                    Trận Đấu Chuẩn Bị Bắt Đầu
                  </div>
                  <div key={countdownVal} className="text-8xl font-black text-amber-400 font-sans tracking-tight animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                    {countdownVal}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-4">
                    SẴN SÀNG!
                  </div>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={trackWidth}
              height={600}
              className="max-w-full rounded-xl bg-slate-900 border border-slate-800 shadow-inner"
              style={{ maxHeight: "680px", aspectRatio: `${trackWidth}/600` }}
            />

            {/* BIG STATUS COVER BANNER */}
            {status === "finished" && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in backdrop-blur-sm">
                <style>{`
                  @keyframes flag-wave {
                    0% {
                      transform: rotateX(8deg) rotateY(15deg) skewY(-3deg) scaleX(0.96);
                    }
                    25% {
                      transform: rotateX(-4deg) rotateY(0deg) skewY(2deg) scaleX(1);
                      filter: brightness(1.05);
                    }
                    50% {
                      transform: rotateX(8deg) rotateY(-15deg) skewY(-2deg) scaleX(0.96);
                    }
                    75% {
                      transform: rotateX(-4deg) rotateY(0deg) skewY(3deg) scaleX(1);
                      filter: brightness(0.95);
                    }
                    100% {
                      transform: rotateX(8deg) rotateY(15deg) skewY(-3deg) scaleX(0.96);
                    }
                  }
                  @keyframes flag-shading {
                    0% {
                      background-position: 0% 50%;
                    }
                    50% {
                      background-position: 100% 50%;
                    }
                    100% {
                      background-position: 0% 50%;
                    }
                  }
                `}</style>

                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-amber-400">Cuộc Đua Kết Thúc!</h2>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                  Xin chúc mừng các quốc gia xuất sắc nhất đã giành vị trí dẫn đầu!
                </p>

                {/* Podium Top 3 */}
                <div className="flex items-end justify-center gap-6 my-8 h-36">
                  {/* 2nd Place */}
                  {leaderboard[1] && (
                    <div className="flex flex-col items-center w-24 relative">
                      {/* Cột cờ cắm bên trái bục gỗ */}
                      <div className="absolute -top-[52px] -left-3 z-10 scale-90 origin-bottom">
                        <WavingFlagWithPole country={leaderboard[1].country} delay="-0.4s" />
                      </div>
                      <span className="text-xs text-slate-300 font-semibold z-20">{leaderboard[1].country.name}</span>
                      <div className="w-16 bg-slate-800 border-t-2 border-slate-300 h-16 flex flex-col justify-center items-center rounded-t-lg mt-2 shadow-lg z-20">
                        <span className="text-2xl font-black text-slate-300">2</span>
                        <span className="text-[10px] text-slate-400">
                          {leaderboard[1].time ? (leaderboard[1].time / 1000).toFixed(2) + "s" : `${Math.round(leaderboard[1].progress * 100)}%`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {leaderboard[0] && (
                    <div className="flex flex-col items-center w-28 relative">
                      {/* Cột cờ oai phong cắm góc trái bục hạng nhất */}
                      <div className="absolute -top-[62px] -left-4 z-10">
                        <WavingFlagWithPole country={leaderboard[0].country} delay="0s" />
                      </div>
                      <span className="text-sm text-amber-300 font-bold z-20">{leaderboard[0].country.name}</span>
                      <div className="w-20 bg-amber-500/20 border-t-4 border-amber-400 h-24 flex flex-col justify-center items-center rounded-t-lg mt-2 shadow-2xl relative z-20">
                        <span className="absolute -top-3.5 text-amber-400 animate-bounce text-lg">👑</span>
                        <span className="text-3xl font-black text-amber-400">1</span>
                        <span className="text-[10px] text-amber-300 font-semibold">
                          {leaderboard[0].time ? (leaderboard[0].time / 1000).toFixed(2) + "s" : `${Math.round(leaderboard[0].progress * 100)}%`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {leaderboard[2] && (
                    <div className="flex flex-col items-center w-24 relative">
                      {/* Cột cờ cắm bên phải bục gỗ */}
                      <div className="absolute -top-[52px] -right-3 z-10 scale-90 origin-bottom">
                        <WavingFlagWithPole country={leaderboard[2].country} delay="-0.8s" />
                      </div>
                      <span className="text-xs text-amber-600 font-semibold z-20">{leaderboard[2].country.name}</span>
                      <div className="w-16 bg-slate-800 border-t-2 border-amber-700 h-12 flex flex-col justify-center items-center rounded-t-lg mt-2 shadow-lg z-20">
                        <span className="text-2xl font-black text-amber-600">3</span>
                        <span className="text-[10px] text-slate-400">
                          {leaderboard[2].time ? (leaderboard[2].time / 1000).toFixed(2) + "s" : `${Math.round(leaderboard[2].progress * 100)}%`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-lg transition transform active:scale-95 cursor-pointer text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Chơi Lại
                  </button>

                  {mode === "tournament" && (
                    <button
                      onClick={startNextTournamentTrack}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg transition transform active:scale-95 shadow-md shadow-sky-500/20 text-sm cursor-pointer"
                    >
                      <span>Trận Đấu Tiếp Theo</span>
                      <FastForward className="w-4 h-4 fill-slate-950" />
                    </button>
                  )}

                  {mode === "world_cup" && worldCupStage !== "finished" && (
                    <button
                      onClick={advanceWorldCup}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-100 font-bold rounded-lg transition transform active:scale-95 shadow-md shadow-purple-500/20 text-sm cursor-pointer"
                    >
                      <span>Tiến Vào Vòng Tiếp Theo</span>
                      <FastForward className="w-4 h-4" />
                    </button>
                  )}

                  {mode === "world_cup" && worldCupStage === "finished" && (
                    <button
                      onClick={initWorldCup}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-lg transition transform active:scale-95 shadow-md shadow-amber-500/20 text-sm cursor-pointer"
                    >
                      <span>Khởi Tranh World Cup Mới</span>
                      <Trophy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
