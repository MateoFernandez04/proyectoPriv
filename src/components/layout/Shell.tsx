import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SocratesLogo } from '../ui/SocratesLogo';
import { InitialsAvatar } from '../ui/Table';
import {
  Layers,
  GraduationCap,
  Users,
  FolderKanban,
  UserCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  BookOpen,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, switchMockRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Ítems de navegación según el rol
  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    if (user.is_super_admin) {
      return [
        { label: 'Comisiones', path: '/comisiones', icon: Layers },
        { label: 'Usuarios', path: '/usuarios', icon: Users },
        { label: 'Equipos de trabajo', path: '/equipos', icon: FolderKanban },
      ];
    }

    if (user.role === 'professor') {
      return [
        { label: 'Estudiantes', path: '/estudiantes', icon: GraduationCap },
        { label: 'Equipos de trabajo', path: '/equipos', icon: FolderKanban },
      ];
    }

    // Alumno
    return [
      { label: 'Equipos de trabajo', path: '/equipos', icon: FolderKanban },
    ];
  };

  const navItems = getNavItems();

  // Obtener título de la página actual para la barra superior
  const getPageTitle = (): string => {
    const current = navItems.find(
      (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
    );
    if (current) return current.label;
    if (location.pathname === '/perfil') return 'Mi perfil';
    if (location.pathname === '/estudiantes/nuevo') return 'Registrar estudiantes';
    if (location.pathname === '/') return 'Inicio';
    return 'Sócrates';
  };

  const roleLabel = user?.is_super_admin
    ? 'Super administrador'
    : user?.role === 'professor'
    ? 'Profesor'
    : 'Alumno';

  const fullName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <div className="min-h-screen flex bg-[#F5F9FF] text-[#0F1F3D]">
      {/* ========================================================= */}
      {/* Sidebar de escritorio (ancho 264px, fondo #EFF6FF)       */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-[264px] bg-[#EFF6FF] border-r border-[#D6E4F7] fixed inset-y-0 left-0 z-30 select-none">
        {/* Cabecera Sidebar: Logo Sócrates */}
        <div className="h-16 px-6 flex items-center border-b border-[#D6E4F7]/60">
          <NavLink to="/" className="flex items-center gap-3">
            <SocratesLogo size="sm" showText={true} />
          </NavLink>
        </div>

        {/* Lista de navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-[#1D4ED8] shadow-xs'
                      : 'text-[#51607A] hover:bg-[#E0F2FE]/70 hover:text-[#0F1F3D]'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Selector de rol para revisión rápida (útil para verificar P3, P5-P10) */}
        <div className="px-4 py-2 border-t border-[#D6E4F7]/60 bg-[#EFF6FF]/70">
          <div className="text-[11px] font-semibold text-[#51607A] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#1D4ED8]" />
            <span>Rol en vista</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <button
              type="button"
              onClick={() => switchMockRole('superadmin')}
              className={`py-1 px-1.5 rounded text-center transition-colors font-medium truncate ${
                user?.is_super_admin
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-white text-[#51607A] border border-[#D6E4F7] hover:bg-[#E0F2FE]'
              }`}
              title="Super administrador"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => switchMockRole('professor')}
              className={`py-1 px-1.5 rounded text-center transition-colors font-medium truncate ${
                user?.role === 'professor' && !user.is_super_admin
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-white text-[#51607A] border border-[#D6E4F7] hover:bg-[#E0F2FE]'
              }`}
              title="Profesor regular"
            >
              Profesor
            </button>
            <button
              type="button"
              onClick={() => switchMockRole('student')}
              className={`py-1 px-1.5 rounded text-center transition-colors font-medium truncate ${
                user?.role === 'student'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-white text-[#51607A] border border-[#D6E4F7] hover:bg-[#E0F2FE]'
              }`}
              title="Alumno"
            >
              Alumno
            </button>
          </div>
        </div>

        {/* Pie de Sidebar: Usuario y Menú */}
        <div className="p-4 border-t border-[#D6E4F7] relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#E0F2FE] transition-colors text-left cursor-pointer"
            aria-expanded={isUserMenuOpen}
            aria-label="Menú de usuario"
          >
            <InitialsAvatar name={fullName} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#0F1F3D] truncate">
                {fullName}
              </div>
              <div className="text-xs text-[#51607A] truncate">
                {roleLabel}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#51607A] shrink-0" />
          </button>

          {/* Menú desplegable con "Mi perfil" y "Cerrar sesión" */}
          {isUserMenuOpen && (
            <div className="absolute bottom-20 left-4 right-4 bg-white border border-[#D6E4F7] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/perfil');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0F1F3D] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer text-left"
              >
                <User className="w-4 h-4 text-[#1D4ED8]" />
                <span>Mi perfil</span>
              </button>
              <div className="my-1 border-t border-[#D6E4F7]" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#B91C1C] hover:bg-[#FEE2E2]/60 rounded-lg transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* Contenedor principal                                      */}
      {/* ========================================================= */}
      <div className="flex-1 md:pl-[264px] flex flex-col min-h-screen">
        {/* Barra superior de 64 px con fondo blanco */}
        <header className="h-16 bg-white border-b border-[#D6E4F7] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa móvil */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#51607A] hover:bg-[#EFF6FF] hover:text-[#0F1F3D] cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-base sm:text-lg font-semibold text-[#0B2A66]">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-sm font-medium text-[#51607A]">
              {fullName}
            </span>
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="rounded-full ring-2 ring-transparent hover:ring-[#BAE6FD] transition-all cursor-pointer"
              title="Ir a mi perfil"
            >
              <InitialsAvatar name={fullName} size="sm" />
            </button>
          </div>
        </header>

        {/* Contenido principal de la página */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ========================================================= */}
      {/* Menú móvil (Drawer lateral)                              */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B2A66]/30 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#EFF6FF] border-r border-[#D6E4F7] shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 px-6 flex items-center justify-between border-b border-[#D6E4F7]">
              <SocratesLogo size="sm" showText={true} />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#51607A] hover:bg-[#E0F2FE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-white text-[#1D4ED8] shadow-xs'
                          : 'text-[#51607A] hover:bg-[#E0F2FE] hover:text-[#0F1F3D]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#D6E4F7]">
              <div className="flex items-center gap-3 p-2">
                <InitialsAvatar name={fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#0F1F3D] truncate">
                    {fullName}
                  </div>
                  <div className="text-xs text-[#51607A] truncate">
                    {roleLabel}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/perfil');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#0F1F3D] hover:bg-white rounded-lg"
                >
                  <User className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Mi perfil</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
