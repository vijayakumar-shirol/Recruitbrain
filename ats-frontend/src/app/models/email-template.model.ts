export interface EmailTemplate {
  id?: number;
  name: string;
  subject: string;
  body: string;
  category?: string;  // 'interview', 'offer', 'rejection', 'general'
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const EMAIL_TEMPLATE_CATEGORIES = [
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Job Offer' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'general', label: 'General' }
];
