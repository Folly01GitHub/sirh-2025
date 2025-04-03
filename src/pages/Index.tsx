
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import WaveBackground from '@/components/ui/WaveBackground';

const Index = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <WaveBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-8 border border-gray-100 animate-slide-up">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
