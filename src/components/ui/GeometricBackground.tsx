
import React from 'react';

const GeometricBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 opacity-20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {/* Animated circles */}
        <div className="absolute top-[10%] left-[10%] w-40 h-40 rounded-full bg-blue-300 animate-float" />
        <div className="absolute top-[60%] left-[80%] w-60 h-60 rounded-full bg-indigo-300 animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Animated squares */}
        <div className="absolute top-[30%] left-[60%] w-32 h-32 rotate-12 bg-purple-300 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] left-[20%] w-24 h-24 rotate-45 bg-pink-300 animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Animated triangles using SVG */}
        <svg className="absolute top-[50%] left-[30%] w-32 h-32 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '1.5s' }}>
          <polygon points="50,10 90,90 10,90" fill="rgba(168, 85, 247, 0.4)" />
        </svg>
        
        <svg className="absolute top-[15%] left-[70%] w-24 h-24 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '2.5s' }}>
          <polygon points="50,10 90,90 10,90" fill="rgba(236, 72, 153, 0.4)" />
        </svg>
      </div>
    </div>
  );
};

export default GeometricBackground;
