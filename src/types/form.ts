export interface Form {
  id?: string;
  userId: string;
  clientEmail: string;
  clientAddress: string;
  decisionMaker: string;
  siteCount: number;
  employeeCount: number;
  subActivities: string;
  mainActivity: string;
  website: string;
  idNumber: string;
  companyName: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  lastGoogleReview?: string;
  logoUrl?: string;
  logoPublicId?: string;
  presentationUrl?: string;
  coordinates?: {
    lat: string;
    lon: string;
  };
  folderId?: string | null;
  createdAt: string;
  updatedAt?: string;
  isArchived?: boolean;
}