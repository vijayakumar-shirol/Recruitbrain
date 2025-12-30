import { Tag } from './tag.model';

export interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  experienceYears?: number;
  currentCompany?: string;
  currentPosition?: string;
  skills?: string;
  notes?: string;
  source?: string;
  rating?: number;
  salaryExpectations?: string;
  availableFrom?: string | Date;
  doNotContact?: boolean;
  profilePictureUrl?: string;
  createdAt?: string;
  updatedAt?: Date;
  tags?: Tag[];
}
