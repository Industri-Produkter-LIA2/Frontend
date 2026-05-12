/** Same host/port as the page (integrated API + static files). Falls back if `window` is missing. */
export const API_BASE_URL =
  typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/api`
    : 'http://localhost:5088/api';
