
import React, { useState, useEffect } from 'react';
import { UserApp, UserRole } from '../types';
import { ICONS } from '../constants';
import { dataService } from '../services/dataService';

interface LayoutProps {
  user: UserApp;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeView, setActiveView }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState({ name: 'AFTRAS CRM', currency: 'FCFA' });

  useEffect(() => {
    // Fix: Handle asynchronous logo and settings loading
    const loadBrand = async () => {
      const logo = await dataService.getAppLogo();
      setAppLogo(logo);
      const settings = await dataService.getAppSettings();
      setAppSettings(settings);
    };
    loadBrand();

    const handleLogoChange = async () => setAppLogo(await dataService.getAppLogo());
    const handleSettingsChange = async () => setAppSettings(await dataService.getAppSettings());
    
    window.addEventListener('app-logo-changed', handleLogoChange);
    window.addEventListener('app-settings-changed', handleSettingsChange);
    
    return () => {
      window.removeEventListener('app-logo-changed', handleLogoChange);
      window.removeEventListener('app-settings-changed', handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavItemClick = (viewId: string) => {
    setActiveView(viewId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const iconColors: Record<string, string> = {
    dashboard: 'text-sky-400',
    'access-code': 'text-amber-400',
    users: 'text-indigo-400',
    prospects: 'text-emerald-400',
    clients: 'text-blue-400',
    sales: 'text-rose-400',
    commissions: 'text-orange-400',
    notifications: 'text-purple-400',
    settings: 'text-slate-400',
    profile: 'text-teal-400',
    prospecting: 'text-emerald-400',
    'remote-form': 'text-sky-400',
    'my-clients': 'text-blue-400',
    'my-commissions': 'text-orange-400',
  };

  const menuItems = {
    [UserRole.ADMIN]: [
      { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
      { id: 'access-code', label: 'Code d\'accès', icon: ICONS.Lock },
      { id: 'users', label: 'Utilisateurs', icon: ICONS.Users },
      { id: 'prospects', label: 'Prospects', icon: ICONS.Prospect },
      { id: 'clients', label: 'Clients', icon: ICONS.Client },
      { id: 'sales', label: 'Ventes', icon: ICONS.Sales },
      { id: 'commissions', label: 'Commissions', icon: ICONS.Commission },
      { id: 'notifications', label: 'Notifications', icon: ICONS.Notification },
      { id: 'settings', label: 'Paramètres', icon: ICONS.Settings },
      { id: 'profile', label: 'Profil', icon: ICONS.Profile },
    ],
    [UserRole.AGENT]: [
      { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
      { id: 'prospecting', label: 'Prospection', icon: ICONS.Prospect },
      { id: 'remote-form', label: 'Formulaire distant', icon: ICONS.Globe },
      { id: 'my-clients', label: 'Mes clients', icon: ICONS.Client },
      { id: 'my-commissions', label: 'Mes commissions', icon: ICONS.Commission },
      { id: 'notifications', label: 'Notifications', icon: ICONS.Notification },
      { id: 'profile', label: 'Profil', icon: ICONS.Profile },
    ],
    [UserRole.SUPERVISOR]: [
      { id: 'dashboard', label: 'Dashboard (Lecture)', icon: ICONS.Dashboard },
      { id: 'access-code', label: 'Code d\'accès (L)', icon: ICONS.Lock },
      { id: 'users', label: 'Utilisateurs (L)', icon: ICONS.Users },
      { id: 'prospects', label: 'Prospects (L)', icon: ICONS.Prospect },
      { id: 'clients', label: 'Clients (L)', icon: ICONS.Client },
      { id: 'sales', label: 'Ventes (L)', icon: ICONS.Sales },
      { id: 'commissions', label: 'Commissions (L)', icon: ICONS.Commission },
      { id: 'notifications', label: 'Notifications (L)', icon: ICONS.Notification },
      { id: 'settings', label: 'Paramètres (L)', icon: ICONS.Settings },
      { id: 'profile', label: 'Profil (L)', icon: ICONS.Profile },
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  const renderSidebarBrand = () => {
    // Fix: access appSettings property safely
    if (appSettings.name?.toUpperCase() === 'AFTRAS CRM') {
      return (
        <span className="font-black text-lg tracking-tight whitespace-nowrap overflow-hidden flex items-center gap-1.5">
          <span className="text-white">AFTRAS</span>
          <span className="text-orange-500 border-2 border-orange-500 rounded-full px-2 py-0.5 text-[0.75em]">CRM</span>
        </span>
      );
    }
    return <span className="font-bold text-xl text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{appSettings.name?.split(' ')[0]}</span>;
  };

  return (
    <div className="min-h-screen flex bg-gray-50 relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed h-full z-50 bg-blue-950 border-r border-blue-900/50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl
          ${isSidebarOpen ? 'w-64 translate-x-0' : isMobile ? 'w-64 -translate-x-full' : 'w-20 translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          {(isSidebarOpen || !isMobile) && (
            <div className={`flex items-center space-x-2 ${!isSidebarOpen && !isMobile ? 'mx-auto' : ''}`}>
              {appLogo ? (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-white/20 shadow-lg">
                  <img src={appLogo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-orange-500/20">A</div>
              )}
              {isSidebarOpen && renderSidebarBrand()}
            </div>
          )}
          {isMobile && isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-blue-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1.5 overflow-y-auto">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className={`
                w-full flex items-center p-3 rounded-2xl transition-all duration-300 group
                ${activeView === item.id 
                  ? 'bg-blue-900/50 text-white shadow-inner border border-white/5' 
                  : 'text-blue-200/60 hover:bg-blue-900/30 hover:text-white'
                }
              `}
              title={!isSidebarOpen && !isMobile ? item.label : ''}
            >
              <div className={`
                shrink-0 transition-all duration-500 
                ${activeView === item.id ? iconColors[item.id] || 'text-white' : 'text-blue-300/40 group-hover:scale-125 group-hover:rotate-6 group-hover:translate-x-1'}
                ${!isSidebarOpen && !isMobile ? 'mx-auto' : ''}
              `}>
                {item.icon}
              </div>
              {isSidebarOpen && (
                <span className={`
                  ml-3 text-sm font-medium transition-all duration-300 truncate
                  ${activeView === item.id ? 'translate-x-1 font-bold' : 'group-hover:translate-x-1'}
                `}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-900/50">
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center p-3 text-blue-300/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group
              ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}
            `}
          >
            <div className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110">{ICONS.Logout}</div>
            {isSidebarOpen && <span className="ml-3 text-sm font-bold uppercase tracking-widest text-[10px]">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
        ${!isMobile ? (isSidebarOpen ? 'ml-64' : 'ml-20') : 'ml-0'}
      `}>
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden xs:block">
              <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-gray-500 font-black px-2 py-0.5 bg-gray-50 rounded-full inline-block uppercase tracking-tighter">{user.role}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shrink-0 ring-2 ring-white">
              {user.firstName[0]}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
