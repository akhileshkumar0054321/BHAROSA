
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  User, QrCode, History, MessageSquare, 
  Search, Scan, Star, CheckCircle2, X, 
  ChevronRight, LogOut, ShieldCheck, MapPin,
  Loader2, Camera, Info, TrendingUp, Sparkles,
  Award, Globe, Edit3, AlertCircle, Play, Image as ImageIcon,
  MessageCircle, HelpCircle
} from 'lucide-react';
import { CustomerSession, Rating, ShopInfo } from '../types';

interface CustomerHomeProps {
  session: CustomerSession;
  onLogout: () => void;
}

const INITIAL_RATINGS: Rating[] = [
  { id: 'r1', shopName: 'Verma Electronics', shopId: 'S-8821', value: 5, comment: 'Excellent trust service and fast verification.', date: '2024-05-20', location: 'Sector 42, Digital Plaza' },
  { id: 'r2', shopName: 'Sharma General Store', shopId: 'S-4412', value: 4, comment: 'Good behavior but credit limit is a bit low.', date: '2024-05-18', location: 'Old Market Road' },
];

const INITIAL_SHOPS: (ShopInfo & { creditScore: number })[] = [
  { 
    id: 'S-8821', 
    name: 'Verma Electronics', 
    location: 'Digital Plaza', 
    avgRating: 4.8, 
    totalRatings: 124, 
    trustLevel: 'GOOD', 
    isVerified: true, 
    creditScore: 742,
    comments: [
      "Authentic products and reliable khata system.",
      "The owner is very professional with settlements.",
      "Fastest verification I've seen in the network.",
      "Highly recommended for premium gadgets."
    ],
    media: [
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&w=400&q=80"
    ]
  },
  { 
    id: 'S-4412', 
    name: 'Sharma General Store', 
    location: 'Old Market Road', 
    avgRating: 3.5, 
    totalRatings: 45, 
    trustLevel: 'AVERAGE', 
    isVerified: true, 
    creditScore: 510,
    comments: [
      "Decent service, but sometimes the khata updates are slow.",
      "Accepts trust lines readily.",
      "Basic inventory but reliable for daily needs."
    ],
    media: [
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=400&q=80"
    ]
  },
  { 
    id: 'S-0092', 
    name: 'Singh Auto Parts', 
    location: 'Highway Cross', 
    avgRating: 2.1, 
    totalRatings: 88, 
    trustLevel: 'POOR', 
    isVerified: false, 
    creditScore: 340,
    comments: [
      "Avoid if possible. Very difficult to settle dues.",
      "Rude behavior towards network customers.",
      "They often deny valid trust lines."
    ],
    media: []
  },
];

