import { request } from './api';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface SupportTicketReply {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  attachments?: Attachment[] | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

export interface SupportTicket {
  id: number;
  tenant_id: number | null;
  user_id: number;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: Attachment[] | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  tenant?: {
    id: number;
    name: string;
    slug: string;
  };
  replies?: SupportTicketReply[];
}

// Support Attachment Upload
export function uploadSupportAttachment(portal: 'gym' | 'super-admin', file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  return request(`/api/${portal}/support/upload`, {
    method: 'POST',
    body: formData,
  });
}

// Gym Admin API
export function getGymTickets(page = 1) {
  return request('/api/gym/support/tickets', { method: 'GET' }, { page });
}

export function createGymTicket(data: { subject: string; description: string; priority: string; attachments?: Attachment[] }) {
  return request('/api/gym/support/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getGymTicket(id: number) {
  return request(`/api/gym/support/tickets/${id}`, { method: 'GET' });
}

export function replyGymTicket(id: number, message: string, attachments?: Attachment[]) {
  return request(`/api/gym/support/tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message, attachments }),
  });
}

// Super Admin API
export function getSuperAdminTickets(params: { page?: number; status?: string; priority?: string } = {}) {
  return request('/api/super-admin/support/tickets', { method: 'GET' }, params);
}

export function getSuperAdminTicket(id: number) {
  return request(`/api/super-admin/support/tickets/${id}`, { method: 'GET' });
}

export function replySuperAdminTicket(id: number, message: string, status?: string, attachments?: Attachment[]) {
  return request(`/api/super-admin/support/tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message, status, attachments }),
  });
}

export function updateSuperAdminTicketStatus(id: number, status: string) {
  return request(`/api/super-admin/support/tickets/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
