const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;

  // En producción (cuando el navegador no está en localhost), usar el backend de Railway
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return 'https://hormesis-back-production.up.railway.app/api';
    }
  }

  return 'http://localhost:3000/api';
};

export const BASE_URL = getBaseUrl();

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  data?: any;
}

export const apiClient = async <T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { data, headers: customHeaders, ...customConfig } = options;
  
  const token = localStorage.getItem('token');
  const isPublicAuth = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/session') || endpoint.startsWith('/auth/register');
  
  const headers: Record<string, string> = {
    ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token && !isPublicAuth ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Si la respuesta no es OK (ej. 401, 400, 429, 500)
    if (!response.ok) {
      let errorMessage = response.status === 429
        ? 'El servidor está recibiendo demasiadas solicitudes (429). Espera unos segundos e inténtalo de nuevo.'
        : 'Error en el servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Fallback si no es JSON
      }
      throw new ApiError(response.status, errorMessage);
    }

    // Si hay cuerpo en la respuesta, parsearlo de forma segura
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (isJson) {
      const rawText = await response.text();
      const trimmed = rawText.trim();
      if (!trimmed) return {} as T;
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        throw new ApiError(500, 'La respuesta del servidor se interrumpió antes de completarse. Por favor inténtalo de nuevo.');
      }
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Error de red. Verifica tu conexión.');
  }
};

