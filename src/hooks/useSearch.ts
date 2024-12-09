import { useMemo } from 'react';
import { Form } from '../types/form';

export function useSearch(forms: Form[], query: string) {
  return useMemo(() => {
    if (!query.trim()) {
      return forms;
    }

    const searchTerm = query.toLowerCase().trim();

    return forms.filter((form) => {
      const searchableFields = [
        form.companyName,
        form.clientEmail,
        form.decisionMaker,
        form.mainActivity,
        form.subActivities,
        form.clientAddress,
        form.idNumber,
        form.website
      ];

      return searchableFields.some(
        (field) => field && field.toLowerCase().includes(searchTerm)
      );
    });
  }, [forms, query]);
}