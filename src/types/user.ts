export interface UserWithForms {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
  formCount: number;
}