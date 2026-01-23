import React, { useState, useEffect } from 'react';
import { UserApp, UserRole, UserStatus } from './types';
import { Layout } from './components/Layout';
import { 
  AdminDashboardHome, 
  AccessCodeView, 
  UsersListView, 
  AdminProspectsView, 
  AdminClientsView, 
  AdminSalesView, 
  AdminCommissionsView,
  AdminNotificationsView,
  AdminSettingsView,
  AdminProfileView
} from './components/AdminViews';
import { 
  AgentDashboardHome, 
  ProspectingView, 
  AgentClientsView, 
  AgentCommissionsView, 
  AgentProfileView,
  RemoteFormView,
  AgentNotificationsView
} from './components/AgentViews';
import { dataService } from './services/dataService';
import { dbService } from './services/db';
import { authService } from './services/auth';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserApp | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'home' | 'forgot-password'>('home');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [prefilledCode, setPrefilledCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState({ name: 'AFTRAS CRM', currency: 'FCFA' });

  // Écouter l'état de l'authentification et du profil en temps réel
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = authService.getCurrentUser((firebaseUser) => {
      // Nettoyage de l'écouteur de profil précédent
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        setIsLoading(true);
        // Écouter le document utilisateur en temps réel pour réagir à l'activation admin
        unsubscribeProfile = dbService.listenById('users', firebaseUser.uid, (profile) => {
          if (profile) {
            if (profile.status === UserStatus.ACTIVE) {
              setUser({ ...profile, id: firebaseUser.uid });
              setError(null);
            } else if (profile.status === UserStatus.DISABLED) {
              setError('Votre compte a été désactivé par un administrateur.');
              setUser(null);
            } else {
              setError('Compte en attente de validation par l\'administration.');
              setUser(null);
            }
          } else {
            setError('Profil utilisateur introuvable dans la base de données.');
            setUser(null);
          }
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setError(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Détection des paramètres URL pour l'inscription auto
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const code = params.get('code');
    
    if (mode === 'signup') {
      setAuthMode('signup');
    }
    if (code) {
      setPrefilledCode(code);
    }
  }, []);

  useEffect(() => {
    const loadBrand = async () => {
      try {
        setAppLogo(await dataService.getAppLogo());
        setAppSettings(await dataService.getAppSettings());
      } catch (err) {
        console.warn("Could not load brand settings:", err);
      }
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

  // Login avec Firebase Auth
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await authService.login(email, password);
    } catch (err: any) {
      setError('Identifiants invalides ou erreur de connexion.');
      setIsLoading(false);
    }
  };

  // Réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      await authService.sendResetEmail(email);
      setSuccessMessage('Un email de réinitialisation a été envoyé à ' + email);
    } catch (err: any) {
      setError('Erreur : impossible d\'envoyer l\'email. Vérifiez l\'adresse saisie.');
    } finally {
      setIsLoading(false);
    }
  };

  // Signup avec Firebase Auth
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const codeInput = formData.get('accessCode') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const accessCode = await dataService.getAccessCode();

      if (codeInput !== accessCode.code) {
        setError('Code d\'accès invalide.');
        setIsLoading(false);
        return;
      }

      if (new Date() > new Date(accessCode.expiresAt)) {
        setError('Code d\'accès expiré (validité 24h).');
        setIsLoading(false);
        return;
      }

      const userCredential = await authService.register(email, password);
      
      // Créer le profil utilisateur dans Firestore
      await dataService.addUser({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: email,
        role: UserRole.AGENT,
        status: UserStatus.PENDING,
        id: userCredential.user.uid 
      } as any);

      alert('Inscription réussie ! Votre compte est en attente de validation par un admin.');
      setAuthMode('login');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBrandName = (name: string) => {
    if (name?.toUpperCase() === 'AFTRAS CRM') {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="text-blue-600">AFTRAS</span>
          <span className="text-orange-500 border border-orange-500/30 rounded-full px-3 py-0.5 text-[0.85em]">CRM</span>
        </span>
      );
    }
    return <span>{name}</span>;
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">Initialisation sécurisée...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-sky-50 animate-in fade-in duration-700">
        {authMode === 'home' && (
          <div className="max-w-md w-full text-center space-y-12">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto shadow-2xl shadow-indigo-200 overflow-hidden">
                {appLogo ? (
                  <img src={appLogo} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  "V6"
                )}
              </div>
              <h1 className="text-4xl font-black tracking-tight">
                {renderBrandName(appSettings.name)}
              </h1>
              <p className="text-gray-500 text-lg">Plateforme de gestion commerciale haute performance.</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={() => setAuthMode('signup')}
                className="w-full bg-white text-gray-900 border border-gray-200 py-4 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center group"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform">{ICONS.Plus}</span>
                S'inscrire
              </button>
              <button 
                onClick={() => setAuthMode('login')}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center group"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform">{ICONS.Lock}</span>
                Se connecter
              </button>
            </div>
          </div>
        )}

        {(authMode === 'login' || authMode === 'signup' || authMode === 'forgot-password') && (
          <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => {
                const prevMode = authMode === 'forgot-password' ? 'login' : 'home';
                setAuthMode(prevMode); 
                setError(null); 
                setSuccessMessage(null);
                setShowPassword(false);
              }}
              className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <h2 className="text-2xl font-black text-center mb-8 mt-4">
              {authMode === 'login' ? 'Connexion' : authMode === 'signup' ? 'Nouvel Agent' : 'Réinitialisation'}
            </h2>

            {authMode === 'forgot-password' ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <p className="text-sm text-gray-500 text-center mb-4">
                  Saisissez votre email pour recevoir un lien de réinitialisation de mot de passe.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email professionnel</label>
                  <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="nom@entreprise.com" />
                </div>
                
                {error && <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}
                {successMessage && <p className="text-xs font-bold text-emerald-600 text-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">{successMessage}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'Action en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            ) : (
              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-5">
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Prénom</label>
                      <input name="firstName" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nom</label>
                      <input name="lastName" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email professionnel</label>
                  <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="nom@entreprise.com" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mot de passe</label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-12" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? ICONS.EyeOff : ICONS.Eye}
                    </button>
                  </div>
                  {authMode === 'login' && (
                    <div className="text-right mt-1">
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('forgot-password'); setError(null); }}
                        className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-tighter"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}
                </div>

                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Code d'accès</label>
                    <input 
                      name="accessCode" 
                      required 
                      defaultValue={prefilledCode}
                      key={prefilledCode} 
                      className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono font-bold text-indigo-600" 
                      placeholder="Code Admin" 
                    />
                  </div>
                )}

                {error && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>
                    {authService.auth.currentUser && (
                      <button 
                        type="button" 
                        onClick={() => authService.logout()} 
                        className="w-full text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest text-center transition-colors"
                      >
                        Annuler et se déconnecter
                      </button>
                    )}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'Action en cours...' : (authMode === 'login' ? 'Entrer dans l\'espace' : 'Finaliser l\'inscription')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  // View Content Switcher
  const renderViewContent = () => {
    // Admin Views
    if (user.role === UserRole.ADMIN) {
      switch (activeView) {
        case 'dashboard': return <AdminDashboardHome onNavigate={setActiveView} />;
        case 'access-code': return <AccessCodeView />;
        case 'users': return <UsersListView />;
        case 'prospects': return <AdminProspectsView />;
        case 'clients': return <AdminClientsView />;
        case 'sales': return <AdminSalesView />;
        case 'commissions': return <AdminCommissionsView />;
        case 'notifications': return <AdminNotificationsView />;
        case 'settings': return <AdminSettingsView />;
        case 'profile': return <AdminProfileView user={user} onUpdate={setUser} />;
        default: return <AdminDashboardHome onNavigate={setActiveView} />;
      }
    }

    // Supervisor Views (Read Only Admin Views)
    if (user.role === UserRole.SUPERVISOR) {
      switch (activeView) {
        case 'dashboard': return <AdminDashboardHome onNavigate={setActiveView} />;
        case 'access-code': return <AccessCodeView readOnly />;
        case 'users': return <UsersListView readOnly />;
        case 'prospects': return <AdminProspectsView readOnly />;
        case 'clients': return <AdminClientsView readOnly />;
        case 'sales': return <AdminSalesView readOnly />;
        case 'commissions': return <AdminCommissionsView readOnly />;
        case 'notifications': return <AdminNotificationsView readOnly />;
        case 'settings': return <AdminSettingsView readOnly />;
        case 'profile': return <AdminProfileView user={user} onUpdate={setUser} readOnly />;
        default: return <AdminDashboardHome onNavigate={setActiveView} />;
      }
    }

    // Agent Views
    if (user.role === UserRole.AGENT) {
      switch (activeView) {
        case 'dashboard': return <AgentDashboardHome user={user} onNavigate={setActiveView} />;
        case 'prospecting': return <ProspectingView user={user} />;
        case 'my-clients': return <AgentClientsView user={user} />;
        case 'my-commissions': return <AgentCommissionsView user={user} />;
        case 'profile': return <AgentProfileView user={user} onUpdate={setUser} />;
        case 'remote-form': return <RemoteFormView user={user} />;
        case 'notifications': return <AgentNotificationsView user={user} />;
        default: return <AgentDashboardHome user={user} onNavigate={setActiveView} />;
      }
    }

    return <div>Accès non autorisé</div>;
  };

  return (
    <Layout 
      user={user} 
      onLogout={async () => { await authService.logout(); setUser(null); setActiveView('dashboard'); setAuthMode('home'); }}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {renderViewContent()}
    </Layout>
  );
};

export default App;