
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import WaveBackground from '@/components/ui/WaveBackground';
import RegistrationForm from '@/components/auth/RegistrationForm';
import GeometricBackground from '@/components/ui/GeometricBackground';
import { toast } from 'sonner';

const Register = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  const nextStep = () => {
    if (step < 3) {
      const nextStep = step + 1;
      setStep(nextStep);
      setProgress(nextStep * 33);
    } else {
      // Show success dialog on final step submission
      setShowSuccess(true);
      toast.success("Registration successful!");
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      setProgress(prevStep * 33);
    }
  };

  const handleComplete = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <WaveBackground />
      <GeometricBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="w-full bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-8 border border-gray-100 animate-slide-up">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
          
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className={step >= 1 ? "font-medium text-primary" : "text-gray-500"}>Personal Info</span>
              <span className={step >= 2 ? "font-medium text-primary" : "text-gray-500"}>Work Details</span>
              <span className={step >= 3 ? "font-medium text-primary" : "text-gray-500"}>Security</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <RegistrationForm 
            step={step} 
            onNext={nextStep}
            onPrevious={prevStep}
          />

          {/* Success Dialog */}
          <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
            <AlertDialogContent className="animate-scale-in">
              <AlertDialogHeader>
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <AlertDialogTitle className="text-center text-xl">Registration Complete!</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Your account has been successfully created. You can now log in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-center">
                <Button onClick={handleComplete} className="w-full">
                  Go to Login
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default Register;
