
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import HRISNavbar from '@/components/hris/HRISNavbar';
import PermissionRequestForm from '@/components/permissions/PermissionRequestForm';

const Permissions = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fc]">
      <HRISNavbar />
      
      <section className="relative px-6 py-12 md:py-16 lg:px-12">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#172b4d] mb-4 animate-fade-in">
              Demande de permission
            </h1>
            <p className="text-lg text-[#5e6c84] max-w-2xl mx-auto animate-fade-in">
              Soumettez votre demande de permission pour une absence temporaire
            </p>
          </div>
          
          <PermissionRequestForm />
        </div>
      </section>
    </div>
  );
};

export default Permissions;
