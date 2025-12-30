import { User } from './user.model';
import { CandidatePipeline } from './pipeline.model';

export interface Interview {
  id?: number;
  candidatePipeline: CandidatePipeline;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: string;
  location?: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  feedback?: string;
  rating?: number;
  interviewers: User[];
  createdAt?: string;
  updatedAt?: string;
}

export const INTERVIEW_TYPES = [
  { value: 'PHONE', label: 'Phone Call' },
  { value: 'VIDEO', label: 'Video Call' },
  { value: 'ONSITE', label: 'On-site' },
  { value: 'TECHNICAL', label: 'Technical Interview' },
  { value: 'HR', label: 'HR Interview' }
];
