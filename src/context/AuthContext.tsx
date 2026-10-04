import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  joinWhatsapp?: boolean;
  role: 'admin' | 'cliente' | 'colaborador';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true); // Empezamos en true para verificar la sesión inicial

  // Efecto inicial para validar el token guardado
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiClient<User>('/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Error al recuperar la sesión:', error);
        // Si el token expiró o es inválido, lo borramos
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient<{ message: string; token: string }>('/auth/login', {
        method: 'POST',
        data,
      });

      setToken(response.token);
      localStorage.setItem('token', response.token);

      // Inmediatamente pedimos los datos del usuario con el nuevo token
      const userData = await apiClient<User>('/auth/me', {
        headers: { Authorization: `Bearer ${response.token}` }
      });
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      await apiClient<{ message: string; user: User }>('/auth/register', {
        method: 'POST',
        data,
      });

      // Ya no hacemos auto-login porque el usuario debe confirmar su correo
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
