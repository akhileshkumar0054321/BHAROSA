
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Transaction, Customer, ActiveTrustLine, RegistrationData, ShopkeeperSession, CustomerSession, CustomerRegistrationData } from './types';
import { MOCK_USER, MOCK_TRANSACTIONS, MOCK_CUSTOMERS, MOCK_TRUST_LINES } from './constants';
import PremiumCard from './components/PremiumCard';
import DashboardHeader from './components/DashboardHeader';
import RegistrationFlow from './components/RegistrationFlow';
import CustomerRegistrationFlow from './components/CustomerRegistrationFlow';
import ShopkeeperHome from './components/ShopkeeperHome';
import CustomerHome from './components/CustomerHome';
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
  ArrowRightLeft,
  // Added missing Loader2 import from lucide-react
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [shopkeeperSession, setShopkeeperSession] = useState<ShopkeeperSession | null>(null);
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
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
    if (role && !isRegistering && !shopkeeperSession && !customerSession) {
      fetchInsights();
    }
  }, [role, isRegistering, shopkeeperSession, customerSession, fetchInsights]);

  const handleRoleSelection = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsRegistering(true);
  };

  const completeShopkeeperRegistration = (data: RegistrationData) => {
    setShopkeeperSession({ ...data, isRegistered: true });
    setIsRegistering(false);
  };

  const completeCustomerRegistration = (data: CustomerRegistrationData) => {
    setCustomerSession({ ...data, isRegistered: true });
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setRole(null);
    setShopkeeperSession(null);
    setCustomerSession(null);
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

  // Handle Registration Flows
  if (isRegistering) {
    if (role === UserRole.SHOPKEEPER) {
      return <RegistrationFlow onComplete={completeShopkeeperRegistration} onCancel={handleLogout} />;
    } else {
      return <CustomerRegistrationFlow onComplete={completeCustomerRegistration} onCancel={handleLogout} />;
    }
  }

  // Redirect to Role-specific Home after registration
  if (role === UserRole.SHOPKEEPER && shopkeeperSession) {
    return <ShopkeeperHome session={shopkeeperSession} onLogout={handleLogout} />;
  }
  
  if (role === UserRole.CUSTOMER && customerSession) {
    return <CustomerHome session={customerSession} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#4DA6FF]" size={48} />
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (<div className="flex gap-8 items-start group"><div className="mt-1 p-4 bg-[#1C2438]/50 border border-[#2A3352] rounded-2xl group-hover:scale-110 group-hover:border-[#4DA6FF]/40 group-hover:bg-[#4DA6FF]/10 transition-all shadow-xl text-[#4DA6FF]">{icon}</div><div className="space-y-2"><h4 className="font-bold text-2xl text-white tracking-tight">{title}</h4><p className="text-sm text-[#AAB0C5] leading-relaxed max-w-sm">{desc}</p></div></div>);
const StatCard = ({ label, value, sub, percent }: { label: string, value: string, sub: string, percent: number }) => (<div className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-5 shadow-xl relative overflow-hidden group"><div className="absolute top-0 right-0 w-24 h-24 bg-[#4DA6FF]/5 rounded-full blur-2xl group-hover:bg-[#4DA6FF]/10 transition-colors"></div><p className="text-[10px] text-[#AAB0C5] tracking-[0.3em] uppercase font-bold relative">{label}</p><div className="flex items-baseline gap-3 relative"><h3 className="text-4xl font-serif font-bold italic text-white">{value}</h3><span className="text-[10px] text-[#6B7280] italic font-medium">{sub}</span></div><div className="w-full h-1.5 bg-[#0B0F1A] rounded-full overflow-hidden relative shadow-inner"><div className="h-full bg-gradient-to-r from-[#4DA6FF] to-[#3DDC97] transition-all duration-1000" style={{ width: `${percent}%` }}></div></div></div>);
const MerchantStat = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) => (<div className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-5 shadow-lg group hover:border-[#4DA6FF]/20 transition-all"><div className="flex justify-between items-start"><div className="p-3 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl group-hover:scale-110 transition-transform">{icon}</div><span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'bg-[#3DDC97]/10 text-[#3DDC97]' : 'bg-[#6B7280]/10 text-[#6B7280]'}`}>{trend}</span></div><div><p className="text-[9px] text-[#6B7280] tracking-[0.3em] uppercase font-bold">{label}</p><p className="text-3xl font-serif font-bold italic text-white mt-1">{value}</p></div></div>);
const BenefitItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (<div className="flex items-center gap-4 text-xs text-[#AAB0C5] group/item cursor-pointer"><div className="p-2 bg-[#0B0F1A] rounded-lg group-hover/item:scale-110 transition-transform">{icon}</div><span className="tracking-widest font-bold text-[10px] uppercase group-hover/item:text-white transition-colors">{text}</span></div>);
const UsersIcon = ({ className }: { className?: string }) => (<svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);

export default App;
