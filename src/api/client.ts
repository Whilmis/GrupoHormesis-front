export const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Si la respuesta no es OK (ej. 401, 400, 500)
    if (!response.ok) {
      let errorMessage = 'Error en el servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Fallback si no es JSON
      }
      throw new ApiError(response.status, errorMessage);
    }

    // Si hay cuerpo en la respuesta, parsearlo
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (isJson) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Error de red. Verifica tu conexión.');
  }
};

