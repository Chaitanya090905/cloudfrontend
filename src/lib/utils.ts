import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── API Client ───────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || '';  // Use Render URL if heavily deployed natively to Vercel

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

let authToken = '';

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.message || `API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  setToken(t: string) { authToken = t; },
  getToken() { return authToken; },

  get<T = any>(ep: string) { return request<T>(ep, { method: 'GET' }); },
  post<T = any>(ep: string, body?: any) {
    return request<T>(ep, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  },
  patch<T = any>(ep: string, body?: any) {
    return request<T>(ep, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  },
  put<T = any>(ep: string, body?: any) {
    return request<T>(ep, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  },
  del<T = any>(ep: string) { return request<T>(ep, { method: 'DELETE' }); },

  async download(ep: string, filename: string) {
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}${ep}`, { headers });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  },
};
