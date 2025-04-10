
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const Settings = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        <div className="glass-card p-6 rounded-lg">
          <p className="text-gray-600">Les paramètres administrateur seront disponibles ici.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
