
import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, QrCode, Download, Wallet, Grid, 
  Scan, X, ShieldCheck, Hash, ChevronRight,
  CheckCircle2, TrendingUp, Landmark, AlertTriangle,
  Briefcase, IndianRupee, History, Building2, MapPin, 
  Clock, Star, ListFilter, Receipt, UserCheck, BellRing,
  ArrowUpRight, Share2, Filter, Send
} from 'lucide-react';
import { ShopkeeperSession, BankOffer, Transaction } from '../types';

interface ShopkeeperHomeProps {
  session: ShopkeeperSession;
  onLogout: () => void;
}

// Initial Mock Data
const INITIAL_TRANSACTIONS: any[] = [
  { id: 'tx-101', customerId: 'CUST-8821', amount: 1250, date: new Date().toISOString(), status: 'PAID' },
  { id: 'tx-102', customerId: 'CUST-4412', amount: 4500, date: new Date().toISOString(), status: 'PENDING' },
  { id: 'tx-103', customerId: 'CUST-0092', amount: 800, date: new Date(Date.now() - 86400000).toISOString(), status: 'PAID' },
  { id: 'tx-104', customerId: 'CUST-1123', amount: 2100, date: new Date(Date.now() - 172800000).toISOString(), status: 'PAID' },
];

const INITIAL_CUSTOMERS = [
  { id: 'CUST-8821', txCount: 12, behavior: 'Good', lastPayment: 'Today' },
  { id: 'CUST-4412', txCount: 5, behavior: 'Poor', lastPayment: '3 days ago' },
  { id: 'CUST-0092', txCount: 28, behavior: 'Premium', lastPayment: 'Yesterday' },
  { id: 'CUST-1123', txCount: 8, behavior: 'Good', lastPayment: '2 days ago' },
];

const MOCK_BANKS: BankOffer[] = [
  { id: 'b1', bankName: 'Standard Trust Bank', maxAmount: 500000, baseInterest: 6.97, minScore: 700, logoColor: 'bg-[#4DA6FF]' },
  { id: 'b2', bankName: 'National Merchant Corp', maxAmount: 200000, baseInterest: 7.47, minScore: 500, logoColor: 'bg-[#3DDC97]' },
  { id: 'b3', bankName: 'FastCredit Finance', maxAmount: 50000, baseInterest: 8.47, minScore: 300, logoColor: 'bg-[#FFB800]' },
  { id: 'b4', bankName: 'Sovereign Capital', maxAmount: 1000000, baseInterest: 5.47, minScore: 800, logoColor: 'bg-white' },
];

