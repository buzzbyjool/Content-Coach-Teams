import { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Pencil, Trash2, Image } from 'lucide-react';
import { Form } from '../types/form';
import { DeleteFormDialog } from '../components/DeleteFormDialog';
import { FormDetailsModal } from '../components/FormDetailsModal';

interface FormListProps {
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
}

export function FormList({ forms, setForms }: FormListProps) {
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const handleDelete = async () => {
    if (!formToDelete?.id) return;

    try {
      await deleteDoc(doc(db, 'forms', formToDelete.id));
      setForms(forms.filter(form => form.id !== formToDelete.id));
      setFormToDelete(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {forms.map((form) => (
          <div key={form.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedForm(form)}
                  className="group flex items-center space-x-4 hover:opacity-75 transition-opacity"
                >
                  {form.logoUrl ? (
                    <img 
                      src={form.logoUrl} 
                      alt={`${form.companyName} logo`}
                      className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-teal-600">
                      {form.companyName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Created on {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/forms/edit/${form.id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => setFormToDelete(form)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteFormDialog
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDelete}
        companyName={formToDelete?.companyName || ''}
      />

      {selectedForm && (
        <FormDetailsModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
    </>
  );
}