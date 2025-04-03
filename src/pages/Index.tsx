
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import WaveBackground from '@/components/ui/WaveBackground';
import TeamIllustration from '@/components/ui/TeamIllustration';

const Index = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <WaveBackground />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-8 border border-gray-100 animate-slide-up">
          <LoginForm />
        </div>
        
        <TeamIllustration />
      </div>
    </div>
  );
};

export default Index;
