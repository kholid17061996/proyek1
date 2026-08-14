'use client'

import { useState, useEffect } from 'react'

export default function BackgroundEffects() {
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<any[]>([])
  const [fireworks, setFireworks] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    
    // Background floating particles
    setParticles(Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 15}s`,
      animationDuration: `${10 + Math.random() * 10}s`,
      size: `${25 + Math.random() * 35}px`,
    })))

    // Firework embers cluster
    setFireworks(Array.from({ length: 60 }).map((_, i) => {
      const distance = Math.pow(Math.random(), 1.5) * -45; // trail length up to 45 units behind
      const spread = (Math.random() - 0.5) * (Math.abs(distance) * 0.6 + 1.5); // wide scattering cone
      const isGold = Math.random() > 0.4;
      const dur = 0.15 + Math.random() * 0.35;
      const delay = Math.random() * 0.5;
      const size = 0.1 + Math.random() * 0.35;
      
      return {
        id: i,
        cx: distance,
        cy: spread,
        r: size,
        fill: isGold ? '#f8d21c' : '#ffffff',
        dur: `${dur}s`,
        delay: `${delay}s`
      }
    }))
  }, [])

  return (
    <>
      {/* Background Particles (Emas) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-emas rounded-full opacity-0 animate-float-up shadow-[0_0_8px_rgba(248,210,28,0.6)]"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Shooting Star (Meteor) - SVG approach for perfect smooth curve */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full absolute top-0 left-0">
          <defs>
            <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g>
            <animate 
              attributeName="opacity" 
              values="0; 1; 1; 0" 
              keyTimes="0; 0.15; 0.85; 1" 
              dur="8s" 
              repeatCount="indefinite" 
            />

            {/* Longest, faintest tail */}
            <path d="M -30 110 Q 50 -40 130 110" fill="none" stroke="#f8d21c" strokeOpacity="0.3" pathLength="100" strokeDasharray="25 100" strokeLinecap="round" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="25; -75" dur="8s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.1; 0.4; 0.2" keyTimes="0; 0.5; 1" dur="8s" repeatCount="indefinite" />
            </path>

            {/* Medium tail */}
            <path d="M -30 110 Q 50 -40 130 110" fill="none" stroke="#f8d21c" strokeOpacity="0.7" pathLength="100" strokeDasharray="12 100" strokeLinecap="round" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="12; -88" dur="8s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.2; 0.8; 0.3" keyTimes="0; 0.5; 1" dur="8s" repeatCount="indefinite" />
            </path>

            {/* Shortest, brightest tail */}
            <path d="M -30 110 Q 50 -40 130 110" fill="none" stroke="#ffffff" pathLength="100" strokeDasharray="3 100" strokeLinecap="round" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="3; -97" dur="8s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="0.3; 1.5; 0.5" keyTimes="0; 0.5; 1" dur="8s" repeatCount="indefinite" />
            </path>

            {/* The Bulb (Head) and Firework Sparkles */}
            <g>
              <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path="M -30 110 Q 50 -40 130 110" />
              
              <g>
                <animateTransform attributeName="transform" type="scale" values="0.2; 1.5; 0.5" keyTimes="0; 0.5; 1" dur="8s" repeatCount="indefinite" />
                
                {/* Head Core */}
                <circle cx="0" cy="0" r="0.8" fill="#ffffff" filter="url(#glow)" />
                
                {/* Magical Starburst Flares on Head */}
                <path d="M 0 -3 L 0 3 M -3 0 L 3 0" stroke="#ffffff" strokeWidth="0.1" strokeLinecap="round" filter="url(#glow)">
                  <animateTransform attributeName="transform" type="rotate" values="0;-90" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="0.2s" repeatCount="indefinite" />
                </path>
                <path d="M -2 -2 L 2 2 M -2 2 L 2 -2" stroke="#f8d21c" strokeWidth="0.2" strokeLinecap="round" filter="url(#glow)">
                  <animateTransform attributeName="transform" type="rotate" values="0;90" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.3;1" dur="0.25s" repeatCount="indefinite" />
                </path>
                
                {/* Firework Embers (Scattering cone shape) */}
                {fireworks.map(f => (
                  <circle key={f.id} cx={f.cx} cy={f.cy} r={f.r} fill={f.fill} filter="url(#glow)">
                    <animate attributeName="opacity" values="1;0;1" dur={f.dur} begin={f.delay} repeatCount="indefinite" />
                    <animate attributeName="r" values={`${f.r * 0.3};${f.r * 1.5};${f.r * 0.3}`} dur={f.dur} begin={f.delay} repeatCount="indefinite" />
                  </circle>
                ))}
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Abstract Waves at the bottom (White/Grey Gradient) */}
      <div className="fixed bottom-0 w-full opacity-30 z-0 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#ffffff" fillOpacity="0.4" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,208C960,224,1056,224,1152,202.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#ffffff" fillOpacity="0.7" d="M0,96L48,122.7C96,149,192,203,288,208C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,245.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </>
  )
}
