const DEFAULT_API_BASE_URL = 'http://localhost:3001';

const normalizedBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export const API_BASE_URL = normalizedBaseUrl;

export function getApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