const CustomerHome: React.FC<CustomerHomeProps> = ({ session, onLogout }) => {
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'HISTORY' | 'COMMENTS' | 'CHECK_SHOP' | 'SCAN_RATE' | 'PROFILE'>('HOME');
  const [ratings, setRatings] = useState<Rating[]>(INITIAL_RATINGS);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [scanning, setScanning] = useState(false);
  const [foundShop, setFoundShop] = useState<(ShopInfo & { creditScore: number }) | null>(null);
  const [rateValue, setRateValue] = useState(5);
  const [rateComment, setRateComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualId, setManualId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const RATING_POINTS = [-20, -10, 0, 10, 20];
  const ADJUSTMENT_DAMPING = 0.4;

  const calculateScoreAdjustment = (stars: number) => {
    return RATING_POINTS[stars - 1] * ADJUSTMENT_DAMPING;
  };

  const getAiSuggestion = (shop: ShopInfo) => {
    if (shop.avgRating >= 4.0) {
      return {
        message: "You can trust this shop as its rating is good. It consistently demonstrates high reliability and service quality within our network.",
        type: 'TRUST'
      };
    } else if (shop.avgRating >= 3.0) {
      return {
        message: "This merchant has a decent standing. It is suggested that you keep transactions smaller initially or verify settlement timelines with the owner. It is generally safe for routine purchases.",
        type: 'DECENT'
      };
    } else {
      return {
        message: "Based on current network sentiment, you might want to consider alternative merchants for high-value items. It is suggested to clarify all credit terms strictly before proceeding, as some users have reported inconsistencies.",
        type: 'CAUTION'
      };
    }
  };

  const handleScanStart = async () => {
    setActiveScreen('SCAN_RATE');
    setScanning(true);
    setIsEditing(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setTimeout(() => {
        const targetShop = shops[0];
        const existingRating = ratings.find(r => r.shopId === targetShop.id);
        
        if (existingRating) {
          setIsEditing(true);
          setRateValue(existingRating.value);
          setRateComment(existingRating.comment);
        } else {
          setRateValue(5);
          setRateComment('');
        }

        setFoundShop(targetShop);
        setScanning(false);
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }, 2000);
    } catch (err) {
      console.error("Camera failed", err);
      const targetShop = shops[0];
      const existingRating = ratings.find(r => r.shopId === targetShop.id);
      if (existingRating) {
        setIsEditing(true);
        setRateValue(existingRating.value);
        setRateComment(existingRating.comment);
      }
      setFoundShop(targetShop);
      setScanning(false);
    }
  };

  const handleManualSearch = () => {
    const shop = shops.find(s => s.id === manualId || s.name.toLowerCase().includes(manualId.toLowerCase()));
    if (shop) {
      setFoundShop(shop);
    } else {
      alert("Merchant UID not recognized in our global ledger.");
    }
  };

  const handleRatingSubmit = () => {
    if (!foundShop) return;
    setIsSubmitting(true);

    setTimeout(() => {
      let finalAdjustment = 0;
      const newPoints = calculateScoreAdjustment(rateValue);

      if (isEditing) {
        const oldRating = ratings.find(r => r.shopId === foundShop.id);
        const oldPoints = calculateScoreAdjustment(oldRating?.value || 3);
        finalAdjustment = newPoints - oldPoints;
      } else {
        finalAdjustment = newPoints;
      }

      setShops(prevShops => prevShops.map(s => {
        if (s.id === foundShop.id) {
          const newScore = Math.min(900, Math.max(300, s.creditScore + finalAdjustment));
          return { ...s, creditScore: newScore };
        }
        return s;
      }));

      const newRating: Rating = {
        id: isEditing ? (ratings.find(r => r.shopId === foundShop.id)?.id || `r-${Date.now()}`) : `r-${Date.now()}`,
        shopId: foundShop.id,
        shopName: foundShop.name,
        value: rateValue,
        comment: rateComment,
        date: new Date().toISOString().split('T')[0],
        location: foundShop.location
      };

      if (isEditing) {
        setRatings(prev => prev.map(r => r.shopId === foundShop.id ? newRating : r));
      } else {
        setRatings([newRating, ...ratings]);
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFoundShop(null);
        setRateComment('');
        setRateValue(5);
        setActiveScreen('HOME');
      }, 2000);
    }, 1500);
  };

  const closeProfile = () => {
    setActiveScreen('HOME');
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] amex-pattern text-white flex flex-col font-['Inter']">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-[#2A3352] px-6 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#4DA6FF] text-[#0B0F1A] flex items-center justify-center font-serif font-bold italic rounded-sm shadow-[0_0_20px_rgba(77,166,255,0.2)]">B</div>
          <div>
             <h1 className="text-sm font-serif font-bold tracking-[0.2em] uppercase">Bharosa</h1>
             <p className="text-[8px] text-[#AAB0C5] tracking-[0.4em] uppercase font-bold opacity-60">Sovereign Portal</p>
          </div>
        </div>

        <button onClick={() => setActiveScreen('PROFILE')} className="relative group transition-transform active:scale-95">
          <div className="w-10 h-10 bg-[#1C2438] border border-[#2A3352] rounded-full flex items-center justify-center text-[#4DA6FF] group-hover:border-[#4DA6FF]/50 transition-all">
            <User size={18} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3DDC97] border-2 border-[#0B0F1A] rounded-full"></div>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full overflow-y-auto custom-scrollbar">
        
        {activeScreen === 'HOME' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-2">
              <h2 className="text-5xl font-serif font-bold text-white italic">Welcome, <span className="text-[#4DA6FF]">{session.name.split(' ')[0]}</span></h2>
              <p className="text-xs text-[#6B7280] tracking-[0.4em] uppercase font-bold">Manage the trust network</p>
            </div>

            <button 
              onClick={handleScanStart}
              className="w-full p-10 bg-gradient-to-br from-[#4DA6FF] to-[#141C2F] rounded-[3rem] text-left relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(77,166,255,0.2)] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <div className="relative z-10 space-y-6">
                 <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
                   <Scan size={32} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-serif font-bold text-[#0B0F1A] uppercase italic">Scan & Rate</h3>
                    <p className="text-[10px] font-bold text-[#0B0F1A]/70 tracking-[0.2em] uppercase">Evaluate or update merchant trust</p>
                 </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:rotate-12 transition-transform">
                <QrCode size={240} />
              </div>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ActionTile icon={<History size={24}/>} title="Rating History" desc="Your trust footprints" onClick={() => setActiveScreen('HISTORY')} />
              <ActionTile icon={<MessageSquare size={24}/>} title="Your Comments" desc="Your feedback archive" onClick={() => setActiveScreen('COMMENTS')} />
              <ActionTile icon={<Search size={24}/>} title="Check a Shop" desc="Audit before you buy" onClick={() => { setFoundShop(null); setActiveScreen('CHECK_SHOP'); }} />
            </div>

            <div className="p-8 bg-[#1C2438]/40 border border-[#2A3352] rounded-[2.5rem] flex items-center gap-6 group">
               <div className="p-4 bg-[#0B0F1A] rounded-2xl text-[#4DA6FF] group-hover:rotate-12 transition-transform"><TrendingUp size={24}/></div>
               <div>
                  <p className="text-[9px] text-[#4DA6FF] tracking-[0.3em] uppercase font-bold mb-1">Impact Analytics</p>
                  <p className="text-xs text-[#AAB0C5] italic leading-relaxed">"Every audit you contribute helps build a more transparent financial ecosystem for the entire community."</p>
               </div>
            </div>
          </div>
        )}

        {/* SCAN & RATE SCREEN */}
        {activeScreen === 'SCAN_RATE' && (
          <SubScreen title={isEditing ? "Update Rating" : "Verify & Rate"} onClose={() => { setActiveScreen('HOME'); setFoundShop(null); }}>
             <div className="space-y-10 py-6">
                {scanning && !foundShop ? (
                  <div className="flex flex-col items-center space-y-10">
                    <div className="relative w-full aspect-square max-w-[320px] rounded-[3rem] overflow-hidden border-2 border-[#4DA6FF] shadow-2xl">
                       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-60" />
                       <div className="absolute inset-0 amex-pattern opacity-10"></div>
                       <div className="absolute inset-0 border-[40px] border-[#0B0F1A]/80"></div>
                       <div className="absolute top-0 left-0 w-full h-1 bg-[#4DA6FF] animate-[scan_3s_infinite]"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Scan size={48} className="text-[#4DA6FF] opacity-20" />
                       </div>
                    </div>
                    <div className="text-center space-y-4">
                       <p className="text-[10px] text-[#AAB0C5] tracking-[0.4em] uppercase font-bold">Scanning Merchant Identity...</p>
                    </div>
                  </div>
                ) : foundShop ? (
                  <div className="animate-in slide-in-from-bottom-10 duration-700 space-y-10">
                     {isEditing && (
                       <div className="p-4 bg-[#4DA6FF]/10 border border-[#4DA6FF]/30 rounded-2xl flex items-center gap-3 text-[#4DA6FF]">
                          <p className="text-[10px] font-bold uppercase tracking-widest">System detected existing rating. Editing mode active.</p>
                       </div>
                     )}

                     <div className="p-8 bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-[3rem] space-y-6 shadow-2xl">
                        <div className="flex justify-between items-start">
                           <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                 <h3 className="text-2xl font-serif font-bold text-white uppercase italic">{foundShop.name}</h3>
                                 {foundShop.isVerified && <CheckCircle2 size={18} className="text-[#3DDC97]" />}
                              </div>
                              <div className="flex items-center gap-2 text-[#AAB0C5] text-[10px] tracking-widest font-bold uppercase">
                                 <MapPin size={12} /> {foundShop.location}
                              </div>
                           </div>
                           <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-[#4DA6FF] tracking-widest uppercase">
                             UID: {foundShop.id}
                           </div>
                        </div>

                        <div className="flex items-center gap-6 pt-6 border-t border-[#2A3352]">
                           <div className="text-center space-y-1">
                              <p className="text-xl font-serif font-bold text-white italic">{foundShop.avgRating}</p>
                              <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Avg Rating</p>
                           </div>
                           <div className="h-10 w-px bg-[#2A3352]"></div>
                           <div className="text-center space-y-1">
                              <p className="text-xl font-serif font-bold text-white italic">{foundShop.totalRatings}</p>
                              <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Audit Count</p>
                           </div>
                           <div className="ml-auto flex flex-col items-end gap-1">
                              <span className={`px-4 py-1 rounded-full text-[8px] font-bold tracking-[0.2em] uppercase ${foundShop.trustLevel === 'GOOD' ? 'bg-[#3DDC97]/10 text-[#3DDC97]' : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'}`}>
                                Level: {foundShop.trustLevel}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-8 px-2">
                        <div className="space-y-4 text-center">
                           <p className="text-[10px] text-[#6B7280] tracking-[0.4em] uppercase font-bold">Assign Merit Value</p>
                           <div className="flex justify-center gap-4">
                              {[1, 2, 3, 4, 5].map(v => (
                                <button 
                                  key={v} 
                                  onClick={() => setRateValue(v)}
                                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${rateValue >= v ? 'bg-[#4DA6FF] text-[#0B0F1A] border-[#4DA6FF] shadow-[0_0_20px_rgba(77,166,255,0.3)]' : 'bg-[#1C2438] text-[#AAB0C5] border-[#2A3352]'}`}
                                >
                                  <Star size={24} fill={rateValue >= v ? "currentColor" : "none"} />
                                </button>
                              ))}
                           </div>
                           <p className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${rateValue < 3 ? 'text-[#FF4D4D]' : rateValue > 3 ? 'text-[#3DDC97]' : 'text-[#6B7280]'}`}>
                             {rateValue === 1 && "Extreme Penalty: -20 Points"}
                             {rateValue === 2 && "Deduction: -10 Points"}
                             {rateValue === 3 && "Neutral Impact: 0 Points"}
                             {rateValue === 4 && "Merit Growth: +10 Points"}
                             {rateValue === 5 && "Maximum Excellence: +20 Points"}
                           </p>
                        </div>

                        <div className="space-y-3">
                           <textarea 
                             placeholder="Provide context for your rating..."
                             value={rateComment}
                             onChange={(e) => setRateComment(e.target.value)}
                             className="w-full bg-[#1C2438] border border-[#2A3352] rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-[#4DA6FF] transition-all min-h-[120px] resize-none"
                           />
                        </div>

                        <button 
                          onClick={handleRatingSubmit}
                          disabled={isSubmitting}
                          className={`w-full py-5 rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl ${isSubmitting ? 'bg-[#2A3352] text-[#6B7280]' : 'bg-[#4DA6FF] text-[#0B0F1A] hover:bg-white'}`}
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : isEditing ? 'Update Merit Audit' : 'Confirm Merit Audit'}
                        </button>
                     </div>
                  </div>
                ) : null}
             </div>
          </SubScreen>
        )}

        {/* CHECK SHOP SCREEN - REFINED */}
        {activeScreen === 'CHECK_SHOP' && (
          <SubScreen title="Merchant Audit" onClose={() => setActiveScreen('HOME')}>
             <div className="space-y-8 py-4">
                <div className="relative group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#4DA6FF]"><Search size={20}/></div>
                   <input 
                     type="text" 
                     placeholder="Search Merchant UID (e.g. S-8821)..."
                     value={manualId}
                     onChange={(e) => setManualId(e.target.value)}
                     className="w-full bg-[#1C2438] border border-[#2A3352] rounded-[2rem] py-5 pl-16 pr-24 text-sm text-white focus:outline-none focus:border-[#4DA6FF] transition-all"
                   />
                   <button 
                     onClick={handleManualSearch}
                     className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#4DA6FF] text-[#0B0F1A] rounded-full text-[9px] font-bold uppercase tracking-widest transition-transform active:scale-95"
                   >
                     Search
                   </button>
                </div>

                {foundShop && (
                  <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                     {/* Refined Shop Profile */}
                     <div className="p-8 bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-[3rem] shadow-2xl space-y-10">
                        <div className="flex justify-between items-start">
                           <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                 <h3 className="text-3xl font-serif font-bold text-white uppercase italic tracking-tight">{foundShop.name}</h3>
                                 {foundShop.isVerified && <Award size={22} className="text-[#FFB800]" />}
                              </div>
                              <p className="text-[10px] text-[#AAB0C5] tracking-[0.2em] uppercase font-bold flex items-center gap-1.5"><MapPin size={12}/> {foundShop.location}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold mb-1">NETWORK ID</p>
                              <p className="text-xs font-mono text-white/80">{foundShop.id}</p>
                           </div>
                        </div>

                        {/* Overall Metrics (Hidden Credit Score) */}
                        <div className="grid grid-cols-2 gap-8 border-y border-[#2A3352] py-8">
                           <div className="space-y-2">
                              <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Overall Sentiment</p>
                              <div className="flex items-baseline gap-2">
                                 <p className="text-4xl font-serif font-bold text-white italic">{foundShop.avgRating}</p>
                                 <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(v => (
                                      <Star key={v} size={14} className={v <= Math.round(foundShop.avgRating) ? "text-[#4DA6FF] fill-[#4DA6FF]" : "text-[#2A3352]"} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Total Feedback</p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-serif font-bold text-white italic">{(foundShop.comments?.length || 0) + (foundShop.totalRatings || 0)}</p>
                                <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Audits</p>
                              </div>
                           </div>
                        </div>

                        {/* Public Comments Section */}
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <p className="text-[10px] text-[#6B7280] tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                                <MessageCircle size={16}/> Peer Comments ({foundShop.comments?.length || 0})
                              </p>
                           </div>
                           <div className="space-y-4">
                              {foundShop.comments && foundShop.comments.length > 0 ? (
                                foundShop.comments.map((comment, idx) => (
                                  <div key={idx} className="p-5 bg-[#0B0F1A]/50 rounded-2xl border border-[#2A3352] relative group/comment hover:border-[#4DA6FF]/30 transition-colors">
                                     <p className="text-xs text-[#AAB0C5] italic leading-relaxed font-medium">"{comment}"</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-[#6B7280] italic text-center py-4 uppercase tracking-widest">No public comments recorded yet.</p>
                              )}
                           </div>
                        </div>

                        {/* Media Visuals */}
                        {foundShop.media && foundShop.media.length > 0 && (
                          <div className="space-y-6">
                             <p className="text-[10px] text-[#6B7280] tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                                <ImageIcon size={16}/> Merchant Evidence
                             </p>
                             <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {foundShop.media.map((url, idx) => (
                                  <div key={idx} className="min-w-[200px] aspect-video rounded-2xl overflow-hidden border border-[#2A3352] relative group/media flex-shrink-0">
                                     <img src={url} alt={`Evidence ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>

                     {/* AI Concierge Purchase Suggestion Section */}
                     <div className="p-10 bg-gradient-to-br from-[#1C2438] to-[#0B0F1A] border border-[#2A3352] rounded-[3rem] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#4DA6FF]/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10 space-y-8">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-[#4DA6FF]/10 rounded-2xl text-[#4DA6FF]"><Sparkles size={24} /></div>
                              <div>
                                 <p className="text-[11px] tracking-[0.4em] uppercase text-[#4DA6FF] font-bold">Bharosa Concierge Advisor</p>
                                 <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold">Purchase Feasibility Report</p>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="p-6 bg-[#0B0F1A]/40 rounded-3xl border border-white/5">
                                <p className="text-base text-white/90 leading-relaxed italic font-serif font-medium">
                                  "{getAiSuggestion(foundShop).message}"
                                </p>
                              </div>
                              
                              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <HelpCircle size={16} className="text-[#6B7280]" />
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">AI Suggestion Only • Not a Directive</p>
                                 </div>
                                 <div className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg ${getAiSuggestion(foundShop).type === 'TRUST' ? 'bg-[#3DDC97]/10 text-[#3DDC97] border border-[#3DDC97]/20' : getAiSuggestion(foundShop).type === 'DECENT' ? 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20' : 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/20'}`}>
                                    {getAiSuggestion(foundShop).type === 'TRUST' ? 'Verified Trustworthy' : getAiSuggestion(foundShop).type === 'DECENT' ? 'Standard Protocol' : 'Enhanced Caution'}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => { setActiveScreen('SCAN_RATE'); setManualId(foundShop.id); }}
                          className="w-full py-6 bg-[#4DA6FF] text-[#0B0F1A] rounded-[2rem] text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-[0.98]"
                        >
                          <Edit3 size={18} className="group-hover:rotate-12 transition-transform" /> Contribute Merit Audit
                        </button>
                        <button 
                          onClick={() => setFoundShop(null)}
                          className="w-full py-5 border border-[#2A3352] text-[#6B7280] rounded-[2rem] text-[10px] font-bold tracking-[0.4em] uppercase hover:text-white hover:border-white transition-all"
                        >
                          Audit Another Merchant
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </SubScreen>
        )}

        {/* HISTORY SCREEN */}
        {activeScreen === 'HISTORY' && (
          <SubScreen title="Rating History" onClose={() => setActiveScreen('HOME')}>
             <div className="space-y-4 py-4">
                {ratings.length === 0 ? (
                  <EmptyState text="No ratings found in your profile." />
                ) : (
                  ratings.map(r => (
                    <div key={r.id} className="p-6 bg-[#1C2438] border border-[#2A3352] rounded-[2rem] space-y-4 hover:border-[#4DA6FF]/40 transition-all group">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">{r.shopName}</h4>
                                <span className="text-[8px] text-[#6B7280] font-mono">UID: {r.shopId}</span>
                             </div>
                             <p className="text-[9px] text-[#AAB0C5] tracking-widest font-bold uppercase">{r.location}</p>
                          </div>
                          <div className="flex gap-1">
                             {[1,2,3,4,5].map(v => (
                               <Star key={v} size={10} className={v <= r.value ? "text-[#4DA6FF] fill-[#4DA6FF]" : "text-[#2A3352]"} />
                             ))}
                          </div>
                       </div>
                       <p className="text-xs text-[#6B7280] italic">"{r.comment || 'No comment provided'}"</p>
                       <div className="pt-4 border-t border-[#2A3352] flex justify-between items-center">
                          <span className="text-[8px] text-[#AAB0C5] tracking-[0.2em] font-bold uppercase">{new Date(r.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <p className="text-[8px] text-[#4DA6FF] tracking-[0.2em] font-bold uppercase flex items-center gap-1">
                               <Edit3 size={10}/> Rescan to Edit
                             </p>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </SubScreen>
        )}

        {/* COMMENTS SCREEN */}
        {activeScreen === 'COMMENTS' && (
          <SubScreen title="Your Comments" onClose={() => setActiveScreen('HOME')}>
            <div className="space-y-4 py-4">
               {ratings.filter(r => r.comment).map(r => (
                 <div key={r.id} className="p-8 bg-[#1C2438]/50 border border-[#2A3352] rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-[#4DA6FF]"><MessageSquare size={80} /></div>
                    <div className="space-y-4 relative z-10">
                       <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-[#4DA6FF] tracking-widest font-bold uppercase">{r.shopName}</p>
                            <p className="text-[7px] text-[#6B7280] font-mono">ID: {r.shopId}</p>
                          </div>
                          <p className="text-[8px] text-[#6B7280] font-bold uppercase">{r.date}</p>
                       </div>
                       <p className="text-sm text-white/90 font-serif italic leading-relaxed">"{r.comment}"</p>
                    </div>
                 </div>
               ))}
               {ratings.filter(r => r.comment).length === 0 && <EmptyState text="No comment logs available." />}
            </div>
          </SubScreen>
        )}

        {/* PROFILE OVERLAY */}
        {activeScreen === 'PROFILE' && (
          <div className="fixed inset-0 z-[100] bg-[#0B0F1A]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="w-full max-w-lg bg-[#141C2F] border border-[#2A3352] rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
                {/* REFINED CLOSE BUTTON: Ensures perfect interactivity and tactile feedback */}
                <button 
                  onClick={closeProfile} 
                  className="absolute top-8 right-8 text-[#AAB0C5] hover:text-white hover:bg-white/10 transition-all hover:rotate-90 active:scale-90 p-3 z-[110] bg-[#0B0F1A]/50 backdrop-blur-md rounded-full border border-[#2A3352] shadow-xl group/close"
                  title="Return to Dashboard"
                  aria-label="Close Profile"
                >
                  <X size={24} className="group-hover/close:scale-110 transition-transform" />
                </button>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#4DA6FF]/5 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                
                <div className="flex flex-col items-center space-y-8 mb-12">
                   <div className="w-24 h-24 bg-gradient-to-br from-[#4DA6FF] to-[#1C2438] rounded-3xl flex items-center justify-center text-4xl font-serif font-bold italic text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 amex-pattern opacity-10"></div>
                      {session.name[0]}
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] text-[#4DA6FF] tracking-[0.4em] uppercase font-bold mb-1 opacity-80">A Verified Customer</p>
                      <h3 className="text-3xl font-serif font-bold text-white uppercase italic tracking-tight">{session.name}</h3>
                      <p className="text-[10px] text-[#AAB0C5] tracking-[0.4em] uppercase font-bold mt-2 opacity-60">Sovereign Network Member</p>
                   </div>
                </div>
                
                <div className="space-y-4 mb-12">
                   <ProfileField label="Identity Reference" value={session.customerId} />
                   <ProfileField label="Primary Phone" value={session.phone} />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl flex items-center justify-between opacity-80">
                         <div>
                            <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold mb-1">Fingerprint</p>
                            <span className="text-[9px] text-[#3DDC97] font-bold uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> Verified</span>
                         </div>
                      </div>
                      <div className="p-5 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl flex items-center justify-between opacity-80">
                         <div>
                            <p className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold mb-1">Face ID</p>
                            <span className="text-[9px] text-[#3DDC97] font-bold uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> Verified</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <button onClick={onLogout} className="w-full py-5 bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/20 rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[#FF4D4D] hover:text-[#0B0F1A] transition-all flex items-center justify-center gap-2 group">
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Revoke Portal Session
                </button>
             </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 z-[120] bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#3DDC97]/10 rounded-full flex items-center justify-center mx-auto border border-[#3DDC97]/30 animate-[bounce_1s_ease-in-out]">
                   <CheckCircle2 size={40} className="text-[#3DDC97]" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-serif font-bold text-white uppercase italic">{isEditing ? 'Audit Updated' : 'Audit Settled'}</h3>
                   <p className="text-[10px] text-[#AAB0C5] tracking-[0.3em] uppercase font-bold">Merchant Trust Vector Adjusted Proportionally</p>
                </div>
             </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes scan { 
          0% { top: 0% } 
          50% { top: 100% } 
          100% { top: 0% } 
        }
      `}</style>
    </div>
  );
};

// Sub-components
const ActionTile = ({ icon, title, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="p-8 bg-[#1C2438] border border-[#2A3352] rounded-[2.5rem] flex flex-col items-start justify-between text-left group hover:border-[#4DA6FF]/40 hover:bg-[#4DA6FF]/5 transition-all duration-300 shadow-xl"
  >
    <div className="p-4 bg-[#0B0F1A] rounded-2xl text-[#4DA6FF] group-hover:scale-110 transition-transform mb-6 shadow-lg">{icon}</div>
    <div className="space-y-1">
      <h3 className="font-bold text-white text-lg tracking-tight uppercase group-hover:text-[#4DA6FF] transition-colors">{title}</h3>
      <p className="text-[10px] text-[#6B7280] tracking-widest uppercase font-bold group-hover:text-[#AAB0C5] transition-colors">{desc}</p>
    </div>
  </button>
);

const SubScreen = ({ title, children, onClose }: any) => (
  <div className="animate-in slide-in-from-bottom-6 duration-500 space-y-8 pb-20">
    <div className="flex items-center justify-between">
       <button onClick={onClose} className="p-3 bg-[#1C2438] border border-[#2A3352] rounded-full text-[#6B7280] hover:text-white transition-all"><X size={20}/></button>
       <h2 className="text-2xl font-serif font-bold text-white uppercase italic">{title.split(' ')[0]} <span className="text-[#4DA6FF]">{title.split(' ')[1] || ''}</span></h2>
       <div className="w-10"></div>
    </div>
    {children}
  </div>
);

const ProfileField = ({ label, value }: any) => (
  <div className="space-y-1.5">
    <p className="text-[8px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">{label}</p>
    <div className="p-5 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl">
       <p className="text-sm font-mono text-white/80">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
     <div className="w-16 h-16 bg-[#1C2438] rounded-full flex items-center justify-center text-[#6B7280] opacity-30"><Globe size={32} /></div>
     <p className="text-[10px] text-[#6B7280] tracking-widest uppercase font-bold">{text}</p>
  </div>
);

export default CustomerHome;
