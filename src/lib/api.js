// src/lib/api.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
});

// ── Request interceptor — attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle auth errors ─────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Typed API helpers ─────────────────────────────────────────────────────────
export const authAPI = {
  me:     ()          => api.get('/auth/me'),
  logout: ()          => api.post('/auth/logout'),
};

export const workspaceAPI = {
  list:   ()          => api.get('/workspaces'),
  create: (data)      => api.post('/workspaces', data),
  get:    (id)        => api.get(`/workspaces/${id}`),
  update: (id, data)  => api.patch(`/workspaces/${id}`, data),
  delete: (id)        => api.delete(`/workspaces/${id}`),
  invite: (id, data)  => api.post(`/workspaces/${id}/invite`, data),
};

export const ragAPI = {
  query:   (data)     => api.post('/rag/query', data),
  history: (wsId, limit = 20) => api.get('/rag/history', { params: { workspaceId: wsId, limit } }),
  stats:   (wsId)     => api.get('/rag/stats', { params: { workspaceId: wsId } }),
};

export const ingestAPI = {
  file:       (formData)    => api.post('/ingest/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  logs:       (data)        => api.post('/ingest/logs', data),
  text:       (data)        => api.post('/ingest/text', data),
  documents:  (wsId)        => api.get('/ingest/documents', { params: { workspaceId: wsId } }),
  messages:   (wsId, opts)  => api.get('/ingest/messages', { params: { workspaceId: wsId, ...opts } }),
  deleteDoc:  (id, wsId)    => api.delete(`/ingest/documents/${id}`, { params: { workspaceId: wsId } }),
};

export const githubAPI = {
  listRepos:    (wsId)  => api.get('/github/repos', { params: { workspaceId: wsId } }),
  addRepo:      (data)  => api.post('/github/repos', data),
  removeRepo:   (id, wsId) => api.delete(`/github/repos/${id}`, { params: { workspaceId: wsId } }),
  reanalyze:    (id, wsId) => api.post(`/github/repos/${id}/reanalyze`, { workspaceId: wsId }),
  listPRs:      (wsId)  => api.get('/github/prs', { params: { workspaceId: wsId } }),
  myRepos:      ()      => api.get('/github/repos/user'),
};

export const deployAPI = {
  trigger:   (data)    => api.post('/deploy', data),
  list:      (wsId)    => api.get('/deploy', { params: { workspaceId: wsId } }),
  get:       (id)      => api.get(`/deploy/${id}`),
  envPreview:(repoId, wsId) => api.get('/deploy/env-preview', { params: { repoId, workspaceId: wsId } }),
  cancel:    (id, wsId)=> api.post(`/deploy/${id}/cancel`, {}, { params: { workspaceId: wsId } }),
};

export const debugAPI = {
  errors:    (wsId, opts) => api.get('/debug/errors', { params: { workspaceId: wsId, ...opts } }),
  getError:  (id)         => api.get(`/debug/errors/${id}`),
  ingest:    (data)       => api.post('/debug/ingest', data),
  fix:       (data)       => api.post('/debug/fix', data),
  fixes:     (wsId)       => api.get('/debug/fixes', { params: { workspaceId: wsId } }),
  createPR:  (data)       => api.post('/debug/pr', data),
  dismiss:   (id, wsId)   => api.delete(`/debug/errors/${id}`, { params: { workspaceId: wsId } }),
};

export const telegramAPI = {
  connect:    (data)  => api.post('/telegram/connect', data),
  disconnect: (data)  => api.post('/telegram/disconnect', data),
  status:     (wsId)  => api.get('/telegram/status', { params: { workspaceId: wsId } }),
};