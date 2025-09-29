'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, usuario, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-2xl border-b-4 border-purple-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center py-4 lg:py-0 lg:h-20">
          {/* Logo/Título */}
          <div className="flex items-center mb-4 lg:mb-0">
            <Link href="/" className="text-2xl lg:text-3xl font-black text-white bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              ✨ Pámpanos ✨
            </Link>
          </div>

          {/* Navegación */}
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/mapa"
                  className={`px-3 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl text-sm lg:text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                    isActive('/mapa')
                      ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-lg'
                      : 'text-purple-100 hover:text-white hover:bg-white/20'
                  }`}
                >
                  📍 <span className="hidden sm:inline">Principios del Camino</span>
                  <span className="sm:hidden">Principios</span>
                </Link>
                
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/mapa"
                      className={`px-3 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl text-sm lg:text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                        isActive('/admin/mapa')
                          ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg'
                          : 'text-purple-100 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      ✏️ <span className="hidden sm:inline">Editar Principios</span>
                      <span className="sm:hidden">Editar</span>
                    </Link>
                    <Link
                      href="/admin/usuarios"
                      className={`px-3 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl text-sm lg:text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                        isActive('/admin/usuarios')
                          ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg'
                          : 'text-purple-100 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      👥 <span className="hidden sm:inline">Usuarios</span>
                    </Link>
                  </>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-purple-100 text-sm font-medium">
                    👋 {usuario?.nombre}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 text-purple-100 hover:text-white hover:bg-white/20"
                  >
                    🚪 Salir
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl text-sm lg:text-lg font-bold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-lg"
              >
                🔐 Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
