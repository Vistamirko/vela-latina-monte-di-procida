"use client";

import React from "react";

/**
 * Rosa dei Venti geometrica cartografica (stile Istituto Idrografico della Marina)
 * Discreta, in filigrana, non invasiva (opacità controllata)
 */
export function NauticalCompassRose({
  className = "w-96 h-96 text-[#0a1c2a]/10",
  showRays = true,
}: {
  className?: string;
  showRays?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Raggi lossodromici estesi (Rhumb lines) */}
      {showRays && (
        <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 5" opacity="0.6">
          {/* Assi principali */}
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="0" y1="200" x2="400" y2="200" />
          {/* Diagonali a 45° */}
          <line x1="58.6" y1="58.6" x2="341.4" y2="341.4" />
          <line x1="58.6" y1="341.4" x2="341.4" y2="58.6" />
          {/* Raggi intermedi a 22.5° */}
          <line x1="123.4" y1="15.2" x2="276.6" y2="384.8" />
          <line x1="276.6" y1="15.2" x2="123.4" y2="384.8" />
          <line x1="15.2" y1="123.4" x2="384.8" y2="276.6" />
          <line x1="15.2" y1="276.6" x2="384.8" y2="123.4" />
        </g>
      )}

      {/* Cerchi concentrici graduati */}
      <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="200" cy="200" r="70" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="200" cy="200" r="24" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="200" cy="200" r="3" fill="currentColor" />

      {/* Zecche di gradazione ogni 10 gradi */}
      {Array.from({ length: 36 }).map((_, i) => {
        const deg = i * 10;
        const rad = (deg * Math.PI) / 180;
        const isCardinal = deg % 90 === 0;
        const isSemi = deg % 30 === 0;
        const innerR = isCardinal ? 142 : isSemi ? 146 : 153;
        const outerR = 160;
        const x1 = 200 + innerR * Math.sin(rad);
        const y1 = 200 - innerR * Math.cos(rad);
        const x2 = 200 + outerR * Math.sin(rad);
        const y2 = 200 - outerR * Math.cos(rad);
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={isCardinal ? 1.2 : 0.6}
          />
        );
      })}

      {/* Indicazioni cardinali N, E, S, W */}
      <text x="200" y="32" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace" letterSpacing="0.2em">N</text>
      <text x="372" y="204" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace" letterSpacing="0.2em">E</text>
      <text x="200" y="378" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace" letterSpacing="0.2em">S</text>
      <text x="28" y="204" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace" letterSpacing="0.2em">W</text>

      {/* Stella a 8 punte della rosa centrale */}
      <path
        d="M200 80 L208 185 L285 160 L215 208 L280 280 L208 215 L160 285 L185 208 L80 200 L185 192 L115 115 L192 185 Z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="currentColor"
        fillOpacity="0.04"
      />
      <polygon points="200,80 200,200 208,185" fill="currentColor" fillOpacity="0.3" />
      <polygon points="200,320 200,200 192,215" fill="currentColor" fillOpacity="0.3" />
      <polygon points="320,200 200,200 215,192" fill="currentColor" fillOpacity="0.3" />
      <polygon points="80,200 200,200 185,208" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

/**
 * Linee batimetriche (isobate) e sonde di profondità tipiche delle acque di Monte di Procida
 */
