
import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, QrCode, Download, Wallet, Grid, 
  Scan, X, ShieldCheck, Hash, ChevronRight,
  CheckCircle2, TrendingUp, Landmark, AlertTriangle,
  Briefcase, IndianRupee, History, Building2, MapPin, 
  Clock, Star, ListFilter, Receipt, UserCheck, BellRing,
  ArrowUpRight, Share2, Filter, Send, Check, BarChart3,
  Globe, Zap, Sparkles, Megaphone, Coins, Plus, CreditCard,
  MessageSquareQuote, Sparkle
} from 'lucide-react';
import { ShopkeeperSession, BankOffer, Transaction } from '../types';
import { getTrustInsights } from '../services/geminiService';

interface ShopkeeperHomeProps {
  session: ShopkeeperSession;
  onLogout: () => void;
}

const INITIAL_TRANSACTIONS: any[] = [
  { id: 'tx-101', customerId: 'CUST-8821', customerName: 'Rajesh Khanna', amount: 1250, date: new Date().toISOString(), status: 'PAID' },
  { id: 'tx-102', customerId: 'CUST-4412', customerName: 'Anjali Sharma', amount: 4500, date: new Date().toISOString(), status: 'PENDING' },
  { id: 'tx-103', customerId: 'CUST-0092', customerName: 'Vikram Singh', amount: 800, date: new Date(Date.now() - 86400000).toISOString(), status: 'PAID' },
  { id: 'tx-104', customerId: 'CUST-1123', customerName: 'Priya Malhotra', amount: 2100, date: new Date(Date.now() - 172800000).toISOString(), status: 'PAID' },
  { id: 'tx-old-1', customerId: 'CUST-0092', customerName: 'Vikram Singh', amount: 15000, date: '2024-01-15T10:00:00Z', status: 'PAID' },
];

const INITIAL_CUSTOMERS = [
  { id: 'CUST-8821', name: 'Rajesh Khanna', txCount: 12, behavior: 'Good', lastPayment: 'Today' },
  { id: 'CUST-4412', name: 'Anjali Sharma', txCount: 5, behavior: 'Poor', lastPayment: '3 days ago' },
  { id: 'CUST-0092', name: 'Vikram Singh', txCount: 28, behavior: 'Premium', lastPayment: 'Yesterday' },
  { id: 'CUST-1123', name: 'Priya Malhotra', txCount: 8, behavior: 'Good', lastPayment: '2 days ago' },
];

const MOCK_INSTALLMENTS = [
  { id: 'inst-101', bank: 'Standard Trust Bank', month: 'June 2024', principal: 12000, interest: 840, total: 12840, status: 'DUE' },
  { id: 'inst-102', bank: 'Sovereign Capital', month: 'June 2024', principal: 25000, interest: 1375, total: 26375, status: 'UPCOMING' },
];

const MOCK_BANKS: BankOffer[] = [
  { id: 'b1', bankName: 'Standard Trust Bank', maxAmount: 500000, baseInterest: 6.97, minScore: 700, logoColor: 'bg-[#4DA6FF]' },
  { id: 'b2', bankName: 'National Merchant Corp', maxAmount: 200000, baseInterest: 7.47, minScore: 500, logoColor: 'bg-[#3DDC97]' },
  { id: 'b4', bankName: 'Sovereign Capital', maxAmount: 1000000, baseInterest: 5.47, minScore: 800, logoColor: 'bg-white' },
];

const GOV_SCHEMES = [
  { id: 'S1', name: 'PM SVANidhi', status: 'ACTIVE', desc: 'Special Micro-Credit Facility for Street Vendors providing affordable working capital loans.' },
  { id: 'S2', name: 'MUDRA Yojana', status: 'ELIGIBLE', desc: 'Pradhan Mantri MUDRA Yojana (PMMY) for providing loans up to 10 lakh to the non-corporate, non-farm small/micro enterprises.' },
  { id: 'S3', name: 'Stand-Up India', status: 'LOCKED', desc: 'Facilitating bank loans between 10 lakh and 1 Crore to at least one SC/ST borrower and one woman borrower per bank branch.' },
];

