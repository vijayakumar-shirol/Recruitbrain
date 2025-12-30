import { Client } from './client.model';
import { Tag } from './tag.model';

export interface Job {
  id?: number;
  client: Client;
  title: string;
  description?: string;
  status: 'OPEN' | 'CLOSED' | 'ON_HOLD';
  location?: string;
  salaryRange?: string;
  experienceRequired?: string;
  skills?: string;
  logoUrl?: string;
  jobCode?: string;
  employmentType?: string;
  headcount?: number;
  department?: string;
  targetDate?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  pipelineTemplateId?: number;
  recruiters?: any[];
  createdAt?: string;
  updatedAt?: string;
  tags?: Tag[];
}
