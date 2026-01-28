"use client";

import { AuthResponse, LoginData, Usuario } from "@/lib/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedUser: Usuario) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = usuario?.rol === "admin";
  const isAuthenticated = !!usuario;

  // Cargar usuario desde localStorage al inicializar
  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Verificar validez del token en el backend
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const result: AuthResponse = await response.json();

        if (result.success && result.usuario) {
          setUsuario(result.usuario);
          setToken(storedToken);
          localStorage.setItem("usuario", JSON.stringify(result.usuario));
        } else {
          // Token inválido o usuario borrado
          throw new Error("Sesión inválida");
        }
      } catch (error) {
        console.error("Error validando sesión:", error);
        logout(); // Limpiar todo
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.usuario) {
        setUsuario(result.usuario);
        localStorage.setItem("usuario", JSON.stringify(result.usuario));

        if (result.token) {
          setToken(result.token);
          localStorage.setItem("token", result.token);
          document.cookie = `token=${result.token}; path=/; max-age=86400; SameSite=Strict`;
        }

        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        error: "Error de conexión. Intenta nuevamente.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
  };

  const updateUser = (updatedUser: Usuario) => {
    const userCopy = { ...updatedUser }; // Crear copia para asegurar re-render
    setUsuario(userCopy);
    localStorage.setItem("usuario", JSON.stringify(userCopy));
  };

  const value: AuthContextType = {
    usuario,
    token,
    isAdmin,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