const ShopkeeperHome: React.FC<ShopkeeperHomeProps> = ({ session, onLogout }) => {
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'QR' | 'CREDIT' | 'LOAN' | 'TOOLS' | 'PROFILE' | 'TRANSACTIONS' | 'PENDING' | 'CUSTOMERS' | 'MY_LOANS'>('HOME');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [scanning, setScanning] = useState(false);
  const [appliedLoans, setAppliedLoans] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Derived Business Metrics
  const todayTransactions = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.date).toDateString() === today);
  }, [transactions]);

  const todaySum = useMemo(() => todayTransactions.reduce((acc, t) => acc + t.amount, 0), [todayTransactions]);
  const pendingTransactions = useMemo(() => transactions.filter(t => t.status === 'PENDING'), [transactions]);
  const currentCreditScore = 742;

  // Loan Eligibility Calculation
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

  const handleApplyLoan = (bank: any) => {
    setSelectedBank(bank);
  };

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
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col md:flex-row amex-pattern transition-all duration-500 overflow-hidden">
      
      {/* LEFT PANEL: DAILY OPERATIONS CONTROL STRIP */}
      <aside className="w-full md:w-80 border-r border-[#2A3352] bg-[#0B0F1A] flex flex-col p-6 space-y-8 z-50 overflow-y-auto custom-scrollbar">
        {/* SHOPKEEPER CONTEXT */}
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

          {/* TODAY'S SUMMARY WIDGET */}
          <div className="bg-[#1C2438] border border-[#2A3352] rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-[8px] text-[#6B7280] uppercase tracking-[0.2em] font-bold">Today's Summary</p>
              <Clock size={12} className="text-[#4DA6FF]" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-mono text-white">₹{todaySum.toLocaleString()}</p>
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                <span className="text-[#AAB0C5]">Transactions</span>
                <span className="text-[#3DDC97]">{todayTransactions.length} Logged</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#2A3352] flex justify-between items-center">
              <p className="text-[8px] text-[#6B7280] uppercase font-bold">Pending Payments</p>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${pendingTransactions.length > 0 ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' : 'bg-[#3DDC97]/10 text-[#3DDC97]'}`}>
                {pendingTransactions.length} Accounts
              </span>
            </div>
          </div>
        </div>

        {/* OPERATIONS NAVIGATION */}
        <nav className="space-y-2 flex-1">
          <SidebarButton icon={<Receipt size={18}/>} label="Transactions" sub="Full digital khata" active={activeScreen === 'TRANSACTIONS'} onClick={() => setActiveScreen('TRANSACTIONS')} />
          <SidebarButton icon={<BellRing size={18}/>} label="Pending" sub="Collection required" active={activeScreen === 'PENDING'} onClick={() => setActiveScreen('PENDING')} />
          <SidebarButton icon={<UserCheck size={18}/>} label="Customers" sub="Trust behavior index" active={activeScreen === 'CUSTOMERS'} onClick={() => setActiveScreen('CUSTOMERS')} />
          <SidebarButton icon={<History size={18}/>} label="My Loans" sub="Repayments & limits" active={activeScreen === 'MY_LOANS'} onClick={() => setActiveScreen('MY_LOANS')} />
          <SidebarButton icon={<Building2 size={18}/>} label="My Business" sub="Location & verification" active={activeScreen === 'PROFILE'} onClick={() => setActiveScreen('PROFILE')} />
        </nav>

        <div className="pt-6 border-t border-[#2A3352]">
          <button onClick={onLogout} className="w-full py-4 border border-[#FF4D4D]/20 text-[#FF4D4D] rounded-2xl text-[9px] font-bold tracking-[0.4em] uppercase hover:bg-[#FF4D4D]/5 transition-all">Revoke Session</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
        
        {/* HOME SCREEN: STRATEGIC ACTIONS */}
        {activeScreen === 'HOME' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.4em] text-[#4DA6FF] font-bold uppercase">Strategic Center</p>
              <h1 className="text-4xl font-serif font-bold text-white uppercase italic">Capital & <span className="text-[#4DA6FF]">Growth</span></h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <StrategicCard icon={<QrCode size={32}/>} label="Your QR" desc="Identity & Trust Access" onClick={() => setActiveScreen('QR')} />
              <StrategicCard icon={<TrendingUp size={32}/>} label="Credit Score" desc={`Trust Index: ${currentCreditScore}`} color="text-[#3DDC97]" onClick={() => setActiveScreen('CREDIT')} />
              <StrategicCard icon={<Wallet size={32}/>} label="Apply for Loan" desc="Access Expansion Capital" onClick={() => setActiveScreen('LOAN')} />
              <StrategicCard icon={<Briefcase size={32}/>} label="Business Tools" desc="Ledger & Insights" onClick={() => setActiveScreen('TOOLS')} />
            </div>

            <div className="flex justify-center pt-8">
               <button onClick={() => setScanning(true)} className="w-24 h-24 bg-[#4DA6FF] text-[#0B0F1A] rounded-full flex flex-col items-center justify-center gap-1 shadow-[0_0_40px_rgba(77,166,255,0.4)] hover:scale-105 transition-all group active:scale-95">
                  <Scan size={32} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Scan to Log</span>
               </button>
            </div>
          </div>
        )}

        {/* SUB-SCREENS */}
        {activeScreen === 'TRANSACTIONS' && (
          <SubScreen title="Transaction Ledger" onClose={() => setActiveScreen('HOME')}>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-serif italic text-white font-bold">Recent Movements</h3>
                <button className="text-[9px] text-[#4DA6FF] font-bold uppercase flex items-center gap-1"><Filter size={10}/> Filter</button>
              </div>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl flex justify-between items-center group hover:border-[#4DA6FF]/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-[#0B0F1A] rounded-xl text-[#AAB0C5] group-hover:text-[#4DA6FF] transition-all`}><Receipt size={20}/></div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{tx.customerId}</h4>
                        <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-white">₹{tx.amount.toLocaleString()}</p>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${tx.status === 'PAID' ? 'text-[#3DDC97]' : 'text-[#FFB800]'}`}>{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SubScreen>
        )}

        {activeScreen === 'PENDING' && (
          <SubScreen title="Pending Collections" onClose={() => setActiveScreen('HOME')}>
            <div className="space-y-4">
              <div className="p-6 bg-[#FF4D4D]/5 border border-[#FF4D4D]/20 rounded-3xl mb-6">
                <p className="text-xs text-[#AAB0C5] leading-relaxed italic">"Maintain positive cash flow by settling these trust entries. Prompt collection improves your reputation score."</p>
              </div>
              <div className="space-y-3">
                {pendingTransactions.map(tx => (
                  <div key={tx.id} className="p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#0B0F1A] rounded-xl text-[#FF4D4D]"><BellRing size={20}/></div>
                      <div><h4 className="text-sm font-bold text-white uppercase tracking-tight">{tx.customerId}</h4><p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-white">₹{tx.amount.toLocaleString()}</p>
                      <button className="mt-1 flex items-center gap-1 text-[8px] text-[#4DA6FF] font-bold uppercase hover:underline ml-auto"><Send size={10}/> Remind</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SubScreen>
        )}

        {activeScreen === 'CUSTOMERS' && (
          <SubScreen title="Trust Index" onClose={() => setActiveScreen('HOME')}>
            <div className="space-y-4">
              <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mb-4">Network Member Reputations</p>
              <div className="space-y-3">
                {INITIAL_CUSTOMERS.map(cust => (
                  <div key={cust.id} className="p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0B0F1A] rounded-xl flex items-center justify-center font-serif font-bold text-white italic group-hover:bg-[#4DA6FF] group-hover:text-[#0B0F1A] transition-all">{cust.id[0]}</div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{cust.id}</h4>
                        <p className="text-[9px] text-[#6B7280] font-bold uppercase tracking-widest">{cust.txCount} Interactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${cust.behavior === 'Premium' ? 'text-[#4DA6FF]' : cust.behavior === 'Good' ? 'text-[#3DDC97]' : 'text-[#FF4D4D]'}`}>{cust.behavior}</p>
                      <p className="text-[8px] text-[#6B7280] uppercase tracking-widest mt-0.5">Last: {cust.lastPayment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SubScreen>
        )}

        {activeScreen === 'MY_LOANS' && (
          <SubScreen title="Loan Status" onClose={() => setActiveScreen('HOME')}>
            <div className="space-y-6">
              {appliedLoans.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-[#1C2438] rounded-full flex items-center justify-center mx-auto text-[#6B7280]"><Landmark size={32}/></div>
                  <p className="text-sm text-[#AAB0C5] italic">No active loan applications in your portfolio.</p>
                  <button onClick={() => setActiveScreen('LOAN')} className="text-[10px] text-[#4DA6FF] font-bold uppercase tracking-widest hover:underline">View Offers</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appliedLoans.map((loan, i) => (
                    <div key={i} className="p-6 bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-[2rem] space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${loan.logoColor} rounded-xl flex items-center justify-center text-[#0B0F1A]`}><Landmark size={20}/></div>
                          <div><h4 className="font-bold text-white uppercase text-sm">{loan.bankName}</h4><p className="text-[9px] text-[#6B7280] font-bold tracking-widest uppercase">{loan.date}</p></div>
                        </div>
                        <span className="px-3 py-1 bg-[#FFB800]/10 text-[#FFB800] text-[9px] font-bold rounded-full uppercase tracking-widest">{loan.status}</span>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-[#2A3352]">
                        <div><p className="text-[8px] text-[#6B7280] uppercase font-bold">Approved Amount</p><p className="text-xl font-mono text-white">₹{loan.maxAmount.toLocaleString()}</p></div>
                        <p className="text-[10px] font-serif italic text-[#3DDC97]">{loan.adjustedInterest}% p.a.</p>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Landmark size={80}/></div>
                    </div>
                  ))}
                </div>
              )}
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

        {activeScreen === 'CREDIT' && (
           <SubScreen title="Trust Engine" onClose={() => setActiveScreen('HOME')}>
              <div className="space-y-12 py-10">
                 <div className="flex flex-col items-center space-y-6">
                    <div className="relative w-72 h-36 overflow-hidden">
                       <svg viewBox="0 0 100 50" className="w-full"><path d="M10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#1C2438" strokeWidth="8" strokeLinecap="round" /></svg>
                       <div className="absolute bottom-0 left-1/2 -ml-0.5 w-1 h-32 bg-white origin-bottom transition-transform duration-1000" style={{ transform: 'rotate(55deg)' }}></div>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-6xl font-serif font-bold italic text-white">{currentCreditScore}</h3>
                      <p className="text-[10px] text-[#3DDC97] uppercase tracking-widest font-bold">Elite Growth Potential</p>
                    </div>
                 </div>
                 <div className="p-6 bg-[#1C2438] border border-[#2A3352] rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[#4DA6FF] font-bold uppercase tracking-widest text-[10px]"><TrendingUp size={16}/> Positive Trajectory</div>
                    <p className="text-xs text-[#AAB0C5] leading-relaxed italic">"Your reputation score has increased by 12 points since the last settlement cycle. Merchant network trust is high."</p>
                 </div>
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

        {activeScreen === 'TOOLS' && (
           <SubScreen title="Business Toolkit" onClose={() => setActiveScreen('HOME')}>
              <div className="space-y-8 py-6">
                 <div className="grid grid-cols-2 gap-4">
                    <button className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-3xl space-y-4 text-left group hover:border-[#4DA6FF]/40 transition-all">
                       <div className="w-12 h-12 bg-[#0B0F1A] rounded-xl flex items-center justify-center text-[#4DA6FF] group-hover:bg-[#4DA6FF] group-hover:text-[#0B0F1A] transition-all"><History size={24}/></div>
                       <p className="text-xs font-bold text-white uppercase tracking-tight">Export Ledger</p>
                    </button>
                    <button className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-3xl space-y-4 text-left group hover:border-[#4DA6FF]/40 transition-all">
                       <div className="w-12 h-12 bg-[#0B0F1A] rounded-xl flex items-center justify-center text-[#3DDC97] group-hover:bg-[#3DDC97] group-hover:text-[#0B0F1A] transition-all"><TrendingUp size={24}/></div>
                       <p className="text-xs font-bold text-white uppercase tracking-tight">Growth Map</p>
                    </button>
                 </div>
                 <div className="p-8 bg-[#1C2438]/40 border border-[#2A3352] rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-[#4DA6FF] font-bold uppercase tracking-widest text-[9px]"><ShieldCheck size={14}/> Encrypted Reporting</div>
                    <p className="text-xs text-[#AAB0C5] leading-relaxed">Secure, localized data management for your business operations. No external cloud dependency for daily ledger sync.</p>
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
                 <div className="p-6 bg-[#1C2438]/40 border border-[#2A3352] rounded-3xl space-y-4">
                    <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold italic">Identity Privacy</p>
                    <p className="text-[10px] text-[#AAB0C5] leading-relaxed italic">"Your sovereign credentials (Aadhaar/PAN) are cryptographically hashed and never exposed in the merchant network."</p>
                 </div>
              </div>
           </SubScreen>
        )}
      </main>

      {/* SCANNER OVERLAY */}
      {scanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <div className="relative w-full aspect-square max-w-sm border-2 border-[#4DA6FF] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(77,166,255,0.3)] animate-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#4DA6FF] animate-[scan_3s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center"><Scan size={64} className="text-[#4DA6FF] opacity-10" /></div>
          </div>
          <p className="mt-12 text-[10px] tracking-[0.4em] text-[#4DA6FF] font-bold uppercase animate-pulse">Initializing Global Scanner...</p>
          <button onClick={() => setScanning(false)} className="mt-10 px-12 py-5 bg-white text-[#0B0F1A] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all">Terminate Scan</button>
          <style>{`@keyframes scan { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }`}</style>
        </div>
      )}

      {/* LOAN MODAL */}
      {selectedBank && (
        <div className="fixed inset-0 z-[110] bg-[#0B0F1A]/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
           <div className="w-full max-w-lg bg-[#141C2F] border border-[#2A3352] rounded-[3rem] p-10 relative animate-in zoom-in-95 shadow-2xl">
              {!showSuccess ? (
                <>
                  <button onClick={() => setSelectedBank(null)} className="absolute top-10 right-10 text-[#6B7280] hover:text-white transition-colors"><X size={24} /></button>
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
                          <input 
                            type="number" 
                            defaultValue={selectedBank.maxAmount} 
                            className="w-full bg-[#0B0F1A] border border-[#2A3352] rounded-2xl p-5 text-sm text-white focus:border-[#4DA6FF] outline-none" 
                            required
                          />
                        </div>
                        <div className="p-5 bg-[#1C2438] rounded-2xl flex items-start gap-4">
                          <input type="checkbox" className="mt-1 w-5 h-5 accent-[#4DA6FF]" defaultChecked required />
                          <p className="text-[9px] text-[#AAB0C5] uppercase font-bold tracking-tight leading-relaxed italic">I authorize {selectedBank.bankName} to access my digital khata for financial indexing.</p>
                        </div>
                     </div>
                     <button 
                       type="submit" 
                       disabled={isSubmitting}
                       className="w-full py-5 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all shadow-xl active:scale-95"
                     >
                       {isSubmitting ? 'Authenticating...' : 'Commit Application'}
                     </button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-8 py-10 animate-in fade-in zoom-in-95">
                   <div className="w-20 h-20 bg-[#3DDC97]/10 rounded-full flex items-center justify-center mx-auto border border-[#3DDC97]/30"><CheckCircle2 size={40} className="text-[#3DDC97]" /></div>
                   <div className="space-y-2">
                     <h3 className="text-2xl font-serif font-bold text-white uppercase italic">Applied</h3>
                     <p className="text-sm text-[#AAB0C5] leading-relaxed">Application committed to <span className="text-[#4DA6FF] font-bold">{selectedBank.bankName}</span>. Financial concierge is monitoring progress.</p>
                   </div>
                   <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">Status: Digital Review Pending</p>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};

// Internal Sub-components
const StrategicCard = ({ icon, label, desc, onClick, color = "text-[#4DA6FF]" }: any) => (
  <button 
    onClick={onClick} 
    className="aspect-square bg-[#1C2438] border border-[#2A3352] rounded-[3rem] p-8 flex flex-col items-start justify-between text-left group hover:border-[#4DA6FF]/40 hover:bg-[#4DA6FF]/5 transition-all duration-300 shadow-xl overflow-hidden relative"
  >
    <div className={`p-4 bg-[#0B0F1A] rounded-2xl ${color} group-hover:scale-110 group-hover:bg-[#4DA6FF] group-hover:text-[#0B0F1A] transition-all duration-300 relative z-10 shadow-lg`}>{icon}</div>
    <div className="space-y-1 relative z-10">
      <h3 className="font-bold text-white text-xl tracking-tight group-hover:text-[#4DA6FF] transition-colors">{label}</h3>
      <p className="text-[10px] text-[#6B7280] tracking-widest uppercase font-bold group-hover:text-[#AAB0C5] transition-colors">{desc}</p>
    </div>
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#4DA6FF]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </button>
);

const SubScreen = ({ title, children, onClose }: any) => (
  <div className="max-w-xl mx-auto w-full space-y-10 pb-20 animate-in slide-in-from-bottom-10 duration-500 relative">
    <div className="flex justify-between items-center mt-4">
      <button onClick={onClose} className="p-3 bg-[#1C2438] rounded-full text-[#6B7280] hover:text-white hover:bg-[#2A3352] transition-all"><X size={20} /></button>
      <h2 className="text-2xl font-serif font-bold text-white uppercase italic">{title.split(' ')[0]} <span className="text-[#4DA6FF]">{title.split(' ')[1] || ''}</span></h2>
      <div className="w-10"></div>
    </div>
    {children}
  </div>
);

const ProfileItem = ({ icon, label, value }: any) => (
  <div className="p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl flex items-center justify-between group hover:border-[#4DA6FF]/30 transition-all">
    <div className="flex items-center gap-4 text-left">
       <div className="text-[#4DA6FF] group-hover:scale-110 transition-transform">{icon}</div>
       <div>
         <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold">{label}</p>
         <p className={`text-sm font-semibold tracking-wide mt-0.5 text-white`}>{value}</p>
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

export default ShopkeeperHome;
