import React from 'react';

interface DeviceMockupProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  children,
  style,
  width = 380,
  height = 780,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: 54,
        padding: 10,
        background: 'linear-gradient(145deg, #3a3a3e 0%, #1c1c1f 50%, #2e2e32 100%)',
        boxShadow:
          '0 50px 120px rgba(0, 0, 0, 0.85), 0 0 0 2px rgba(255, 255, 255, 0.12) inset, 0 0 40px rgba(255, 102, 196, 0.08)',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Dynamic Island pill */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 104,
          height: 30,
          backgroundColor: '#000000',
          borderRadius: 18,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          boxShadow: '0 0 1px rgba(255,255,255,0.2)',
        }}
      >
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            backgroundColor: '#0d1322',
            border: '1px solid #1a2238',
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#080808',
          }}
        />
      </div>

      {/* Screen Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 44,
          backgroundColor: '#09090b',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.9)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
