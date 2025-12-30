import { Job } from './job.model';

export interface PipelineStage {
  id?: number;
  job: Job;
  name: string;
  position: number;
  color?: string;
  description?: string;
}

export interface CandidatePipeline {
  id?: number;
  candidate: any; // Full candidate object
  job: Job;
  stage: PipelineStage;
  addedAt?: Date;
  updatedAt?: Date;
  rating?: number;
  matchScore?: number;
  notes?: string;
}
