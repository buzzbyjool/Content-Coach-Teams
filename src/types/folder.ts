export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  isArchived: boolean;
  order: number;
}