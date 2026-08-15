'use client'

import { useState, useEffect } from 'react'

export default function BackgroundEffects() {
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<any[]>([])
  const [fireworks, setFireworks] = useState<any[]>([])
  const [meteorPath, setMeteorPath] = useState("M -30 110 Q 50 -40 130 110")
  const [meteorKey, setMeteorKey] = useState(0)

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
      const distance = Math.pow(Math.random(), 1.5) * -45;
      const spread = (Math.random() - 0.5) * (Math.abs(distance) * 0.6 + 1.5);
      const dur = 0.15 + Math.random() * 0.35;
      const delay = Math.random() * 0.5;
      const size = 0.1 + Math.random() * 0.35;
      
      const fireColors = ['#ffffff', '#ffaa00', '#ff4500', '#ff8c00'];
      const fill = fireColors[Math.floor(Math.random() * fireColors.length)];
      
      return {
        id: i,
        cx: distance,
        cy: spread,
        r: size,
        fill: fill,
        dur: `${dur}s`,
        delay: `${delay}s`
      }
    }))

    // Meteor logic
    const paths = [
      "M -30 110 Q 50 -40 130 110", // Bottom-left to top-right
      "M 130 110 Q 50 -40 -30 110", // Bottom-right to top-left
      "M -30 -10 Q 50 140 130 -10", // Top-left to bottom-right
      "M 130 -10 Q 50 140 -30 -10", // Top-right to bottom-left
      "M -30 50 Q 50 -20 130 80",   // Left to right
      "M 130 50 Q 50 120 -30 20",   // Right to left
    ]

    const interval = setInterval(() => {
      setMeteorPath(paths[Math.floor(Math.random() * paths.length)])
      setMeteorKey(prev => prev + 1)
    }, 3000)

    return () => clearInterval(interval)
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
        <svg key={meteorKey} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full absolute top-0 left-0">
          <defs>
            <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="heavyGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
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
              dur="3s" 
              repeatCount="1" 
            />

            {/* Longest, faintest tail */}
            <path d={meteorPath} fill="none" stroke="#ff4500" strokeOpacity="0.3" pathLength="100" strokeDasharray="25 100" strokeLinecap="round" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="25; -75" dur="3s" repeatCount="1" />
              <animate attributeName="stroke-width" values="0.1; 0.6; 0.2" keyTimes="0; 0.5; 1" dur="3s" repeatCount="1" />
            </path>

            {/* Medium tail */}
            <path d={meteorPath} fill="none" stroke="#ff8c00" strokeOpacity="0.7" pathLength="100" strokeDasharray="12 100" strokeLinecap="round" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="12; -88" dur="3s" repeatCount="1" />
              <animate attributeName="stroke-width" values="0.2; 1.0; 0.3" keyTimes="0; 0.5; 1" dur="3s" repeatCount="1" />
            </path>

            {/* Shortest, brightest tail */}
            <path d={meteorPath} fill="none" stroke="#ffffff" pathLength="100" strokeDasharray="3 100" strokeLinecap="round" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="3; -97" dur="3s" repeatCount="1" />
              <animate attributeName="stroke-width" values="0.3; 1.8; 0.5" keyTimes="0; 0.5; 1" dur="3s" repeatCount="1" />
            </path>

            {/* The Meteor Rock and Fiery Head */}
            <g>
              <animateMotion dur="3s" repeatCount="1" rotate="auto" path={meteorPath} />
              
              <g>
                <animateTransform attributeName="transform" type="scale" values="0.3; 1.5; 0.6" keyTimes="0; 0.5; 1" dur="3s" repeatCount="1" />
                
                {/* Glowing Plasma surrounding the rock */}
                <ellipse cx="0" cy="0" rx="2" ry="1.2" fill="#ff4500" filter="url(#heavyGlow)" opacity="0.6" />
                <ellipse cx="0.5" cy="0" rx="1.5" ry="0.8" fill="#ffaa00" filter="url(#glow)" opacity="0.9" />
                <ellipse cx="0.8" cy="0" rx="0.8" ry="0.5" fill="#ffffff" filter="url(#glow)" />
                
                {/* The Rock (Asteroid) */}
                <polygon points="1.2,0 0.5,-0.8 -0.8,-0.9 -1.5,-0.3 -1.2,0.6 -0.2,1" fill="#4a4036" />
                <polygon points="0.5,-0.5 -0.5,-0.6 -0.8,-0.1 -0.2,0.5" fill="#2b251f" />
                
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
