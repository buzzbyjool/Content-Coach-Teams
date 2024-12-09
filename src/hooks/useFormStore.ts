import { create } from 'zustand';
import { Form } from '../types/form';

interface FormStore {
  forms: Form[];
  setForms: (forms: Form[]) => void;
  addForm: (form: Form) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  forms: [],
  setForms: (forms) => set({ forms }),
  addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),
}));