import React, { useState, useEffect, useRef } from 'react';
import { StatCard } from './Common/StatCard';
import { ICONS } from '../constants';
import { dataService } from '../services/dataService';
import { dbService } from '../services/db';
import { UserApp, UserStatus, UserRole, AccessCode, Prospect, ProspectStatus, Client, Sale, NotificationApp } from '../types';

export const AdminDashboardHome: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserApp[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const salesData = await dataService.getSales();
      setSales(salesData);
      const prospectsData = await dataService.getProspects();
      setProspects(prospectsData);
      const clientsData = await dataService.getClients();
      setClients(clientsData.filter(c => c.status !== 'CANCELLED'));
      const usersData = await dataService.getUsers();
      setUsers(usersData.filter(u => u.status === UserStatus.ACTIVE));
    };
    loadData();
  }, []);

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const result = await dataService.getAIInsights(sales, prospects, clients);
      setAiAnalysis(result);
    } catch (e) {
      console.error(e);
      setAiAnalysis("Erreur lors de l'analyse IA. Vérifiez votre connexion.");
    } finally {
      setLoadingAI(false);
    }
  };

  const totalCA = sales.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tableau de bord Global</h1>
          <p className="text-gray-500 font-medium">Vue d'ensemble de la performance de l'entreprise</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleGenerateAI}
             disabled={loadingAI}
             className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500 hover:bg-indigo-700 transition-all flex items-center shadow-lg disabled:opacity-50 shadow-indigo-100"
           >
             {loadingAI ? "Chargement..." : "✨ Analyse Stratégique IA"}
           </button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden group">
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-300 mb-6 flex items-center">
             <span className="mr-2">🚀</span> Rapport Stratégique Gemini
           </h3>
           <div className="prose prose-invert max-w-none text-indigo-50 font-medium leading-relaxed">
             {aiAnalysis.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
           </div>
           <button onClick={() => setAiAnalysis(null)} className="mt-8 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Masquer l'analyse</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard label="Agents actifs" value={users.length} icon={ICONS.Users} color="indigo" onClick={() => onNavigate('users')} />
        <StatCard label="Prospects totaux" value={prospects.length} icon={ICONS.Prospect} color="sky" onClick={() => onNavigate('prospects')} />
        <StatCard label="Clients validés" value={clients.length} icon={ICONS.Client} color="emerald" onClick={() => onNavigate('clients')} />
        <StatCard label="CA Global" value={`${totalCA.toLocaleString()} FCFA`} icon={ICONS.Sales} color="amber" onClick={() => onNavigate('sales')} />
        <StatCard label="Commissions" value={`${sales.reduce((acc, s) => acc + s.commission, 0).toLocaleString()} FCFA`} icon={ICONS.Commission} color="rose" onClick={() => onNavigate('commissions')} />
      </div>
    </div>
  );
};

