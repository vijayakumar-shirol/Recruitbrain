export interface Activity {
  id?: number;
  relatedType: 'CLIENT' | 'JOB' | 'CANDIDATE';
  relatedId: number;
  type: 'NOTE' | 'EMAIL' | 'CALL' | 'MEETING' | 'STATUS_CHANGE';
  content: string;
  createdBy?: string;
  createdAt?: Date;
}