export function NauticalBathymetry({
  className = "w-full h-48 text-[#1b5b80]/15",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1000 240"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Isobata -5m (costiera) */}
      <path
        d="M0 45 C180 30, 320 70, 500 55 C680 40, 840 65, 1000 48"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="4 4"
      />
      <text x="120" y="40" fill="currentColor" fontSize="8" fontFamily="monospace">
        -5m
      </text>

      {/* Isobata -10m */}
      <path
        d="M0 95 C160 85, 340 125, 520 105 C700 85, 860 115, 1000 100"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <text x="460" y="100" fill="currentColor" fontSize="8" fontFamily="monospace">
        -10m
      </text>

      {/* Isobata -20m */}
      <path
        d="M0 150 C200 135, 360 175, 540 160 C720 145, 880 180, 1000 165"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="6 3"
      />
      <text x="780" y="155" fill="currentColor" fontSize="8" fontFamily="monospace">
        -20m
      </text>

      {/* Isobata -50m (Canale di Procida) */}
      <path
        d="M0 205 C190 190, 380 230, 580 215 C760 200, 910 225, 1000 215"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <text x="280" y="210" fill="currentColor" fontSize="8" fontFamily="monospace">
        -50m
      </text>

      {/* Sonde batimetriche sparse (soundings in metri e decimi) */}
      <g fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.85">
        <text x="65" y="75">7<tspan fontSize="6" dy="-2">₅</tspan></text>
        <text x="210" y="130">14</text>
        <text x="390" y="80">11<tspan fontSize="6" dy="-2">₂</tspan></text>
        <text x="640" y="135">18</text>
        <text x="820" y="90">9<tspan fontSize="6" dy="-2">₈</tspan></text>
        <text x="150" y="180">28</text>
        <text x="440" y="185">34</text>
        <text x="710" y="195">42</text>
        <text x="920" y="145">22</text>
      </g>

      {/* Simbolo di fondale: S = sabbia, F = fango, R = roccia */}
      <g fill="currentColor" fontSize="7" fontFamily="monospace" opacity="0.6">
        <text x="235" y="130">s (sabbia)</text>
        <text x="665" y="135">r (tufo)</text>
        <text x="465" y="185">f/s</text>
      </g>
    </svg>
  );
}

/**
 * Scala graduata nautica per i bordi delle sezioni (bordatura millimetrata stile carta nautica)
 */
export function NauticalBorderRuler({
  className = "w-full text-slate-400/40",
  coordinate = "40° 47′ N",
}: {
  className?: string;
  coordinate?: string;
}) {
  return (
    <div
      className={`w-full flex items-center justify-between border-t border-b border-slate-200/70 py-1 font-mono text-[8px] uppercase tracking-widest select-none ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 opacity-60">
        <span className="inline-block w-1.5 h-1.5 border border-current" />
        <span>0.0 NM</span>
      </div>

      <div className="flex-1 mx-4 flex items-center justify-between overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={`inline-block ${
              i % 4 === 0 ? "h-2 w-[1px] bg-slate-400" : "h-1 w-[1px] bg-slate-300"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1b5b80]/40" />
        <span>{coordinate}</span>
      </div>

      <div className="flex-1 mx-4 flex items-center justify-between overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={`inline-block ${
              i % 4 === 0 ? "h-2 w-[1px] bg-slate-400" : "h-1 w-[1px] bg-slate-300"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 opacity-60">
        <span>1.0 NM (1852m)</span>
        <span className="inline-block w-1.5 h-1.5 border border-current" />
      </div>
    </div>
  );
}

/**
 * Cartiglio di carta nautica / Identificativo cartografico
 */
export function NauticalCartouche({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 px-3 py-1.5 border border-slate-200/80 bg-white/60 backdrop-blur-xs font-mono text-[8px] uppercase tracking-[0.22em] text-slate-500 select-none ${className}`}
    >
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[#0a1c2a]" />
        <span className="font-semibold text-[#0a1c2a]">I.I.M. N. 10</span>
      </div>
      <span className="text-slate-300">|</span>
      <span>Canale di Procida & Acquamorta</span>
      <span className="text-slate-300">|</span>
      <span>Scala 1:25 000</span>
    </div>
  );
}

/**
 * Piccolo mirino di coordinate nautiche (+ crocetta e coordinate)
 */
export function NauticalCrosshair({
  coords = "40°47.7′N · 14°03.1′E",
  label = "Pt. Cospicuo",
  className = "",
}: {
  coords?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-slate-500 select-none ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#1b5b80]">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="0.8" />
        <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="0.8" />
        <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      </svg>
      <span>{label}</span>
      <span className="text-slate-400">[{coords}]</span>
    </div>
  );
}
