import { environment } from '../environments/environment';

export const API_BASE_URL: string =
  (typeof window !== 'undefined' && (window as any)?.__API_BASE_URL__) ||
  (typeof window !== 'undefined' && localStorage.getItem('api_base_url')) ||
  environment.apiBaseUrl ||
  'http://localhost:8080';