const ShopkeeperHome: React.FC<ShopkeeperHomeProps> = ({ session, onLogout }) => {
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'QR' | 'CREDIT' | 'LOAN' | 'TOOLS' | 'PROFILE' | 'TRANSACTIONS' | 'PENDING' | 'CUSTOMERS' | 'MY_LOANS' | 'GOV_SCHEMES' | 'FRANCHISES' | 'INCOME' | 'MONETIZE' | 'CREATORS'>('HOME');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [scanning, setScanning] = useState(false);
  const [appliedLoans, setAppliedLoans] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // AI Insights State
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Installment Management
  const [paidInstallments, setPaidInstallments] = useState<string[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);

  const handleMarkAsPaid = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'PAID' } : tx));
  };

  const handlePayInstallment = (id: string) => {
    setIsProcessingPayment(id);
    setTimeout(() => {
      setPaidInstallments(prev => [...prev, id]);
      setIsProcessingPayment(null);
    }, 2000);
  };

  // Fetch AI Insights when entering Credit Screen
  useEffect(() => {
    if (activeScreen === 'CREDIT' && !aiRecommendation) {
      const fetchAiAdvice = async () => {
        setLoadingAi(true);
        const data = {
          score: currentCreditScore,
          transactions: transactions.length,
          owner: session.ownerName
        };
        const insight = await getTrustInsights(data, 'SHOPKEEPER_STRATEGY');
        setAiRecommendation(insight || "Your financial trajectory remains stable. Maintain current liquidity to unlock Tier-1 credit lines.");
        setLoadingAi(false);
      };
      fetchAiAdvice();
    }
  }, [activeScreen]);

  const todayTransactions = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.date).toDateString() === today && t.status === 'PAID');
  }, [transactions]);

  const todaySum = useMemo(() => todayTransactions.reduce((acc, t) => acc + t.amount, 0), [todayTransactions]);
  const pendingTransactions = useMemo(() => transactions.filter(t => t.status === 'PENDING'), [transactions]);
  const currentCreditScore = 742;

  const incomeStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthly = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'PAID';
    }).reduce((sum, t) => sum + t.amount, 0);

    const yearly = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && t.status === 'PAID';
    }).reduce((sum, t) => sum + t.amount, 0);

    return { monthly, yearly };
  }, [transactions]);

  const sortedCustomers = useMemo(() => {
    return [...INITIAL_CUSTOMERS].sort((a, b) => b.txCount - a.txCount);
  }, []);

  const eligibleLoans = useMemo(() => {
    return MOCK_BANKS.map(bank => {
      const isEligible = currentCreditScore >= bank.minScore;
      const scoreBonus = (currentCreditScore - 300) / 600; 
      const adjustedInterest = isEligible 
        ? (bank.baseInterest - (scoreBonus * 2)).toFixed(1) 
        : (bank.baseInterest + 5).toFixed(1);
      return { ...bank, adjustedInterest, isEligible };
    });
  }, [currentCreditScore]);

  const handleApplyLoan = (bank: any) => setSelectedBank(bank);

  const submitLoanApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newLoan = { ...selectedBank, status: 'PENDING', date: new Date().toLocaleDateString() };
      setAppliedLoans(prev => [...prev, newLoan]);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedBank(null);
        setActiveScreen('MY_LOANS');
      }, 2000);
    }, 2000);
  };

  const SidebarButton = ({ icon, label, sub, onClick, active }: any) => (
    <button 
      onClick={onClick} 
      className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all duration-300 ${active ? 'bg-[#4DA6FF] text-[#0B0F1A] shadow-lg shadow-[#4DA6FF]/20' : 'text-[#AAB0C5] hover:bg-[#1C2438] hover:text-white'}`}
    >
      <div className={`${active ? 'text-[#0B0F1A]' : 'text-[#4DA6FF]'}`}>{icon}</div>
      <div className="text-left flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
        {sub && <p className={`text-[8px] mt-0.5 font-medium ${active ? 'text-[#0B0F1A]/70' : 'text-[#6B7280]'}`}>{sub}</p>}
      </div>
      <ChevronRight size={14} className={`opacity-30 ${active ? 'translate-x-1' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col md:flex-row amex-pattern transition-all duration-500 overflow-hidden font-['Inter']">
      
      {/* LEFT PANEL */}
      <aside className="w-full md:w-80 border-r border-[#2A3352] bg-[#0B0F1A] flex flex-col p-6 space-y-8 z-50 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#4DA6FF] rounded-xl flex items-center justify-center font-serif text-2xl font-bold italic text-[#0B0F1A]">B</div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">{session.ownerName.split(' ')[0]}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3DDC97] animate-pulse"></div>
                <p className="text-[8px] text-[#AAB0C5] uppercase font-bold tracking-widest">Verified Merchant</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C2438] border border-[#2A3352] rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-[8px] text-[#6B7280] uppercase tracking-[0.2em] font-bold">Today's Summary</p>
              <Clock size={12} className="text-[#4DA6FF]" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-mono text-white">₹{todaySum.toLocaleString()}</p>
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                <span className="text-[#AAB0C5]">Paid Transactions</span>
                <span className="text-[#3DDC97]">{todayTransactions.length} Settled</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarButton icon={<Receipt size={18}/>} label="Transactions" sub="Settled history" active={activeScreen === 'TRANSACTIONS'} onClick={() => setActiveScreen('TRANSACTIONS')} />
          <SidebarButton icon={<BellRing size={18}/>} label="Pending Khata" sub="Collection required" active={activeScreen === 'PENDING'} onClick={() => setActiveScreen('PENDING')} />
          <SidebarButton icon={<UserCheck size={18}/>} label="Customers" sub="Trust behavior index" active={activeScreen === 'CUSTOMERS'} onClick={() => setActiveScreen('CUSTOMERS')} />
          <SidebarButton icon={<Briefcase size={18}/>} label="Business Tools" sub="Growth & Analytics" active={activeScreen === 'TOOLS'} onClick={() => setActiveScreen('TOOLS')} />
          <SidebarButton icon={<History size={18}/>} label="Pay Loan" sub="Repayments & limits" active={activeScreen === 'MY_LOANS'} onClick={() => setActiveScreen('MY_LOANS')} />
          <SidebarButton icon={<Building2 size={18}/>} label="My Business" sub="Merchant Identity" active={activeScreen === 'PROFILE'} onClick={() => setActiveScreen('PROFILE')} />
        </nav>

        <div className="pt-6 border-t border-[#2A3352]">
          <button onClick={onLogout} className="w-full py-4 border border-[#FF4D4D]/20 text-[#FF4D4D] rounded-2xl text-[9px] font-bold tracking-[0.4em] uppercase hover:bg-[#FF4D4D]/5 transition-all">Revoke Session</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
        
        {activeScreen === 'HOME' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.4em] text-[#4DA6FF] font-bold uppercase">Strategic Center</p>
              <h1 className="text-4xl font-serif font-bold text-white uppercase italic">Capital & <span className="text-[#4DA6FF]">Growth</span></h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <StrategicCard icon={<QrCode size={32}/>} label="Your QR" desc={`Merchant ID: ${session.shopkeeperId}`} onClick={() => setActiveScreen('QR')} />
              <StrategicCard icon={<TrendingUp size={32}/>} label="Credit Score" desc={`Trust Index: ${currentCreditScore}`} color="text-[#3DDC97]" onClick={() => setActiveScreen('CREDIT')} />
              <StrategicCard icon={<Wallet size={32}/>} label="Apply for Loan" desc="Loan Opportunity Available" onClick={() => setActiveScreen('LOAN')} />
              <StrategicCard icon={<Briefcase size={32}/>} label="More Tools" desc="Ledger & Insights" onClick={() => setActiveScreen('TOOLS')} />
            </div>

            <div className="flex justify-center pt-8">
               <button onClick={() => setScanning(true)} className="w-24 h-24 bg-[#4DA6FF] text-[#0B0F1A] rounded-full flex flex-col items-center justify-center gap-1 shadow-[0_0_40px_rgba(77,166,255,0.4)] hover:scale-105 transition-all group active:scale-95">
                  <Scan size={32} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Scan to Log</span>
               </button>
            </div>
          </div>
        )}

        {/* CREDIT / TRUST ENGINE SCREEN */}
        {activeScreen === 'CREDIT' && (
           <SubScreen title="Trust Engine" onClose={() => setActiveScreen('HOME')}>
              <div className="space-y-12 py-10">
                 <div className="flex flex-col items-center space-y-8">
                    <div className="relative w-[320px] h-[160px] flex items-center justify-center overflow-visible">
                       <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-[0_0_15px_rgba(77,166,255,0.2)]">
                          <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#FF4D4D" />
                              <stop offset="30%" stopColor="#FFB800" />
                              <stop offset="70%" stopColor="#3DDC97" />
                              <stop offset="100%" stopColor="#4DA6FF" />
                            </linearGradient>
                          </defs>
                          <path d="M10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#1C2438" strokeWidth="8" strokeLinecap="round" />
                          <path d="M10 45 A 40 40 0 0 1 90 45" fill="none" stroke="url(#gaugeGradient)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
                       </svg>
                       <div className="absolute bottom-[5px] left-1/2 -ml-[2px] w-[4px] h-[110px] bg-white origin-bottom transition-transform duration-[1500ms] ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20 rounded-full" style={{ transform: `translateX(-50%) rotate(${ (currentCreditScore / 900) * 180 - 90 }deg)` }}></div>
                       <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-6 h-6 bg-[#0B0F1A] border-4 border-white rounded-full z-30"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-7xl font-serif font-bold italic text-white tracking-tighter">{currentCreditScore}</h3>
                      <p className="text-[12px] text-[#3DDC97] uppercase tracking-[0.4em] font-black">Elite Growth Potential</p>
                    </div>
                 </div>

                 {/* AI CONCIERGE RECOMMENDATION CARD */}
                 <div className="p-8 bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-[#4DA6FF]/10 rounded-xl text-[#4DA6FF]"><Sparkles size={20} /></div>
                         <p className="text-[10px] tracking-[0.3em] uppercase text-[#4DA6FF] font-bold">Concierge Strategy</p>
                      </div>
                      {loadingAi && <Loader2 className="animate-spin text-[#4DA6FF]" size={16} />}
                    </div>

                    {loadingAi ? (
                       <div className="space-y-3">
                          <div className="h-4 w-full bg-white/5 animate-pulse rounded"></div>
                          <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded"></div>
                       </div>
                    ) : (
                       <div className="space-y-4 animate-in fade-in duration-700">
                          <p className="text-sm text-white/90 leading-relaxed italic font-serif font-medium">
                            "{aiRecommendation}"
                          </p>
                          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                             <div className="space-y-1">
                                <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Recommended Action</p>
                                <p className="text-xs text-[#3DDC97] font-bold">Optimize for Tier-1 Credit</p>
                             </div>
                             <button onClick={() => setActiveScreen('LOAN')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><ChevronRight size={18} /></button>
                          </div>
                       </div>
                    )}
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4DA6FF]/5 blur-3xl rounded-full"></div>
                 </div>
              </div>
           </SubScreen>
        )}

        {/* ... (Existing screens like PAY LOAN, TRANSACTIONS, QR, etc. remain unchanged) ... */}
        {activeScreen === 'MY_LOANS' && (
          <SubScreen title="Pay Loan" onClose={() => setActiveScreen('HOME')}>
            <div className="space-y-6 py-4">
              <div className="p-6 bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-3xl space-y-4">
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] text-[#AAB0C5] uppercase tracking-widest font-bold">Total Liability Due</p>
                    <Landmark size={18} className="text-[#4DA6FF]" />
                 </div>
                 <h3 className="text-4xl font-mono text-white tracking-tighter">₹{MOCK_INSTALLMENTS.reduce((a, b) => a + (paidInstallments.includes(b.id) ? 0 : b.total), 0).toLocaleString()}</h3>
              </div>

              <p className="text-[10px] text-[#6B7280] tracking-[0.3em] uppercase font-bold mt-8">Monthly Installments</p>
              
              <div className="space-y-4">
                {MOCK_INSTALLMENTS.map((inst) => {
                  const isPaid = paidInstallments.includes(inst.id);
                  const isProcessing = isProcessingPayment === inst.id;
                  
                  return (
                    <div key={inst.id} className={`p-6 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-4 relative overflow-hidden transition-all duration-500 ${isPaid ? 'opacity-60 grayscale' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-[#0B0F1A] rounded-xl flex items-center justify-center text-[#4DA6FF]"><CreditCard size={20}/></div>
                           <div>
                              <h4 className="text-sm font-bold text-white uppercase">{inst.bank}</h4>
                              <p className="text-[9px] text-[#AAB0C5] uppercase font-bold tracking-widest">{inst.month}</p>
                           </div>
                        </div>
                        <span className={`px-3 py-1 text-[8px] font-bold rounded-full uppercase tracking-widest ${isPaid ? 'bg-[#3DDC97]/10 text-[#3DDC97]' : 'bg-[#FFB800]/10 text-[#FFB800]'}`}>
                          {isPaid ? 'Settled' : 'Due Now'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2A3352]">
                         <div>
                            <p className="text-[8px] text-[#6B7280] uppercase font-bold">Principal</p>
                            <p className="text-sm font-mono text-white">₹{inst.principal.toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] text-[#6B7280] uppercase font-bold">Interest Amount</p>
                            <p className="text-sm font-mono text-[#3DDC97]">₹{inst.interest.toLocaleString()}</p>
                         </div>
                      </div>

                      <div className="flex justify-between items-end pt-2">
                        <div>
                           <p className="text-[8px] text-[#6B7280] uppercase font-bold">Total to Pay</p>
                           <p className="text-xl font-serif font-bold italic text-white">₹{inst.total.toLocaleString()}</p>
                        </div>
                        <button 
                          disabled={isPaid || isProcessing}
                          onClick={() => handlePayInstallment(inst.id)}
                          className={`flex items-center gap-2 px-8 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all shadow-xl active:scale-95 ${
                            isPaid 
                              ? 'bg-[#2A3352] text-[#6B7280] cursor-not-allowed' 
                              : 'bg-[#3DDC97] text-[#0B0F1A] hover:bg-white'
                          }`}
                        >
                          {isProcessing ? (
                            <><Loader2 className="animate-spin" size={12}/> PhonePe...</>
                          ) : isPaid ? (
                            <><Check size={12}/> Paid</>
                          ) : (
                            <><IndianRupee size={12}/> Pay Now</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SubScreen>
        )}

        {/* TOOLKIT HUB */}
        {activeScreen === 'TOOLS' && (
          <SubScreen title="Business Toolkit" onClose={() => setActiveScreen('HOME')}>
            <div className="grid grid-cols-2 gap-4 pb-6">
              <ToolTile icon={<BarChart3 size={24}/>} label="Monthly Income" onClick={() => setActiveScreen('INCOME')} color="text-[#3DDC97]" />
              <ToolTile icon={<Landmark size={24}/>} label="Gov Schemes" onClick={() => setActiveScreen('GOV_SCHEMES')} color="text-[#4DA6FF]" />
              <ToolTile icon={<Globe size={24}/>} label="Your Franchises" onClick={() => setActiveScreen('FRANCHISES')} color="text-[#FFB800]" />
              <ToolTile icon={<Coins size={24}/>} label="Monetize" onClick={() => setActiveScreen('MONETIZE')} color="text-white" />
              <ToolTile icon={<Megaphone size={24}/>} label="Connect Creators" onClick={() => setActiveScreen('CREATORS')} color="text-[#FF4D4D]" />
              <ToolTile icon={<History size={24}/>} label="Loan Status" onClick={() => setActiveScreen('MY_LOANS')} color="text-[#AAB0C5]" />
            </div>
            <div className="p-8 bg-[#1C2438]/40 border border-[#2A3352] rounded-3xl">
              <div className="flex items-center gap-2 text-[#4DA6FF] font-bold uppercase tracking-widest text-[9px] mb-2"><Zap size={14}/> Pro Tip</div>
              <p className="text-xs text-[#AAB0C5] leading-relaxed italic">Scaling your business requires consistent financial logging. Bharosa members with daily entries get 2x better loan offers.</p>
            </div>
          </SubScreen>
        )}

        {activeScreen === 'QR' && (
           <SubScreen title="Merchant Identity" onClose={() => setActiveScreen('HOME')}>
             <div className="flex flex-col items-center space-y-12 py-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative">
                   <div className="w-56 h-56 border-8 border-[#0B0F1A] flex items-center justify-center font-serif text-5xl font-bold italic text-[#0B0F1A]">B</div>
                   <div className="absolute -top-4 -right-4 bg-[#4DA6FF] p-4 rounded-2xl shadow-xl text-[#0B0F1A]"><Share2 size={24}/></div>
                </div>
                <div className="text-center space-y-3">
                   <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">Public Verification ID</p>
                   <p className="text-3xl font-mono text-white tracking-[0.3em]">{session.shopkeeperId}</p>
                </div>
                <button className="w-full py-5 bg-white text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-2xl">
                  <Download size={18}/> Download Identity Kit
                </button>
             </div>
           </SubScreen>
        )}

        {activeScreen === 'LOAN' && (
           <SubScreen title="Capital Access" onClose={() => setActiveScreen('HOME')}>
              <div className="space-y-6 py-4">
                 <p className="text-xl font-serif font-bold text-white italic">Available Liquidity</p>
                 <div className="space-y-4">
                    {eligibleLoans.map(loan => (
                      <div key={loan.id} className={`p-6 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-6 ${loan.isEligible ? 'opacity-100 shadow-xl' : 'opacity-40 grayscale cursor-not-allowed'}`}>
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 ${loan.logoColor} rounded-xl flex items-center justify-center text-[#0B0F1A]`}><Landmark size={24}/></div>
                               <div><h4 className="font-bold text-white text-sm uppercase tracking-tight">{loan.bankName}</h4><p className="text-[9px] text-[#AAB0C5] uppercase font-bold tracking-widest">{loan.isEligible ? 'Verified Eligible' : 'Credit Score Insufficient'}</p></div>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Interest</p>
                              <p className="text-xl font-serif font-bold italic text-[#3DDC97]">{loan.adjustedInterest}%</p>
                            </div>
                         </div>
                         <div className="flex justify-between items-end pt-4 border-t border-[#2A3352]">
                            <div><p className="text-[8px] text-[#6B7280] uppercase font-bold mb-1">Max Limit</p><p className="text-xl font-mono text-white">₹{loan.maxAmount.toLocaleString()}</p></div>
                            <button disabled={!loan.isEligible} onClick={() => handleApplyLoan(loan)} className="px-8 py-3 bg-[#4DA6FF] text-[#0B0F1A] rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-all shadow-lg active:scale-95">Apply</button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </SubScreen>
        )}

        {activeScreen === 'PROFILE' && (
           <SubScreen title="Merchant Profile" onClose={() => setActiveScreen('HOME')}>
              <div className="space-y-8 py-6 max-w-lg mx-auto">
                 <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#4DA6FF] to-[#1C2438] rounded-3xl flex items-center justify-center text-white text-4xl font-serif font-bold shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 amex-pattern opacity-10"></div>
                       {session.ownerName[0]}
                    </div>
                    <p className="text-[10px] tracking-[0.4em] text-[#4DA6FF] font-bold uppercase">Master Merchant Portfolio</p>
                 </div>
                 <div className="space-y-4">
                    <ProfileItem icon={<User size={18}/>} label="Legal Entity" value={session.ownerName} />
                    <ProfileItem icon={<Building2 size={18}/>} label="Shop Trading Name" value={`${session.ownerName.split(' ')[0]}'s Elite Retail`} />
                    <ProfileItem icon={<MapPin size={18}/>} label="Satellite Location" value="Verified • Digital Plaza, Sector 42" />
                    <ProfileItem icon={<Hash size={18}/>} label="Network Identifier" value={session.shopkeeperId || ''} />
                 </div>
              </div>
           </SubScreen>
        )}
      </main>

      {/* SCANNER OVERLAY */}
      {scanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <div className="relative w-full aspect-square max-sm border-2 border-[#4DA6FF] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(77,166,255,0.3)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#4DA6FF] animate-[scan_3s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center"><Scan size={64} className="text-[#4DA6FF] opacity-10" /></div>
          </div>
          <button onClick={() => setScanning(false)} className="mt-10 px-12 py-5 bg-white text-[#0B0F1A] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-2xl transition-all">Terminate Scan</button>
          <style>{`@keyframes scan { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }`}</style>
        </div>
      )}

      {/* LOAN MODAL */}
      {selectedBank && (
        <div className="fixed inset-0 z-[110] bg-[#0B0F1A]/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
           <div className="w-full max-w-lg bg-[#141C2F] border border-[#2A3352] rounded-[3rem] p-10 relative shadow-2xl">
              {!showSuccess ? (
                <>
                  <button onClick={() => setSelectedBank(null)} className="absolute top-10 right-10 text-[#6B7280] hover:text-white"><X size={24} /></button>
                  <div className="mb-10 space-y-1">
                    <h3 className="text-2xl font-serif font-bold text-white uppercase italic">{selectedBank.bankName}</h3>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#4DA6FF] font-bold">Capital Provision Application</p>
                  </div>
                  <form onSubmit={submitLoanApplication} className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                       <ReadOnlyField label="Merchant" value={session.ownerName} />
                       <ReadOnlyField label="Trust Grade" value={currentCreditScore.toString()} />
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[9px] text-[#6B7280] uppercase font-bold ml-1">Capital Required (₹)</p>
                          <input type="number" defaultValue={selectedBank.maxAmount} className="w-full bg-[#0B0F1A] border border-[#2A3352] rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-[#4DA6FF] outline-none" required />
                        </div>
                     </div>
                     <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all shadow-xl">{isSubmitting ? 'Authenticating...' : 'Commit Application'}</button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-8 py-10">
                   <div className="w-20 h-20 bg-[#3DDC97]/10 rounded-full flex items-center justify-center mx-auto border border-[#3DDC97]/30"><CheckCircle2 size={40} className="text-[#3DDC97]" /></div>
                   <h3 className="text-2xl font-serif font-bold text-white uppercase italic">Applied</h3>
                   <p className="text-sm text-[#AAB0C5]">Application committed to <span className="text-[#4DA6FF] font-bold">{selectedBank.bankName}</span>.</p>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};

// Sub-components
const StrategicCard = ({ icon, label, desc, onClick, color = "text-[#4DA6FF]" }: any) => (
  <button onClick={onClick} className="aspect-square bg-[#1C2438] border border-[#2A3352] rounded-[3rem] p-8 flex flex-col items-start justify-between text-left group hover:border-[#4DA6FF]/40 hover:bg-[#4DA6FF]/5 transition-all duration-300 shadow-xl overflow-hidden relative">
    <div className={`p-4 bg-[#0B0F1A] rounded-2xl ${color} group-hover:scale-110 group-hover:bg-[#4DA6FF] group-hover:text-[#0B0F1A] transition-all duration-300 relative z-10 shadow-lg`}>{icon}</div>
    <div className="space-y-1 relative z-10">
      <h3 className="font-bold text-white text-xl tracking-tight group-hover:text-[#4DA6FF] transition-colors">{label}</h3>
      <p className="text-[10px] text-[#6B7280] tracking-widest uppercase font-bold group-hover:text-[#AAB0C5] transition-colors">{desc}</p>
    </div>
  </button>
);

const SubScreen = ({ title, children, onClose }: any) => (
  <div className="max-w-xl mx-auto w-full space-y-10 pb-20 animate-in slide-in-from-bottom-10 duration-500 relative">
    <div className="flex justify-between items-center mt-4">
      <button onClick={onClose} className="p-3 bg-[#1C2438] rounded-full text-[#6B7280] hover:text-white transition-all"><X size={20} /></button>
      <h2 className="text-2xl font-serif font-bold text-white uppercase italic">{title.split(' ')[0]} <span className="text-[#4DA6FF]">{title.split(' ')[1] || ''}</span></h2>
      <div className="w-10"></div>
    </div>
    {children}
  </div>
);

const ToolTile = ({ icon, label, onClick, color }: any) => (
  <button onClick={onClick} className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-white transition-all">
    <div className={`${color} group-hover:scale-110 transition-transform`}>{icon}</div>
    <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">{label}</span>
  </button>
);

const MonetizeOption = ({ label, desc }: any) => (
  <div className="p-6 bg-[#1C2438] border border-[#2A3352] rounded-3xl flex justify-between items-center group">
    <div>
      <h4 className="font-bold text-white text-sm uppercase tracking-tight">{label}</h4>
      <p className="text-[10px] text-[#AAB0C5] italic">{desc}</p>
    </div>
    <button className="text-[10px] font-bold uppercase tracking-widest text-[#4DA6FF] group-hover:underline">Enable</button>
  </div>
);

const ProfileItem = ({ icon, label, value }: any) => (
  <div className="p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl flex items-center justify-between group">
    <div className="flex items-center gap-4">
       <div className="text-[#4DA6FF] group-hover:scale-110 transition-transform">{icon}</div>
       <div>
         <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold">{label}</p>
         <p className={`text-sm font-semibold text-white`}>{value}</p>
       </div>
    </div>
    <ChevronRight size={14} className="text-[#2A3352] opacity-40" />
  </div>
);

const ReadOnlyField = ({ label, value }: any) => (
  <div className="p-4 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl text-left">
    <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className="text-xs text-white font-mono">{value}</p>
  </div>
);

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default ShopkeeperHome;
