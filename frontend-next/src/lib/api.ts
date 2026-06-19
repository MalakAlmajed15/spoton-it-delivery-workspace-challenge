const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export type LoginResponse = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
};

export type ScoreSummary = {
  total: number;
  events: Array<{ id: string; action: string; points: number; createdAt: string }>;
};

export type WorkspaceSummary = {
  counts: {
    workItems: number;
    qaChecks: number;
    releases: number;
  };
};

export type QaCheck = {
  id: string;
  workItemId: string;
  title: string;
  expectedResult: string;
  actualResult: string;
  status: string;
  createdAt: string;
};

export type WorkItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  qaChecks: QaCheck[];
};

export type ReadinessItem = WorkItem & {
  blockers: string[];
  readiness: 'ready' | 'blocked';
};

export type Release = {
  id: string;
  version: string;
  summary: string | null;
  status: string;
  releasedAt: string | null;
  createdAt: string;
  releaseItems: Array<{ id: string; workItemId: string;workItem: WorkItem }>;
};

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('spoton_challenge_token');
}

export function saveToken(token: string) {
  window.localStorage.setItem('spoton_challenge_token', token);
}

export function clearToken() {
  window.localStorage.removeItem('spoton_challenge_token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message ?? 'Request failed');
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<LoginResponse['user']>('/auth/me'),
  score: () => request<ScoreSummary>('/score/me'),
  workspaceSummary: () => request<WorkspaceSummary>('/it-workspace/summary'),
  releaseReadiness: () => request<ReadinessItem[]>('/it-workspace/release-readiness'),
 workItems: (filters?: { status?: string; priority?: string; assignee?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.assignee) params.set('assignee', filters.assignee);
    const qs = params.toString();
    return request<WorkItem[]>(`/it-workspace/work-items${qs ? `?${qs}` : ''}`);
  },
  workItem: (id: string) => request<WorkItem>(`/it-workspace/work-items/${id}`),
  createWorkItem: (data: Partial<WorkItem>) =>
    request<WorkItem>('/it-workspace/work-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateWorkItem: (id: string, data: Partial<WorkItem>) =>
    request<WorkItem>(`/it-workspace/work-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  transitionWorkItem: (id: string, status: string) =>
    request<WorkItem>(`/it-workspace/work-items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteWorkItem: (id: string) =>
    request<void>(`/it-workspace/work-items/${id}`, { method: 'DELETE' }),


  qaChecks: (workItemId: string) =>
    request<QaCheck[]>(`/it-workspace/work-items/${workItemId}/qa-checks`),
  createQaCheck: (workItemId: string, data: { title: string; expectedResult: string }) =>
    request<QaCheck>(`/it-workspace/work-items/${workItemId}/qa-checks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateQaCheck: (id: string, data: { actualResult?: string; status?: string }) =>
    request<QaCheck>(`/it-workspace/qa-checks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteQaCheck: (id: string) =>
    request<void>(`/it-workspace/qa-checks/${id}`, { method: 'DELETE' }),


  releases: () => request<Release[]>('/it-workspace/releases'),
  release: (id: string) => request<Release>(`/it-workspace/releases/${id}`),
  createRelease: (data: { version: string; summary?: string }) =>
    request<Release>('/it-workspace/releases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addWorkItemToRelease: (releaseId: string, workItemId: string) =>
    request(`/it-workspace/releases/${releaseId}/work-items`, {
      method: 'POST',
      body: JSON.stringify({ workItemId }),
    }),
  removeWorkItemFromRelease: (releaseId: string, workItemId: string) =>
    request(`/it-workspace/releases/${releaseId}/work-items/${workItemId}`, {
      method: 'DELETE',
    }),
  deployRelease: (releaseId: string) =>
    request<Release>(`/it-workspace/releases/${releaseId}/deploy`, { method: 'POST' }),
};
