'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, usuario, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || (path !== '/' && pathname?.startsWith(path));
  };

  const navLinks = [
    {
      href: '/mapa',
      label: 'Principios del Camino',
      shortLabel: 'Principios',
      icon: '📍',
      activeClass: 'bg-gradient-to-r from-yellow-400 to-pink-400',
    },
    {
      href: '/planes-lectura',
      label: 'Planes de Lectura',
      shortLabel: 'Planes',
      icon: '📖',
      activeClass: 'bg-gradient-to-r from-orange-400 to-red-400',
    },
  ];

  const adminLinks = isAdmin
    ? [
        {
          href: '/admin/mapa',
          label: 'Editar Principios',
          shortLabel: 'Editar',
          icon: '✏️',
          activeClass: 'bg-gradient-to-r from-green-400 to-emerald-400',
        },
        {
          href: '/admin/usuarios',
          label: 'Usuarios',
          shortLabel: 'Usuarios',
          icon: '👥',
          activeClass: 'bg-gradient-to-r from-blue-400 to-indigo-400',
        },
      ]
    : [];

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg border-b-2 border-purple-400/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo/Título */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="text-xl sm:text-2xl lg:text-3xl font-black text-white bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              ✨ Pámpanos ✨
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Main Navigation Links */}
                <div className="flex items-center gap-2 mr-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive(link.href)
                          ? `${link.activeClass} text-white shadow-md`
                          : 'text-purple-100 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <span className="mr-1.5">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Admin Links Separator */}
                {adminLinks.length > 0 && (
                  <div className="h-6 w-px bg-purple-400/50 mx-2" />
                )}

                {/* Admin Links */}
                {adminLinks.length > 0 && (
                  <div className="flex items-center gap-2 mr-4">
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          isActive(link.href)
                            ? `${link.activeClass} text-white shadow-md`
                            : 'text-purple-100 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        <span className="mr-1.5">{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* User Section */}
                <div className="h-6 w-px bg-purple-400/50 mx-2" />
                <div className="flex items-center gap-3">
                  <span className="text-purple-100 text-sm font-medium px-3 py-1.5 bg-white/10 rounded-lg">
                    👋 {usuario?.nombre}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-purple-100 hover:text-white hover:bg-white/20"
                  >
                    🚪 Salir
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-md hover:shadow-lg hover:scale-105"
              >
                🔐 Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-purple-100 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2 border-t border-purple-400/30 mt-2 pt-4">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive(link.href)
                      ? `${link.activeClass} text-white shadow-md`
                      : 'text-purple-100 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Admin Links */}
            {adminLinks.length > 0 && (
              <>
                <div className="h-px bg-purple-400/30 my-3" />
                <div className="space-y-2">
                  <div className="px-4 text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Administración
                  </div>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive(link.href)
                          ? `${link.activeClass} text-white shadow-md`
                          : 'text-purple-100 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* User Section */}
            <div className="h-px bg-purple-400/30 my-3" />
            <div className="px-4 py-3 bg-white/10 rounded-lg">
              <div className="text-purple-100 text-sm font-medium mb-2">
                👋 {usuario?.nombre}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-purple-100 hover:text-white hover:bg-white/20 transition-colors text-left"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
