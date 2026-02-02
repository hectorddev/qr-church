'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, usuario, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path || (path !== '/' && pathname?.startsWith(path));
  };

  const navLinks = [
    {
      href: '/mapa',
      label: 'Principios',
      icon: '📍',
      desktopClass: 'bg-gradient-to-r from-yellow-400 to-pink-400',
    },
    // Planes de lectura temporalmente oculto - pendiente de implementación
    // {
    //   href: '/planes-lectura',
    //   label: 'Planes',
    //   icon: '📖',
    //   desktopClass: 'bg-gradient-to-r from-orange-400 to-red-400',
    // },
    {
      href: '/premios',
      label: 'Premios',
      icon: '🏆',
      desktopClass: 'bg-gradient-to-r from-yellow-400 to-red-400',
    },
  ];

  const adminLinks = isAdmin
    ? [
      {
        href: '/admin/mapa',
        label: 'Editar',
        icon: '✏️',
        desktopClass: 'bg-gradient-to-r from-green-400 to-emerald-400',
      },
      {
        href: '/admin/usuarios',
        label: 'Usuarios',
        icon: '👥',
        desktopClass: 'bg-gradient-to-r from-blue-400 to-indigo-400',
      },
    ]
    : [];

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ================= DESKTOP NAVIGATION (Top Bar) ================= */}
      <nav className="hidden lg:block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg border-b-2 border-purple-400/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link
                href="/"
                className="text-3xl font-black text-white bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent hover:scale-105 transition-transform"
              >
                ✨ Pámpanos ✨
              </Link>
            </div>

            {/* Links */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.href)
                      ? `${link.desktopClass} text-white shadow-md`
                      : 'text-purple-100 hover:text-white hover:bg-white/20'
                      }`}
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Admin Separator */}
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
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.href)
                        ? `${link.desktopClass} text-white shadow-md`
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
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE NAVIGATION ================= */}

      {/* Mobile Top Bar (Solo Logo) */}
      <div className="lg:hidden fixed top-0 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-md z-40 h-16 flex items-center justify-center">
        <Link
          href="/"
          className="text-2xl font-black text-white bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"
        >
          ✨ Pámpanos ✨
        </Link>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-between items-center h-16 px-6">

          {/* Main Links */}
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <span className={`text-2xl mb-0.5 transform transition-transform ${active ? 'scale-110' : ''}`}>
                  {link.icon}
                </span>
                <span className={`text-[10px] font-medium leading-none ${active ? 'font-bold' : ''}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Admin Toggle / User Menu could go here, but fitting 5 items is tight. 
              Let's put Logout/Admin as the last item or separate. 
              If Admin, shows Admin link. If not, shows Logout or User.
          */}

          {isAdmin ? (
            <Link
              href="/admin/usuarios"
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/admin') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <span className="text-2xl mb-0.5">⚙️</span>
              <span className="text-[10px] font-medium leading-none">Admin</span>
            </Link>
          ) : (
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-red-500"
            >
              <span className="text-2xl mb-0.5">🚪</span>
              <span className="text-[10px] font-medium leading-none">Salir</span>
            </button>
          )}

          {/* If Admin, we need a way to Logout too. Maybe Admin takes them to a page where they can logout? 
              Or we just swap the 4th icon. 
              Let's keep it simple: 3 Main + 1 Contextual (Admin or Salir). 
              If Admin wants to logout, they can do it from the Admin dashboard or we add a 5th item.
              Let's add 5th item "Salir" always. 
          */}

          {isAdmin && (
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-red-500"
            >
              <span className="text-2xl mb-0.5">🚪</span>
              <span className="text-[10px] font-medium leading-none">Salir</span>
            </button>
          )}

        </div>
      </div>
    </>
  );
}
