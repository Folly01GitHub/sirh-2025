
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Upload } from 'lucide-react';
import PasswordInput from './PasswordInput';

// Form schema with validation rules
const formSchema = z.object({
  firstName: z.string().min(2, { message: 'Le prénom doit comporter au moins 2 caractères' }),
  lastName: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères' }),
  email: z.string().email({ message: 'Veuillez saisir une adresse email valide' }),
  department: z.string().min(2, { message: 'Le département est requis' }),
  password: z.string()
    .min(8, { message: 'Le mot de passe doit comporter au moins 8 caractères' })
    .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
    .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une lettre minuscule' })
    .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  step: number;
  onNext: () => void;
  onPrevious: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ step, onNext, onPrevious }) => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  const { formState } = form;
  
  const handleSubmit = (values: FormValues) => {
    console.log('Form values:', values);
    console.log('Profile image:', profileImage);
    onNext();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }
    
    setProfileImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Prénom</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input {...field} placeholder="Jean" />
                      </FormControl>
                      {field.value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {formState.errors.firstName ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nom</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input {...field} placeholder="Dupont" />
                      </FormControl>
                      {field.value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {formState.errors.lastName ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} type="email" placeholder="jean.dupont@exemple.com" />
                    </FormControl>
                    {field.value && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formState.errors.email ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div 
              className={`mt-6 border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative mx-auto w-32 h-32 mb-2">
                  <img 
                    src={previewUrl} 
                    alt="Aperçu du profil" 
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Glissez et déposez votre photo de profil ou</p>
                </>
              )}
              
              <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                <span>{previewUrl ? 'Changer la photo' : 'Parcourir les fichiers'}</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="button" 
                onClick={onNext}
              >
                Étape suivante
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Work Details */}
        {step === 2 && (
          <>
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Département</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} placeholder="Ingénierie, Marketing, RH..." />
                    </FormControl>
                    {field.value && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formState.errors.department ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
              >
                Précédent
              </Button>
              <Button
                type="button"
                onClick={onNext}
              >
                Étape suivante
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Mot de passe</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      {...field} 
                      placeholder="Créez un mot de passe fort" 
                      error={!!formState.errors.password}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      {...field} 
                      placeholder="Confirmez votre mot de passe" 
                      error={!!formState.errors.confirmPassword}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
              >
                Précédent
              </Button>
              <Button
                type="submit"
                className="animate-pulse"
              >
                S'inscrire
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
};

export default RegistrationForm;
