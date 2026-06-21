import React from 'react';

export const KolamBackground: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.05,
        transition: 'opacity 0.5s ease',
      }}
      className="kolam-background-container"
    >
      {/* Top Left Kolam */}
      <svg
        width="400"
        height="400"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          color: 'var(--primary)',
        }}
        className="animate-spin-slow"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          d="M 100 20 
             C 120 40, 140 20, 140 50 
             C 140 80, 120 60, 150 100
             C 180 140, 140 120, 100 180
             C 60 120, 20 140, 50 100
             C 80 60, 60 80, 60 50
             C 60 20, 80 40, 100 20 Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          d="M 100 50 A 10 10 0 1 0 100 70 A 10 10 0 1 0 100 50"
        />
        <circle cx="100" cy="100" r="4" fill="currentColor" />
        <circle cx="100" cy="45" r="3" fill="currentColor" />
        <circle cx="100" cy="155" r="3" fill="currentColor" />
        <circle cx="45" cy="100" r="3" fill="currentColor" />
        <circle cx="155" cy="100" r="3" fill="currentColor" />
        
        {/* Additional decorative lines */}
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          d="M 100 10 L 100 190 M 10 100 L 190 100"
        />
      </svg>

      {/* Bottom Right Kolam */}
      <svg
        width="500"
        height="500"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-150px',
          color: 'var(--secondary)',
        }}
        className="animate-spin-slow"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          d="M 100 20 
             C 120 40, 140 20, 140 50 
             C 140 80, 120 60, 150 100
             C 180 140, 140 120, 100 180
             C 60 120, 20 140, 50 100
             C 80 60, 60 80, 60 50
             C 60 20, 80 40, 100 20 Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          d="M 80 100 C 80 80, 120 80, 120 100 C 120 120, 80 120, 80 100 Z"
        />
        <circle cx="100" cy="100" r="5" fill="currentColor" />
        <circle cx="70" cy="70" r="3" fill="currentColor" />
        <circle cx="130" cy="70" r="3" fill="currentColor" />
        <circle cx="70" cy="130" r="3" fill="currentColor" />
        <circle cx="130" cy="130" r="3" fill="currentColor" />
      </svg>
      
      {/* Center Background Watermark Grid */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          backgroundImage: 'radial-gradient(var(--border-color) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
          opacity: 0.4
        }}
      />
    </div>
  );
};
