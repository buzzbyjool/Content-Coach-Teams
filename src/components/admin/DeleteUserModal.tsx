import { AlertTriangle, Loader2 } from 'lucide-react';
import { UserWithForms } from '../../types/user';
import { useState } from 'react';

interface DeleteUserModalProps {
  user: UserWithForms;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteUserModal({ user, onClose, onConfirm }: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete User Account
          </h3>
          
          <div className="text-sm text-gray-500 mb-6">
            <p className="mb-2">
              Are you sure you want to delete the user <strong>{user.email}</strong>?
            </p>
            <p className="mb-2">
              This action will:
            </p>
            <ul className="list-disc text-left pl-4 mb-2">
              <li>Permanently delete the user account</li>
              {user.formCount > 0 && (
                <li>Delete all {user.formCount} form{user.formCount === 1 ? '' : 's'} created by this user</li>
              )}
              <li>Remove all associated data</li>
            </ul>
            <p className="font-medium text-red-600">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}