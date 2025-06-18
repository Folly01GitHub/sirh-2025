
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface Contact {
  name?: string;
  email?: string;
  phone?: string;
}

interface ContactsSectionProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

const ContactsSection = ({ contacts, onChange }: ContactsSectionProps) => {
  const addContact = () => {
    if (contacts.length < 5) {
      onChange([...contacts, {}]);
    }
  };

  const removeContact = (index: number) => {
    if (contacts.length > 3) {
      const newContacts = contacts.filter((_, i) => i !== index);
      onChange(newContacts);
    }
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onChange(newContacts);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Contacts Client
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={addContact}
          disabled={contacts.length >= 5}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un contact
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {contacts.map((contact, index) => (
          <div key={index} className="border rounded-lg p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-700">Contact {index + 1}</h4>
              {contacts.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContact(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`contact-name-${index}`}>Nom complet</Label>
                <Input
                  id={`contact-name-${index}`}
                  placeholder="Nom et prénom"
                  value={contact.name || ''}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`contact-email-${index}`}>Email *</Label>
                <Input
                  id={`contact-email-${index}`}
                  type="email"
                  placeholder="email@example.com"
                  value={contact.email || ''}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`contact-phone-${index}`}>Téléphone</Label>
                <Input
                  id={`contact-phone-${index}`}
                  placeholder="+225 XX XX XX XX"
                  value={contact.phone || ''}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContactsSection;
