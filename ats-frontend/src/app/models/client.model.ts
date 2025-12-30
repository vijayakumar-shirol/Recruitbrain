import { Tag } from './tag.model';

export interface Client {
  id?: number;
  name: string;
  industry?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  status: 'PROSPECT' | 'ACTIVE' | 'INACTIVE';
  logoUrl?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  linkedinUrl?: string;
  owner?: any;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: Tag[];
}
