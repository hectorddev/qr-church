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
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = usuario?.rol === "admin";
  const isAuthenticated = !!usuario;

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
          setUsuario(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        localStorage.removeItem("usuario");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
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
    localStorage.removeItem("usuario");
  };

  const updateUser = (updatedUser: Usuario) => {
    setUsuario(updatedUser);
    localStorage.setItem("usuario", JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    usuario,
    isAdmin,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