export const AccessCodeView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [accessCode, setAccessCode] = useState<AccessCode | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<'code' | 'link' | null>(null);
  
  useEffect(() => {
    const loadCode = async () => {
      setAccessCode(await dataService.getAccessCode());
    };
    loadCode();
  }, []);

  const handleGenerate = async () => {
    if (readOnly) return;
    const newCode = await dataService.generateNewCode();
    setAccessCode(newCode);
  };

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  if (!accessCode) return <div className="p-12 text-center font-black text-indigo-600">Chargement...</div>;

  const signupLink = `${window.location.origin}/?mode=signup&code=${accessCode.code}`;

  return (
    <div className="max-w-xl mx-auto space-y-8 py-12 text-center">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          {ICONS.Lock}
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Code d'accès Agent</h2>
        <p className="text-gray-500 mb-10 text-sm font-medium">Gérez l'accès des nouveaux agents à votre plateforme.</p>
        
        <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-3xl mb-8 group relative overflow-hidden transition-all hover:bg-indigo-50/80">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Code de Sécurité Actuel</p>
          <div className="flex items-center justify-center space-x-4">
            <p className="text-4xl font-black text-indigo-700 font-mono tracking-widest transition-transform group-hover:scale-105">{accessCode.code}</p>
            <button 
              onClick={() => handleCopy(accessCode.code, 'code')} 
              className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${copyFeedback === 'code' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-indigo-600 border-indigo-100 shadow-sm hover:bg-indigo-50'}`}
            >
              {copyFeedback === 'code' ? <span className="text-[10px] font-black uppercase tracking-widest">Copié !</span> : ICONS.Copy}
            </button>
          </div>
        </div>

        <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-3xl mb-10 text-left">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <div className="w-6 h-6">{ICONS.Globe}</div>
            <p className="text-[10px] font-black uppercase tracking-widest">Lien d'inscription rapide</p>
          </div>
          <div className="space-y-4">
            <a 
              href={signupLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-xs font-bold text-indigo-600 bg-white p-4 rounded-xl border border-indigo-50 truncate hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-inner"
            >
              {signupLink}
            </a>
            <button 
              onClick={() => handleCopy(signupLink, 'link')} 
              className={`w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-sm ${copyFeedback === 'link' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="shrink-0">{ICONS.Copy}</div>
              {copyFeedback === 'link' ? 'Lien copié dans le presse-papier' : 'Copier le lien complet'}
            </button>
          </div>
        </div>

        {!readOnly && (
          <button 
            onClick={handleGenerate} 
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 pt-6"
          >
            Régénérer un nouveau code
          </button>
        )}
      </div>
    </div>
  );
};

export const UsersListView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [users, setUsers] = useState<UserApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => setUsers(await dataService.getUsers());
    loadUsers();
  }, []);

  const handleStatus = async (userId: string, status: UserStatus) => {
    if (readOnly) return;
    await dataService.updateUserStatus(userId, status);
    setUsers(await dataService.getUsers());
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;
    const fd = new FormData(e.currentTarget);
    
    try {
      await dataService.addUser({
        firstName: fd.get('firstName') as string,
        lastName: fd.get('lastName') as string,
        email: fd.get('email') as string,
        role: fd.get('role') as UserRole,
        status: UserStatus.ACTIVE,
        id: `admin_created_${Date.now()}`
      } as any);
      
      alert('Utilisateur créé avec succès dans la base !');
      setIsModalOpen(false);
      setUsers(await dataService.getUsers());
    } catch (err) {
      alert('Erreur lors de la création.');
    }
  };

  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case UserRole.SUPERVISOR: return 'bg-purple-50 text-purple-700 border-purple-100';
      case UserRole.AGENT: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs</h1>
          <p className="text-gray-500 font-medium">Gestion des agents et superviseurs de l'équipe</p>
        </div>
        {!readOnly && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center pt-5"
          >
            <span className="mr-2">{ICONS.Plus}</span> Créer un Utilisateur
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 placeholder:text-gray-300 shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner text-gray-600 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">Tous les rôles</option>
            <option value={UserRole.ADMIN}>Administrateurs</option>
            <option value={UserRole.AGENT}>Agents de vente</option>
            <option value={UserRole.SUPERVISOR}>Superviseurs</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm group hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
            <div className="flex items-center space-x-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-gray-900 text-lg truncate">{user.firstName} {user.lastName}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-5 border-t border-gray-50 mb-6 text-[10px] font-black">
               <span className="text-gray-400 uppercase tracking-widest">Rôle</span>
               <span className={`px-3 py-1 rounded-lg border ${getRoleBadgeStyle(user.role)}`}>{user.role}</span>
            </div>
            <div className="flex items-center justify-between py-5 border-t border-gray-50 mb-6 text-[10px] font-black">
               <span className="text-gray-400 uppercase tracking-widest">Statut</span>
               <span className={user.status === UserStatus.ACTIVE ? 'text-emerald-500' : user.status === UserStatus.PENDING ? 'text-amber-500' : 'text-rose-500'}>{user.status}</span>
            </div>
            {!readOnly && (
              <div className="grid grid-cols-2 gap-4">
                {user.status !== UserStatus.ACTIVE && <button onClick={() => handleStatus(user.id, UserStatus.ACTIVE)} className="py-3.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all pt-4">Activer</button>}
                {user.status === UserStatus.ACTIVE && <button onClick={() => handleStatus(user.id, UserStatus.DISABLED)} className="py-3.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all pt-4">Bloquer</button>}
                <button onClick={async () => { if(confirm('Supprimer cet utilisateur ?')) { await dataService.deleteUser(user.id); setUsers(await dataService.getUsers()); } }} className="py-3.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all border border-rose-100 pt-4">Supprimer</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b-2 border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Nouvel Utilisateur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-10 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" required className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-xl outline-none font-bold transition-all" placeholder="Prénom" />
                <input name="lastName" required className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-xl outline-none font-bold transition-all" placeholder="Nom" />
              </div>
              <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Email professionnel" />
              <select name="role" required className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-xl outline-none font-bold transition-all">
                <option value={UserRole.AGENT}>Agent de vente</option>
                <option value={UserRole.SUPERVISOR}>Superviseur</option>
              </select>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest pt-6 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Créer l'utilisateur</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminProspectsView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [agents, setAgents] = useState<UserApp[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { 
    const load = async () => {
      setProspects(await dataService.getProspects());
      setAgents(await dataService.getUsers());
    };
    load();
  }, []);

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : "Agent inconnu";
  };

  const filtered = prospects.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getAgentName(p.agentId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const borderPalette = [
    { border: 'border-indigo-200', text: 'text-indigo-600', bg: 'bg-indigo-50/30' },
    { border: 'border-sky-200', text: 'text-sky-600', bg: 'bg-sky-50/30' },
    { border: 'border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-50/30' },
    { border: 'border-amber-200', text: 'text-amber-600', bg: 'bg-amber-50/30' },
    { border: 'border-rose-200', text: 'text-rose-600', bg: 'bg-rose-50/30' },
    { border: 'border-violet-200', text: 'text-violet-600', bg: 'bg-violet-50/30' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Prospects Globaux</h1>
          <p className="text-gray-500 font-medium text-lg">Surveillance centralisée de tous les dossiers entrants.</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-xl flex items-center transition-all focus-within:ring-4 focus-within:ring-indigo-50">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Rechercher par nom, ville, email ou agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[2rem] outline-none font-bold text-lg text-gray-800 placeholder:text-gray-300 shadow-inner"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
        {filtered.map((p, index) => {
          const theme = borderPalette[index % borderPalette.length];
          return (
            <div key={p.id} className={`group bg-white rounded-[4rem] p-10 border-2 transition-all duration-500 animate-in slide-in-from-bottom-12 hover:-translate-y-3 hover:shadow-2xl flex flex-col relative ${theme.border} shadow-xl shadow-gray-100/40`} style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between mb-8">
                <div className={`w-20 h-20 rounded-[2.25rem] flex items-center justify-center text-3xl font-black shadow-lg transition-transform duration-500 group-hover:scale-110 bg-white border border-gray-100 ${theme.text}`}>{p.fullName[0]}</div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${p.status === ProspectStatus.CONVERTED ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{p.status === ProspectStatus.PENDING ? 'En attente' : 'Confirmé'}</span>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">Agent: {getAgentName(p.agentId)}</span>
                </div>
              </div>
              <div className="mb-6 flex-1">
                <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-3 truncate">{p.fullName}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center"><span className={`w-2 h-2 rounded-full mr-2 ${theme.text.replace('text-', 'bg-')}`}></span>{p.company || 'Compte Particulier'}</p>
              </div>
              <div className="space-y-6 pt-8 border-t border-gray-50 mb-8">
                 <div className="flex items-center justify-between"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localisation</span><span className="text-xs font-black text-gray-700">{p.city}, {p.country}</span></div>
                 <div className={`p-6 rounded-[2rem] border-2 transition-colors ${theme.bg} ${theme.border}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${theme.text}`}>Offre sollicitée</p>
                    <p className="font-black text-gray-800 text-sm leading-tight truncate">{p.productOfInterest}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedProspect(p)} className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all pt-6">Consulter le dossier</button>
            </div>
          );
        })}
      </div>
      {selectedProspect && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-xl" onClick={() => setSelectedProspect(null)}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-12 text-white relative">
              <button onClick={() => setSelectedProspect(null)} className="absolute top-8 right-8 p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-4xl font-black border border-white/20">{selectedProspect.fullName[0]}</div>
                 <div><h2 className="text-3xl font-black tracking-tight">{selectedProspect.fullName}</h2><p className="text-indigo-100/70 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dossier #{selectedProspect.id.slice(0, 8)}</p></div>
              </div>
            </div>
            <div className="p-12 space-y-10 max-h-[60vh] overflow-y-auto">
               <div className="flex items-center justify-between p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <div><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Agent Responsable</p><p className="font-black text-indigo-700 text-lg">{getAgentName(selectedProspect.agentId)}</p></div>
                  <div className="text-right"><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Source Captée</p><p className="font-black text-indigo-700 text-lg">{selectedProspect.source}</p></div>
               </div>
               <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</p><p className="font-black text-gray-900 text-xl">{selectedProspect.countryCode} {selectedProspect.phone}</p></div>
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p><p className="font-black text-indigo-600 text-lg truncate underline decoration-indigo-200 decoration-2 underline-offset-4">{selectedProspect.email}</p></div>
                  </div>
                  <div className="space-y-8">
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ville & Pays</p><p className="font-black text-gray-900 text-xl">{selectedProspect.city}, {selectedProspect.country}</p></div>
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entreprise</p><p className="font-black text-gray-900 text-xl">{selectedProspect.company || 'Particulier'}</p></div>
                  </div>
               </div>
               <div className="p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Offre d'intérêt</p><p className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{selectedProspect.productOfInterest}</p></div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes & Commentaires</p>
                  <div className="p-8 bg-amber-50/50 border-2 border-amber-100 rounded-[2.5rem] relative"><div className="absolute -top-4 -left-4 w-10 h-10 bg-white border-2 border-amber-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">✍️</div><p className="text-gray-700 font-medium italic leading-relaxed text-lg">{selectedProspect.details || "Aucun commentaire additionnel."}</p></div>
               </div>
            </div>
            <div className="p-10 border-t border-gray-100"><button onClick={() => setSelectedProspect(null)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all pt-6">Terminer la consultation</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminClientsView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [associatedProspect, setAssociatedProspect] = useState<Prospect | null>(null);
  const [showSaleModal, setShowSaleModal] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // États pour le calcul de la vente
  const [caValue, setCaValue] = useState<number>(0);
  const [mrValue, setMrValue] = useState<number>(0);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const clientsData = await dataService.getClients();
    setClients(clientsData.filter(c => c.status !== 'CANCELLED'));
  };

  const handleOpenConsultation = async (client: Client) => {
    setSelectedClient(client);
    const prospects = await dataService.getProspects();
    const prospect = prospects.find(p => p.id === client.prospectId);
    setAssociatedProspect(prospect || null);
  };

  const profitCalculated = caValue - mrValue;
  const commissionCalculated = profitCalculated * 0.15;

  const handleConcludeSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly || !showSaleModal) return;

    await dataService.addSale({
      clientId: showSaleModal.id,
      agentId: showSaleModal.agentId,
      amount: caValue,
      profit: profitCalculated,
      commission: commissionCalculated,
      status: 'PENDING'
    });

    alert('Vente enregistrée avec succès !');
    setShowSaleModal(null);
    setCaValue(0);
    setMrValue(0);
    loadClients();
  };

  const handleDeleteClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly || !showDeleteModal) return;
    const fd = new FormData(e.currentTarget);
    const reason = fd.get('reason') as string;

    await dataService.deleteClient(showDeleteModal.id, reason);

    await dbService.add('notifications', {
      userId: showDeleteModal.agentId,
      title: 'Dossier Client Supprimé',
      message: `Le client ${showDeleteModal.fullName} a été supprimé du CRM par l'administration. Motif : ${reason}`,
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString()
    });

    alert('Client supprimé et agent notifié.');
    setShowDeleteModal(null);
    loadClients();
  };

  const filtered = clients.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const borderPalette = [
    { border: 'border-indigo-200', text: 'text-indigo-600', bg: 'bg-indigo-50/30' },
    { border: 'border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-50/30' },
    { border: 'border-amber-200', text: 'text-amber-600', bg: 'bg-amber-50/30' },
    { border: 'border-sky-200', text: 'text-sky-600', bg: 'bg-sky-50/30' },
    { border: 'border-rose-200', text: 'text-rose-600', bg: 'bg-rose-50/30' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Portefeuille Clients</h1>
          <p className="text-gray-500 font-medium text-lg">Gestion globale des contrats validés par les agents.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 transition-all focus-within:ring-4 focus-within:ring-indigo-50">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Rechercher par nom, entreprise, produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[2rem] outline-none font-bold text-lg text-gray-800 placeholder:text-gray-300 shadow-inner"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.75rem] outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner text-gray-600"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="SALE_CONCLUDED">Vente conclue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
        {filtered.map((c, index) => {
          const theme = borderPalette[index % borderPalette.length];
          return (
            <div key={c.id} className={`group bg-white rounded-[4rem] p-10 border-2 transition-all duration-500 animate-in slide-in-from-bottom-12 hover:-translate-y-3 hover:shadow-2xl flex flex-col relative ${theme.border} shadow-xl shadow-gray-100/40`} style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between mb-8">
                <div className={`w-20 h-20 rounded-[2.25rem] flex items-center justify-center text-3xl font-black bg-white border border-gray-100 ${theme.text}`}>{c.fullName[0]}</div>
                <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${c.status === 'SALE_CONCLUDED' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {c.status === 'SALE_CONCLUDED' ? 'Payé' : 'En attente'}
                </span>
              </div>
              <div className="mb-6 flex-1">
                <h4 className="text-2xl font-black text-gray-900 mb-2 truncate">{c.fullName}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{c.company || 'Compte Particulier'}</p>
              </div>
              <div className="space-y-4 pt-8 border-t border-gray-50 mb-8">
                 <div className="p-6 rounded-[2rem] border-2 transition-colors bg-gray-50 border-gray-100">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400">Contrat de service</p>
                    <p className="font-black text-gray-800 text-sm leading-tight truncate">{c.product}</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleOpenConsultation(c)} className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all pt-5">Consulter Dossier</button>
                {!readOnly && c.status === 'PENDING' && (
                  <>
                    <button onClick={() => setShowSaleModal(c)} className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-700 transition-all pt-5">Conclure la vente</button>
                    <button onClick={() => setShowDeleteModal(c)} className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all pt-5">Supprimer</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CONSULTATION */}
      {selectedClient && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-xl" onClick={() => { setSelectedClient(null); setAssociatedProspect(null); }}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 border border-white/20">
            <div className="bg-indigo-700 p-12 text-white flex items-center gap-6">
               <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl font-black">{selectedClient.fullName[0]}</div>
               <div><h2 className="text-3xl font-black">{selectedClient.fullName}</h2><p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Client ID #{selectedClient.id.slice(0, 8)}</p></div>
            </div>
            <div className="p-12 space-y-8 max-h-[60vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-8">
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordonnées</p><p className="font-black text-gray-900">{selectedClient.phone}</p><p className="font-bold text-indigo-600 text-sm">{selectedClient.email}</p></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localisation</p><p className="font-black text-gray-900">{selectedClient.country}</p></div>
               </div>
               <div className="p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Produit souscrit</p>
                  <p className="text-xl font-black text-slate-800 leading-tight">{selectedClient.product}</p>
               </div>
               {associatedProspect && (
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Détails Prospect initiaux</p>
                    <div className="p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-[2.5rem] italic font-medium">
                      {associatedProspect.details || "Aucun détail saisi dans le formulaire prospect."}
                      <p className="mt-4 text-[9px] font-black uppercase text-indigo-400 not-italic tracking-widest">Source: {associatedProspect.source}</p>
                    </div>
                 </div>
               )}
            </div>
            <div className="p-10 border-t border-gray-100"><button onClick={() => { setSelectedClient(null); setAssociatedProspect(null); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] pt-6 shadow-xl shadow-indigo-100">Fermer la consultation</button></div>
          </div>
        </div>
      )}

      {/* MODAL CONCLURE VENTE (Calculs auto CA/MR) */}
      {showSaleModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md" onClick={() => setShowSaleModal(null)}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 border-2 border-emerald-100">
             <div className="p-10 border-b-2 border-gray-50 bg-emerald-50/30 rounded-t-[4rem] text-center">
                <h3 className="text-2xl font-black text-emerald-700 tracking-tight leading-none mb-2">Finalisation de la vente</h3>
                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Dossier: {showSaleModal.fullName}</p>
             </div>
             <form onSubmit={handleConcludeSale} className="p-10 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Chiffre d'Affaires (FCFA)</label>
                   <input 
                     name="amount" 
                     type="number" 
                     required 
                     onChange={(e) => setCaValue(Number(e.target.value))}
                     className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-200 rounded-2xl outline-none font-black text-lg" 
                     placeholder="Ex: 500000" 
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Montant Réel (Charges)</label>
                   <input 
                     name="realCost" 
                     type="number" 
                     required 
                     onChange={(e) => setMrValue(Number(e.target.value))}
                     className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-200 rounded-2xl outline-none font-black text-lg" 
                     placeholder="Ex: 350000" 
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Bénéfice Net</label>
                    <div className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl font-black text-indigo-700">
                       {profitCalculated.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Commission (15%)</label>
                    <div className="w-full px-6 py-4 bg-amber-50 border-2 border-amber-100 rounded-2xl font-black text-amber-700">
                       {commissionCalculated.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl pt-6 hover:bg-emerald-700 transition-all">
                  Valider et Enregistrer la vente
                </button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION SUPPRESSION AVEC RAISON */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md" onClick={() => setShowDeleteModal(null)}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 border-2 border-rose-100">
             <div className="p-10 border-b-2 border-gray-50 bg-rose-50/30 rounded-t-[4rem] text-center">
                <h3 className="text-2xl font-black text-rose-700 tracking-tight leading-none mb-2">Confirmer la suppression</h3>
                <p className="text-rose-600 font-bold text-xs uppercase tracking-widest">Dossier: {showDeleteModal.fullName}</p>
             </div>
             <form onSubmit={handleDeleteClient} className="p-10 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 text-center block">Motif de la suppression</label>
                   <textarea name="reason" required rows={4} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-200 rounded-3xl outline-none font-bold italic text-gray-600 resize-none" placeholder="Indiquez à l'agent pourquoi ce dossier est annulé..."></textarea>
                   <p className="text-[9px] text-gray-400 font-medium italic text-center px-4 mt-2">* Une notification sera immédiatement envoyée à l'agent.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl pt-6 hover:bg-rose-700 transition-all">
                    Supprimer définitivement
                  </button>
                  <button type="button" onClick={() => setShowDeleteModal(null)} className="w-full py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest pt-6">
                    Annuler l'action
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminSalesView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // États pour le calcul de la correction
  const [editCa, setEditCa] = useState<number>(0);
  const [editMr, setEditMr] = useState<number>(0);

  useEffect(() => { 
    loadData();
  }, []);

  const loadData = async () => {
    const [salesData, clientsData, usersData] = await Promise.all([
      dataService.getSales(),
      dataService.getClients(),
      dataService.getUsers()
    ]);
    setSales(salesData);
    setClients(clientsData);
    setUsers(usersData);
  };

  const getClientInfo = (clientId: string) => clients.find(c => c.id === clientId);
  const getAgentInfo = (agentId: string) => users.find(u => u.id === agentId);

  const filteredSales = sales.filter(s => {
    const client = getClientInfo(s.clientId);
    const agent = getAgentInfo(s.agentId);
    const clientName = client?.fullName.toLowerCase() || '';
    const agentName = agent ? `${agent.firstName} ${agent.lastName}`.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return clientName.includes(query) || agentName.includes(query);
  });

  const handleOpenEdit = (sale: Sale) => {
    if (readOnly) return;
    setEditingSale(sale);
    setEditCa(sale.amount);
    // On estime le coût réel à partir du CA et du profit enregistré : Cost = Amount - Profit
    setEditMr(sale.amount - sale.profit);
  };

  const profitCalculated = editCa - editMr;
  const commissionCalculated = profitCalculated * 0.15;

  const handleUpdateSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSale || readOnly) return;

    await dataService.updateSale(editingSale.id, {
      amount: editCa,
      profit: profitCalculated,
      commission: commissionCalculated
    });

    alert('Vente corrigée avec succès !');
    setEditingSale(null);
    loadData();
  };

  const borderPalette = [
    { border: 'border-indigo-200', accent: 'text-indigo-600', bg: 'bg-indigo-50/30' },
    { border: 'border-emerald-200', accent: 'text-emerald-600', bg: 'bg-emerald-50/30' },
    { border: 'border-amber-200', accent: 'text-amber-600', bg: 'bg-amber-50/30' },
    { border: 'border-sky-200', accent: 'text-sky-600', bg: 'bg-sky-50/30' },
    { border: 'border-rose-200', accent: 'text-rose-600', bg: 'bg-rose-50/30' },
    { border: 'border-violet-200', accent: 'text-violet-600', bg: 'bg-violet-50/30' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Journal des Ventes</h1>
          <p className="text-gray-500 font-medium text-lg">Suivi analytique et financier de toutes les transactions.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-xl flex items-center transition-all focus-within:ring-4 focus-within:ring-indigo-50">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Rechercher par client ou agent responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 border-none rounded-[2rem] outline-none font-bold text-lg text-gray-800 placeholder:text-gray-300 shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredSales.map((s, index) => {
          const client = getClientInfo(s.clientId);
          const agent = getAgentInfo(s.agentId);
          const theme = borderPalette[index % borderPalette.length];
          
          return (
            <div 
              key={s.id} 
              className={`group bg-white rounded-[4rem] p-10 border-2 transition-all duration-500 animate-in slide-in-from-bottom-12 hover:-translate-y-3 hover:shadow-2xl flex flex-col relative ${theme.border} shadow-xl shadow-gray-100/40`} 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-8">
                 <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-2xl font-black bg-white border border-gray-100 ${theme.accent} shadow-sm group-hover:scale-110 transition-transform`}>
                   {client?.fullName[0] || 'C'}
                 </div>
                 <div className="flex flex-col items-end gap-2">
                   <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${s.status === 'PAID' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                     {s.status === 'PAID' ? 'Déjà Payé' : 'À Régler'}
                   </span>
                   {!readOnly && (
                     <button onClick={() => handleOpenEdit(s)} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Modifier
                     </button>
                   )}
                 </div>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
                <h3 className="text-4xl font-black text-indigo-700 tracking-tight leading-none mb-4">{s.amount.toLocaleString()} <span className="text-sm">FCFA</span></h3>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Bénéfice</p>
                    <p className="font-black text-emerald-700 text-sm">+{s.profit.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Commission</p>
                    <p className="font-black text-amber-700 text-sm">{s.commission.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-50 mt-auto">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Client</p>
                    <p className="font-black text-gray-800 text-lg leading-tight truncate">{client?.fullName || "Client Inconnu"}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Agent Resp.</p>
                      <p className="font-bold text-gray-600 text-xs truncate">{agent ? `${agent.firstName} ${agent.lastName}` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Produit</p>
                      <p className="font-bold text-indigo-600 text-xs truncate">{client?.product || "Service V6"}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between mt-8 text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                <span>#{s.id.slice(0, 8)}</span>
                <span>{new Date(s.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL MODIFIER VENTE (Correction) */}
      {editingSale && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md" onClick={() => setEditingSale(null)}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 border-2 border-indigo-100">
             <div className="p-10 border-b-2 border-gray-50 bg-indigo-50/30 rounded-t-[4rem] text-center">
                <h3 className="text-2xl font-black text-indigo-700 tracking-tight leading-none mb-2">Correction de la vente</h3>
                <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Client: {getClientInfo(editingSale.clientId)?.fullName}</p>
             </div>
             <form onSubmit={handleUpdateSale} className="p-10 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Chiffre d'Affaires (FCFA)</label>
                   <input 
                     name="amount" 
                     type="number" 
                     required 
                     value={editCa}
                     onChange={(e) => setEditCa(Number(e.target.value))}
                     className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-200 rounded-2xl outline-none font-black text-lg shadow-inner transition-all" 
                     placeholder="Ex: 500000" 
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Montant Réel (Charges)</label>
                   <input 
                     name="realCost" 
                     type="number" 
                     required 
                     value={editMr}
                     onChange={(e) => setEditMr(Number(e.target.value))}
                     className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-200 rounded-2xl outline-none font-black text-lg shadow-inner transition-all" 
                     placeholder="Ex: 350000" 
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nouv. Bénéfice</label>
                    <div className="w-full px-6 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-black text-emerald-700">
                       {profitCalculated.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nouv. Commission</label>
                    <div className="w-full px-6 py-4 bg-amber-50 border-2 border-amber-100 rounded-2xl font-black text-amber-700">
                       {commissionCalculated.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl pt-6 hover:bg-indigo-700 transition-all">
                    Enregistrer les corrections
                  </button>
                  <button type="button" onClick={() => setEditingSale(null)} className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] pt-6 tracking-widest hover:bg-gray-100 transition-all">
                    Annuler
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {filteredSales.length === 0 && (
        <div className="py-40 text-center bg-gray-50/50 rounded-[5rem] border-4 border-dashed border-gray-100">
           <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-200">
            {ICONS.Sales}
          </div>
          <p className="text-gray-300 font-black uppercase text-xl tracking-[0.2em] italic">Aucune vente correspondante</p>
        </div>
      )}
    </div>
  );
};

export const AdminCommissionsView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserApp[]>([]);
  const [confirmPaySale, setConfirmPaySale] = useState<Sale | null>(null);

  useEffect(() => { 
    const load = async () => {
      const [salesData, clientsData, usersData] = await Promise.all([
        dataService.getSales(),
        dataService.getClients(),
        dataService.getUsers()
      ]);
      setSales(salesData);
      setClients(clientsData);
      setUsers(usersData);
    };
    load();
  }, []);

  const handleUpdateStatus = async (sale: Sale) => {
    if (readOnly) return;
    await dataService.updateSaleStatus(sale.id, 'PAID');
    const updated = await dataService.getSales();
    setSales(updated);
    setConfirmPaySale(null);
  };

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.fullName || "Inconnu";
  const getAgentName = (agentId: string) => {
    const agent = users.find(u => u.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : "Inconnu";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Commissions Agents</h1>
          <p className="text-gray-500 font-medium text-lg">Suivi des règlements et reversements financiers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {sales.map((s, index) => {
          const isPaid = s.status === 'PAID';
          const clientName = getClientName(s.clientId);
          const agentName = getAgentName(s.agentId);
          
          return (
            <div 
              key={s.id} 
              className={`group bg-white rounded-[4rem] p-10 border-2 transition-all duration-500 animate-in slide-in-from-bottom-12 hover:-translate-y-3 hover:shadow-2xl flex flex-col relative shadow-xl shadow-gray-100/40 
                ${isPaid ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200 bg-amber-50/20'}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-center mb-8">
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-white shadow-lg transition-transform group-hover:rotate-12
                  ${isPaid ? 'bg-emerald-600 shadow-emerald-100' : 'bg-amber-500 shadow-amber-100'}`}>
                  {isPaid ? '✓' : '⌛'}
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-sm
                  ${isPaid ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-amber-600 border-amber-100'}`}>
                  {isPaid ? 'Paiement effectué' : 'En attente'}
                </span>
              </div>

              <div className="mb-8">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                  Commission due
                </p>
                <h3 className={`text-4xl font-black tracking-tight leading-none mb-6 
                  ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {s.commission.toLocaleString()} <span className="text-xs">FCFA</span>
                </h3>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-100 flex-1">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Bénéficiaire (Agent)</p>
                    <p className="font-black text-gray-800 text-lg leading-tight truncate">{agentName}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Provenance (Client)</p>
                    <p className="font-bold text-gray-500 text-sm truncate">{clientName}</p>
                 </div>
              </div>

              <div className="mt-8">
                {!readOnly && s.status === 'PENDING' && (
                  <button 
                    onClick={() => setConfirmPaySale(s)} 
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-[10px] tracking-widest pt-6 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    Valider Règlement
                  </button>
                )}
                {isPaid && (
                  <div className="w-full py-5 bg-emerald-100/50 text-emerald-600 rounded-[1.75rem] font-black uppercase text-[10px] tracking-widest pt-6 border border-emerald-100 text-center">
                    Transaction Réglée
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CONFIRMATION PAIEMENT */}
      {confirmPaySale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md" onClick={() => setConfirmPaySale(null)}></div>
           <div className="bg-white rounded-[4rem] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 border-2 border-indigo-50">
              <div className="p-10 border-b-2 border-gray-50 bg-gray-50/50 rounded-t-[4rem] text-center">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">💰</div>
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Confirmer le règlement</h3>
                 <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Action Définitive</p>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-gray-50">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</span>
                       <span className="font-black text-gray-800">{getAgentName(confirmPaySale.agentId)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-50">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</span>
                       <span className="font-black text-gray-800">{getClientName(confirmPaySale.clientId)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant due</span>
                       <span className="text-2xl font-black text-emerald-600">{confirmPaySale.commission.toLocaleString()} FCFA</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <button 
                       onClick={() => handleUpdateStatus(confirmPaySale)}
                       className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl pt-6 hover:bg-emerald-700 transition-all"
                    >
                       Confirmer le paiement
                    </button>
                    <button 
                       onClick={() => setConfirmPaySale(null)}
                       className="w-full py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] pt-6 tracking-widest hover:bg-gray-200 transition-all"
                    >
                       Annuler
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const AdminNotificationsView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [notifications, setNotifications] = useState<NotificationApp[]>([]);
  useEffect(() => { 
    const load = async () => setNotifications(await dataService.getNotifications());
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black text-gray-900">Alertes & Système</h1>
      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n.id} className={`p-6 rounded-[2rem] border ${n.read ? 'bg-white' : 'bg-indigo-50/50 border-indigo-100'}`}>
            <h4 className="font-black text-gray-900">{n.title}</h4>
            <p className="text-gray-600 text-sm">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminSettingsView: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [settings, setSettings] = useState({ name: 'AFTRAS CRM', currency: 'FCFA' });
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      setSettings(await dataService.getAppSettings());
      setAppLogo(await dataService.getAppLogo());
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;
    const fd = new FormData(e.currentTarget);
    await dataService.updateAppSettings({
      name: fd.get('name') as string,
      currency: fd.get('currency') as string
    });
    alert('Enregistré !');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black text-gray-900 text-center">Paramètres</h1>
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-10">
        <div className="flex flex-col items-center">
           <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
             {appLogo ? <img src={appLogo} alt="Logo" className="w-full h-full object-contain p-4" /> : "🖼️"}
           </div>
           {!readOnly && <button onClick={() => logoRef.current?.click()} className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Changer le logo</button>}
           <input type="file" ref={logoRef} className="hidden" onChange={async (e) => { if (e.target.files?.[0]) { const r = new FileReader(); r.onloadend = async () => { await dataService.updateAppLogo(r.result as string); setAppLogo(r.result as string); }; r.readAsDataURL(e.target.files[0]); } }} />
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom de l'App</label>
            <input name="name" defaultValue={settings.name} required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Devise</label>
            <input name="currency" defaultValue={settings.currency} required className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold" />
          </div>
          {!readOnly && <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] pt-6 shadow-xl shadow-indigo-100">Mettre à jour</button>}
        </form>
      </div>
    </div>
  );
};

export const AdminProfileView: React.FC<{ user: UserApp; onUpdate: (user: UserApp) => void; readOnly?: boolean }> = ({ user, onUpdate, readOnly = false }) => {
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;
    const fd = new FormData(e.currentTarget);
    const updated = await dataService.updateUser(user.id, {
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      phone: fd.get('phone') as string,
    });
    onUpdate(updated);
    alert('Profil mis à jour !');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 animate-in fade-in duration-700">
      <h1 className="text-4xl font-black text-gray-900 text-center tracking-tight">Profil Admin</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-10">Infos Personnelles</h3>
          <form onSubmit={handleUpdate} className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <input name="firstName" defaultValue={user.firstName} placeholder="Prénom" required className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-100" />
              <input name="lastName" defaultValue={user.lastName} placeholder="Nom" required className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-100" />
            </div>
            <input value={user.email} readOnly className="w-full px-6 py-4 bg-gray-100/50 rounded-2xl font-bold cursor-not-allowed text-gray-400 border-2 border-transparent" />
            <input name="phone" defaultValue={user.phone} placeholder="Téléphone" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-100" />
            {!readOnly && <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] pt-6 shadow-xl shadow-indigo-100">Enregistrer</button>}
          </form>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-50 shadow-xl flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-10">Sécurité Accès</h3>
          <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-sm font-medium text-gray-500 text-center italic leading-relaxed">Le changement de mot de passe administrateur s'effectue via la console d'authentification Firebase pour des raisons de haute sécurité.</p>
          </div>
        </div>
      </div>
    </div>
  );
};