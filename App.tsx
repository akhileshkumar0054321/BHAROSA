
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Transaction, Customer, ActiveTrustLine, RegistrationData, ShopkeeperSession } from './types';
import { MOCK_USER, MOCK_TRANSACTIONS, MOCK_CUSTOMERS, MOCK_TRUST_LINES } from './constants';
import PremiumCard from './components/PremiumCard';
import DashboardHeader from './components/DashboardHeader';
import RegistrationFlow from './components/RegistrationFlow';
import ShopkeeperHome from './components/ShopkeeperHome';
import { getTrustInsights } from './services/geminiService';
import { 
  CreditCard, 
  Store, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  MessageSquareQuote,
  Wallet,
  Award,
  CheckCircle2,
  Scan,
  Gem,
  ArrowRightLeft
} from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [shopkeeperSession, setShopkeeperSession] = useState<ShopkeeperSession | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('Initializing Concierge...');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!role) return;
    setLoadingInsights(true);
    const data = role === UserRole.CUSTOMER ? MOCK_TRANSACTIONS : MOCK_CUSTOMERS;
    const insight = await getTrustInsights(data, role.toString());
    setAiInsight(insight);
    setLoadingInsights(false);
  }, [role]);

  useEffect(() => {
    if (role && !isRegistering && !shopkeeperSession) {
      fetchInsights();
    }
  }, [role, isRegistering, shopkeeperSession, fetchInsights]);

  const handleRoleSelection = (selectedRole: UserRole) => {
    if (selectedRole === UserRole.SHOPKEEPER) {
      setIsRegistering(true);
    }
    setRole(selectedRole);
  };

  const completeRegistration = (data: RegistrationData) => {
    setShopkeeperSession({ ...data, isRegistered: true });
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setRole(null);
    setShopkeeperSession(null);
    setIsRegistering(false);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-6 amex-pattern">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12 pl-4">
            <div className="space-y-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#4DA6FF] text-[#0B0F1A] flex items-center justify-center font-serif text-4xl font-bold italic rounded-lg shadow-[0_0_30px_rgba(77,166,255,0.2)]">B</div>
                  <h1 className="text-6xl font-serif font-bold tracking-tight text-white uppercase">BHAROSA</h1>
               </div>
               <div className="relative pl-6 border-l-2 border-[#2A3352]">
                 <p className="text-3xl font-serif italic text-white/70 leading-snug">"Where Reputation <br/>Builds Business"</p>
               </div>
            </div>
            <div className="space-y-10">
              <FeatureItem icon={<ShieldCheck size={20} />} title="Customer Trust" desc="Infinite reliability scores backed by real-time blockchain-grade verification." />
              <FeatureItem icon={<Wallet size={20} />} title="Easy Loan" desc="Frictionless, on-demand credit lines that adapt to your financial movement." />
              <FeatureItem icon={<Zap size={20} />} title="Authenticated" desc="Elite biometric standards ensuring every handshake is as secure as a vault." />
            </div>
          </div>
          <div className="bg-[#141C2F] border border-[#2A3352] rounded-[3rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] flex flex-col min-h-[580px] justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4DA6FF]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="space-y-12 relative py-8">
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-serif text-white">Access the <span className="text-[#4DA6FF] bg-[#4DA6FF]/10 px-4 py-1 rounded-lg">Ledger</span></h2>
                <p className="text-[#AAB0C5] text-[10px] tracking-[0.4em] uppercase font-bold opacity-80">Select Your Global Status</p>
              </div>
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <button onClick={() => handleRoleSelection(UserRole.CUSTOMER)} className="group w-full flex items-center justify-between p-7 bg-[#0B0F1A]/40 border border-[#2A3352] rounded-[2rem] hover:bg-[#4DA6FF]/5 hover:border-[#4DA6FF]/40 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-6 text-left">
                    <div className="p-4 bg-[#1C2438] rounded-2xl group-hover:bg-[#4DA6FF]/20 transition-all"><CreditCard size={28} className="text-[#4DA6FF]" /></div>
                    <div><h3 className="font-bold text-xl text-white">Customer</h3><p className="text-xs text-[#6B7280] font-medium tracking-wide">Elite trust lines & global spend.</p></div>
                  </div>
                  <ChevronRight size={18} className="text-[#2A3352] group-hover:text-[#4DA6FF] transform group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => handleRoleSelection(UserRole.SHOPKEEPER)} className="group w-full flex items-center justify-between p-7 bg-[#0B0F1A]/40 border border-[#2A3352] rounded-[2rem] hover:bg-[#3DDC97]/5 hover:border-[#3DDC97]/40 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-6 text-left">
                    <div className="p-4 bg-[#1C2438] rounded-2xl group-hover:bg-[#3DDC97]/20 transition-all"><Store size={28} className="text-[#3DDC97]" /></div>
                    <div><h3 className="font-bold text-xl text-white">Shopkeeper</h3><p className="text-xs text-[#6B7280] font-medium tracking-wide">Portfolio growth & risk indexing.</p></div>
                  </div>
                  <ChevronRight size={18} className="text-[#2A3352] group-hover:text-[#3DDC97] transform group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
            <div className="pt-8 border-t border-[#2A3352]/50 mt-8"><p className="text-[9px] text-center text-[#6B7280] tracking-[0.4em] uppercase font-bold">Authorized Bharosa Infrastructure</p></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to Shopkeeper Home after registration
  if (role === UserRole.SHOPKEEPER && shopkeeperSession) {
    return <ShopkeeperHome session={shopkeeperSession} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      <DashboardHeader title="BHAROSA" onReset={handleLogout} />
      
      {isRegistering && role === UserRole.SHOPKEEPER && (
        <RegistrationFlow 
          onComplete={completeRegistration} 
          onCancel={handleLogout} 
        />
      )}

      <main className={`max-w-7xl mx-auto p-6 space-y-10 transition-all duration-500 ${isRegistering ? 'blur-xl grayscale' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#2A3352] pb-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-[0.4em] text-[#4DA6FF] uppercase italic">The Trust Circle</p>
            <h2 className="text-4xl font-serif font-bold text-white leading-tight">
              {role === UserRole.CUSTOMER ? 'Platinum Portfolio' : 'Elite Merchant Desk'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {role === UserRole.CUSTOMER && (
              <button className="flex items-center gap-2 px-6 py-3 bg-[#4DA6FF] text-[#0B0F1A] rounded-full text-[10px] tracking-[0.2em] uppercase font-bold shadow-lg hover:bg-white transition-all">
                <Scan size={14} /> Scan to Pay
              </button>
            )}
            <div className="flex items-center gap-3 px-5 py-3 bg-[#1C2438] border border-[#2A3352] rounded-full text-[10px] tracking-[0.2em] uppercase text-[#AAB0C5] font-bold">
              <Gem size={14} className="text-[#4DA6FF]" />
              {role === UserRole.CUSTOMER ? 'Sovereign Holder' : 'Master Merchant'}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1C2438] to-transparent border-l-4 border-[#4DA6FF] p-8 rounded-r-3xl relative overflow-hidden group shadow-xl">
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-3 bg-[#4DA6FF]/10 rounded-2xl text-[#4DA6FF]"><MessageSquareQuote size={28} /></div>
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.4em] uppercase text-[#4DA6FF] font-bold">Concierge Intelligence</p>
              <p className="text-xl font-serif italic text-white/90 leading-relaxed font-medium">{loadingInsights ? <span className="inline-block w-64 h-5 bg-[#2A3352] animate-pulse rounded"></span> : `"${aiInsight}"`}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
             {role === UserRole.CUSTOMER ? (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <PremiumCard user={MOCK_USER} />
                    <div className="space-y-6">
                      <StatCard label="Unified Trust Power" value={`₹${MOCK_USER.availableLimit.toLocaleString()}`} sub={`Total Limit: ₹${MOCK_USER.trustLimit.toLocaleString()}`} percent={(MOCK_USER.availableLimit / MOCK_USER.trustLimit) * 100} />
                      <div className="grid grid-cols-3 gap-4">
                         <div className="p-4 bg-[#1C2438] border border-[#2A3352] rounded-2xl text-center"><p className="text-[8px] text-[#AAB0C5] tracking-widest uppercase mb-1 font-bold">Reputation</p><p className="text-xl font-bold font-serif italic text-[#3DDC97]">{MOCK_USER.trustScore}</p></div>
                         <div className="p-4 bg-[#1C2438] border border-[#2A3352] rounded-2xl text-center"><p className="text-[8px] text-[#AAB0C5] tracking-widest uppercase mb-1 font-bold">Global Rank</p><p className="text-xl font-bold font-serif italic text-[#4DA6FF]">#124</p></div>
                         <div className="p-4 bg-[#1C2438] border border-[#2A3352] rounded-2xl text-center"><p className="text-[8px] text-[#AAB0C5] tracking-widest uppercase mb-1 font-bold">Yield</p><p className="text-xl font-bold font-serif italic text-white">4.2%</p></div>
                      </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                   <div className="flex justify-between items-center px-2"><h3 className="text-xl font-serif font-bold italic text-white">The Merchant Circle</h3><span className="text-[9px] tracking-[0.3em] text-[#AAB0C5] uppercase font-bold">Your Trusted Partners</span></div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {MOCK_TRUST_LINES.map(line => (
                        <div key={line.id} className="p-6 bg-[#1C2438] border border-[#2A3352] rounded-[1.5rem] hover:border-[#4DA6FF]/40 transition-all group cursor-pointer shadow-lg">
                           <div className="flex justify-between items-start mb-4"><div className="p-2 bg-[#0B0F1A] rounded-lg group-hover:bg-[#4DA6FF] group-hover:text-[#0B0F1A] transition-colors"><Store size={18} /></div><span className="text-[9px] font-bold text-[#AAB0C5] uppercase tracking-widest">{line.category}</span></div>
                           <h4 className="font-bold text-white mb-2">{line.merchantName}</h4>
                           <div className="space-y-1"><p className="text-[9px] text-[#6B7280] uppercase tracking-tighter">Utilized Trust</p><div className="flex justify-between items-end"><p className="text-lg font-serif italic text-white">₹{line.utilized.toLocaleString()}</p><p className="text-[10px] text-[#AAB0C5]">/ ₹{line.limit.toLocaleString()}</p></div><div className="w-full h-1 bg-[#0B0F1A] rounded-full mt-2"><div className="h-full bg-[#4DA6FF]" style={{ width: `${(line.utilized/line.limit)*100}%` }}></div></div></div>
                        </div>
                      ))}
                      <div className="p-6 border-2 border-dashed border-[#2A3352] rounded-[1.5rem] flex flex-col items-center justify-center text-[#AAB0C5] hover:border-[#4DA6FF]/40 transition-all cursor-pointer group"><div className="p-3 bg-[#1C2438] rounded-full mb-3 group-hover:scale-110 transition-transform"><Plus size={24} /></div><span className="text-[10px] font-bold tracking-widest uppercase">Request New Trust</span></div>
                   </div>
                 </div>
               </>
             ) : (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <MerchantStat icon={<ArrowUpRight className="text-[#3DDC97]" />} label="Total Assets" value="₹2.45M" trend="+12.4%" />
                   <MerchantStat icon={<UsersIcon className="text-[#4DA6FF]" />} label="Merchant Network" value="1.4k" trend="+4" />
                   <MerchantStat icon={<Award className="text-white" />} label="Trust Badge" value="Elite" trend="Active" />
                 </div>
                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-xl font-serif italic font-bold text-white">Elite Trust Portfolio</h3>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAB0C5]" /><input type="text" placeholder="Find Member..." className="bg-[#1C2438] border border-[#2A3352] rounded-full py-2.5 pl-11 pr-5 text-xs focus:outline-none focus:border-[#4DA6FF] transition-all w-full sm:w-56 text-white" /></div>
                        <button className="bg-[#4DA6FF] text-[#0B0F1A] text-[10px] font-bold tracking-widest px-6 py-2.5 rounded-full hover:bg-white transition-all uppercase whitespace-nowrap">Provision Account</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {MOCK_CUSTOMERS.map(c => (
                         <div key={c.id} className="group flex items-center justify-between p-6 bg-[#1C2438] border border-[#2A3352] rounded-[1.5rem] hover:border-[#4DA6FF]/40 transition-all cursor-pointer shadow-md hover:shadow-[#4DA6FF]/5">
                            <div className="flex items-center gap-5">
                               <div className="w-14 h-14 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl flex items-center justify-center font-serif text-xl text-white group-hover:bg-[#4DA6FF] group-hover:text-[#0B0F1A] transition-all duration-300 font-bold">{c.name[0]}</div>
                               <div><h4 className="font-bold text-lg text-white">{c.name}</h4><p className="text-xs text-[#AAB0C5] tracking-wider">{c.phone}</p></div>
                            </div>
                            <div className="text-right flex items-center gap-10">
                               <div className="hidden lg:block text-left"><p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold">Activity Status</p><div className="flex items-center gap-1.5 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-[#3DDC97] animate-pulse"></div><p className="text-xs text-[#AAB0C5]">{c.lastActive}</p></div></div>
                               <div className="text-right"><p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold">Trust Balance</p><p className="text-xl font-serif italic font-bold text-white">₹{c.totalDue.toLocaleString()}</p></div>
                               <div className="p-2 bg-[#0B0F1A] rounded-full text-[#2A3352] group-hover:text-[#4DA6FF] transition-colors"><ChevronRight size={18} /></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </>
             )}
          </div>
          <div className="lg:col-span-4 space-y-10">
             <div className="bg-[#1C2438] border border-[#2A3352] rounded-[2rem] overflow-hidden p-8 space-y-8 shadow-2xl relative"><div className="absolute top-0 right-0 p-4"><Clock size={16} className="text-[#2A3352]" /></div><div className="flex justify-between items-center"><h3 className="text-xl font-serif font-bold text-white italic">Elite Ledger</h3><button className="text-[9px] tracking-[0.2em] uppercase text-[#4DA6FF] font-bold hover:underline underline-offset-8">All Activity</button></div><div className="space-y-6">{MOCK_TRANSACTIONS.map((t, idx) => (<div key={t.id} className={`flex items-start gap-5 pb-6 ${idx !== MOCK_TRANSACTIONS.length - 1 ? 'border-b border-[#2A3352]' : ''}`}><div className={`p-2.5 rounded-xl ${t.type === 'CREDIT' ? 'bg-[#3DDC97]/10 text-[#3DDC97]' : 'bg-[#4DA6FF]/10 text-[#4DA6FF]'}`}>{t.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}</div><div className="flex-1"><div className="flex justify-between items-start"><span className="font-semibold text-sm text-white tracking-wide">{t.description}</span><span className={`font-serif italic font-bold text-lg ${t.type === 'CREDIT' ? 'text-[#3DDC97]' : 'text-white'}`}>{t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString()}</span></div><div className="flex justify-between mt-1 text-[10px] text-[#6B7280] tracking-[0.1em] font-medium uppercase"><span>{t.date}</span><span className={`flex items-center gap-1.5 ${t.status === 'SETTLED' ? 'text-[#3DDC97]/80' : 'text-[#AAB0C5]'}`}>{t.status === 'SETTLED' ? <CheckCircle2 size={11} /> : <Clock size={11} />}{t.status}</span></div></div></div>))}</div><button className="w-full py-4 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl text-[9px] font-bold tracking-[0.4em] uppercase text-[#AAB0C5] hover:text-[#4DA6FF] hover:border-[#4DA6FF]/40 transition-all shadow-inner">Generate Statements</button></div>
             <div className="bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-[2rem] p-8 space-y-8 relative overflow-hidden group shadow-2xl"><div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#4DA6FF]/10 rounded-full blur-[80px]"></div><div className="space-y-2 relative"><h3 className="text-2xl font-serif font-bold italic text-white leading-tight">Elite Access</h3><p className="text-[9px] text-[#AAB0C5] tracking-[0.3em] uppercase font-bold">Unlocking The Future</p></div><div className="space-y-5 relative"><BenefitItem icon={<ArrowRightLeft size={16} className="text-[#4DA6FF]" />} text="Instant Trust Transfer" /><BenefitItem icon={<Zap size={16} className="text-[#3DDC97]" />} text="Reputation-Based Credit" /><BenefitItem icon={<Award size={16} className="text-[#4DA6FF]" />} text="Global Network Rewards" /></div><button className="w-full py-5 bg-white text-[#0B0F1A] rounded-2xl text-xs font-bold tracking-[0.2em] uppercase hover:scale-[1.03] transition-all shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)]">Expand Portfolio</button></div>
          </div>
        </div>
      </main>
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-[#2A3352] text-[9px] tracking-[0.4em] text-[#6B7280] text-center uppercase font-bold">BHAROSA GLOBAL INFRASTRUCTURE &copy; 2024. <span className="text-[#4DA6FF]">The Standard of Financial Trust.</span></footer>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (<div className="flex gap-8 items-start group"><div className="mt-1 p-4 bg-[#1C2438]/50 border border-[#2A3352] rounded-2xl group-hover:scale-110 group-hover:border-[#4DA6FF]/40 group-hover:bg-[#4DA6FF]/10 transition-all shadow-xl text-[#4DA6FF]">{icon}</div><div className="space-y-2"><h4 className="font-bold text-2xl text-white tracking-tight">{title}</h4><p className="text-sm text-[#AAB0C5] leading-relaxed max-w-sm">{desc}</p></div></div>);
const StatCard = ({ label, value, sub, percent }: { label: string, value: string, sub: string, percent: number }) => (<div className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-5 shadow-xl relative overflow-hidden group"><div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA6FF]/5 rounded-full blur-2xl group-hover:bg-[#4DA6FF]/10 transition-colors"></div><p className="text-[10px] text-[#AAB0C5] tracking-[0.3em] uppercase font-bold relative">{label}</p><div className="flex items-baseline gap-3 relative"><h3 className="text-4xl font-serif font-bold italic text-white">{value}</h3><span className="text-[10px] text-[#6B7280] italic font-medium">{sub}</span></div><div className="w-full h-1.5 bg-[#0B0F1A] rounded-full overflow-hidden relative shadow-inner"><div className="h-full bg-gradient-to-r from-[#4DA6FF] to-[#3DDC97] transition-all duration-1000" style={{ width: `${percent}%` }}></div></div></div>);
const MerchantStat = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) => (<div className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-5 shadow-lg group hover:border-[#4DA6FF]/20 transition-all"><div className="flex justify-between items-start"><div className="p-3 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl group-hover:scale-110 transition-transform">{icon}</div><span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'bg-[#3DDC97]/10 text-[#3DDC97]' : 'bg-[#6B7280]/10 text-[#6B7280]'}`}>{trend}</span></div><div><p className="text-[9px] text-[#6B7280] tracking-[0.3em] uppercase font-bold">{label}</p><p className="text-3xl font-serif font-bold italic text-white mt-1">{value}</p></div></div>);
const BenefitItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (<div className="flex items-center gap-4 text-xs text-[#AAB0C5] group/item cursor-pointer"><div className="p-2 bg-[#0B0F1A] rounded-lg group-hover/item:scale-110 transition-transform">{icon}</div><span className="tracking-widest font-bold text-[10px] uppercase group-hover/item:text-white transition-colors">{text}</span></div>);
const UsersIcon = ({ className }: { className?: string }) => (<svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);

export default App;
