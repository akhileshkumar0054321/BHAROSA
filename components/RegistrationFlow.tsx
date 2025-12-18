
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Phone, User, Fingerprint, Camera, MapPin, 
  ChevronRight, CheckCircle2, Loader2, X, Calendar, 
  ChevronLeft, AlertCircle, Download, QrCode, Lock
} from 'lucide-react';
import { RegistrationData } from '../types';

interface RegistrationFlowProps {
  onComplete: (data: RegistrationData) => void;
  onCancel: () => void;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onComplete, onCancel }) => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [verified, setVerified] = useState<{ [key: string]: boolean }>({});
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  const minDob = "1985-01-01";

  const [ownerName, setOwnerName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  const [panName, setPanName] = useState('');
  const [dob, setDob] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [income, setIncome] = useState('');
  const [locationSaved, setLocationSaved] = useState(false);
  const [faceStep, setFaceStep] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [reviewAadhaar, setReviewAadhaar] = useState('');
  const [reviewPan, setReviewPan] = useState('');
  const [needsReverification, setNeedsReverification] = useState(false);

  const [shopkeeperId, setShopkeeperId] = useState('');
  const [alphaId, setAlphaId] = useState('');

  const simulateOtp = (type: 'aadhaar' | 'phone' | 'reverify') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      if (type === 'aadhaar') {
        setAadhaarOtp(code);
        setTimeout(() => {
          setVerified(prev => ({ ...prev, aadhaar: true }));
          setLoading(prev => ({ ...prev, aadhaar: false }));
        }, 1200);
      } else if (type === 'phone') {
        setPhoneOtp(code);
        setTimeout(() => {
          setVerified(prev => ({ ...prev, phone: true }));
          setLoading(prev => ({ ...prev, phone: false }));
        }, 1200);
      } else if (type === 'reverify') {
        setAadhaarOtp(code);
        setTimeout(() => {
          setVerified(prev => ({ ...prev, reverified: true }));
          setNeedsReverification(false);
          setLoading(prev => ({ ...prev, reverify: false }));
        }, 1500);
      }
    }, 1500);
  };

  const simulateFingerprint = () => {
    setLoading(prev => ({ ...prev, finger: true }));
    setTimeout(() => {
      setVerified(prev => ({ ...prev, finger: true }));
      setLoading(prev => ({ ...prev, finger: false }));
    }, 2000);
  };

  const startFaceVerification = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setFaceStep(1);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const captureFace = () => {
    if (faceStep < 3) {
      setFaceStep(prev => prev + 1);
    } else {
      setFaceStep(4);
      setVerified(prev => ({ ...prev, face: true }));
      setCameraActive(false);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const handleSaveLocation = () => {
    setLoading(prev => ({ ...prev, location: true }));
    setTimeout(() => {
      setVerified(prev => ({ ...prev, location: true }));
      setLocationSaved(true);
      setLoading(prev => ({ ...prev, location: false }));
    }, 1200);
  };

  const goToReview = () => {
    setReviewAadhaar(aadhaar);
    setReviewPan(panNumber);
    setPage(3);
  };

  useEffect(() => {
    if (page === 3) {
      if (reviewAadhaar !== aadhaar || reviewPan !== panNumber) {
        setNeedsReverification(true);
        setVerified(prev => ({ ...prev, reverified: false }));
      } else {
        setNeedsReverification(false);
      }
    }
  }, [reviewAadhaar, reviewPan, page]);

  const generateFinalQR = () => {
    const sId = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const aId = Math.random().toString(36).substring(2, 14).toUpperCase();
    setShopkeeperId(sId);
    setAlphaId(aId);
    setPage(4);
  };

  const handleFinalize = () => {
    const data: RegistrationData = {
      ownerName,
      aadhaar,
      phone,
      panName,
      dob,
      panNumber,
      income,
      fingerprintVerified: true,
      faceVerified: true,
      shopkeeperId,
      alphanumericId: alphaId
    };
    onComplete(data);
  };

  const maskValue = (val: string, type: 'aadhaar' | 'pan') => {
    if (type === 'aadhaar') return `XXXX XXXX ${val.slice(-4)}`;
    return 'XXXXXXXXXX';
  };

  const isPage1Valid = !!(ownerName.trim() && aadhaar.length === 12 && phone.length === 10 && verified.aadhaar && verified.phone);
  const isPage2Valid = panName.trim().length > 0 && dob !== "" && panNumber.trim().length >= 5 && verified.finger === true && verified.face === true && verified.location === true && income !== "";

  return (
    <div className="fixed inset-0 z-[60] bg-[#0B0F1A] flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-xl bg-[#141C2F] border border-[#2A3352] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
        {page < 4 && (
          <button onClick={onCancel} className="absolute top-8 right-8 text-[#6B7280] hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
        {page > 1 && page < 4 && (
          <button onClick={() => setPage(page - 1)} className="absolute top-8 left-8 text-[#6B7280] hover:text-white transition-colors flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${page >= s ? 'bg-[#4DA6FF]' : 'bg-[#2A3352]'}`}></div>
          ))}
        </div>

        {page === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif text-white uppercase tracking-tight">Register Your <span className="text-[#4DA6FF]">Business</span></h2>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#AAB0C5] font-bold">Secure OTP Verification</p>
            </div>
            <div className="space-y-6">
              <InputGroup label="Owner Name" placeholder="Full Legal Name" value={ownerName} onChange={setOwnerName} icon={<User size={18}/>} />
              <div className="space-y-4">
                <InputGroup label="Aadhaar Number" placeholder="12 Digit Aadhaar" value={aadhaar} onChange={(val: string) => setAadhaar(val.replace(/\D/g, '').slice(0, 12))} icon={<ShieldCheck size={18}/>} maxLength={12} />
                {!verified.aadhaar ? (
                  <button disabled={aadhaar.length !== 12 || loading.aadhaar} onClick={() => simulateOtp('aadhaar')} className="w-full py-4 bg-[#3DDC97] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                    {loading.aadhaar ? <Loader2 className="animate-spin" size={16} /> : 'Get Aadhaar OTP'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97]">
                    <CheckCircle2 size={18} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">✔ Aadhaar Verified</span>
                    <span className="ml-auto font-mono text-sm tracking-widest opacity-60">{aadhaarOtp}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <InputGroup label="Phone Number" placeholder="10 Digit Mobile" value={phone} onChange={(val: string) => setPhone(val.replace(/\D/g, '').slice(0, 10))} icon={<Phone size={18}/>} maxLength={10} />
                {!verified.phone ? (
                  <button disabled={phone.length !== 10 || loading.phone} onClick={() => simulateOtp('phone')} className="w-full py-4 bg-[#3DDC97] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                    {loading.phone ? <Loader2 className="animate-spin" size={16} /> : 'Get Phone OTP'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97]">
                    <CheckCircle2 size={18} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">✔ Phone Verified</span>
                    <span className="ml-auto font-mono text-sm tracking-widest opacity-60">{phoneOtp}</span>
                  </div>
                )}
              </div>
            </div>
            <button disabled={!isPage1Valid} onClick={() => setPage(2)} className={`w-full py-5 rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl ${isPage1Valid ? 'bg-[#4DA6FF] text-[#0B0F1A] hover:bg-white' : 'bg-[#2A3352] text-[#6B7280] opacity-50 cursor-not-allowed'}`}>
              NEXT <ChevronRight size={16} className={`${isPage1Valid ? 'group-hover:translate-x-1' : ''} transition-transform`} />
            </button>
          </div>
        )}

        {page === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif text-white uppercase tracking-tight">Enter Your <span className="text-[#4DA6FF]">Details</span></h2>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#AAB0C5] font-bold">Identity & Verification</p>
            </div>
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              <InputGroup label="Name (As per PAN)" placeholder="Full Name on Card" value={panName} onChange={setPanName} icon={<User size={18}/>} />
              <InputGroup label="Date of Birth" type="date" value={dob} onChange={setDob} icon={<Calendar size={18}/>} min={minDob} max={todayStr} />
              <InputGroup label="PAN Number" placeholder="ABCDE1234F" value={panNumber} onChange={(val: string) => setPanNumber(val.toUpperCase())} icon={<ShieldCheck size={18}/>} maxLength={10} />
              <div className="space-y-2">
                 <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Biometric Auth</p>
                 {!verified.finger ? (
                   <button onClick={simulateFingerprint} className="w-full flex items-center justify-between p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl hover:border-[#4DA6FF]/40 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0B0F1A] rounded-xl text-[#4DA6FF] group-hover:scale-110 transition-transform"><Fingerprint size={24} /></div>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">Scan Thumb ID</span>
                     </div>
                     {loading.finger && <Loader2 className="animate-spin text-[#4DA6FF]" size={18} />}
                   </button>
                 ) : (
                   <div className="flex items-center gap-3 p-5 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97]"><CheckCircle2 size={18} /><span className="text-[10px] font-bold tracking-widest uppercase">✔ Fingerprint Verified</span></div>
                 )}
              </div>
              {verified.finger && (
                <div className="space-y-2">
                  <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Liveness Check</p>
                  {!verified.face ? (
                    <div className="space-y-4">
                      {!cameraActive ? (
                        <button onClick={startFaceVerification} className="w-full flex items-center justify-between p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl hover:border-[#4DA6FF]/40 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#0B0F1A] rounded-xl text-[#4DA6FF] group-hover:scale-110 transition-transform"><Camera size={24} /></div>
                            <span className="text-xs font-bold text-white tracking-widest uppercase">Face Verification</span>
                          </div>
                        </button>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-[#4DA6FF]/50 bg-black aspect-square max-w-[200px] mx-auto">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-70" />
                          <div className="absolute inset-0 border-2 border-[#4DA6FF] rounded-full scale-90 animate-pulse"></div>
                          <button onClick={captureFace} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-tighter whitespace-nowrap">Capture {faceStep === 1 ? 'Front' : faceStep === 2 ? 'Left' : 'Right'}</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-5 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97]"><CheckCircle2 size={18} /><span className="text-[10px] font-bold tracking-widest uppercase">✔ Face Verified</span></div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Shop Address</p>
                {!locationSaved ? (
                  <div className="space-y-4">
                    <div className="h-28 bg-[#1C2438] rounded-2xl border border-[#2A3352] flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 amex-pattern opacity-10"></div>
                      <MapPin size={24} className="text-[#4DA6FF] animate-bounce" />
                      <div className="absolute bottom-2 text-[7px] text-[#AAB0C5] uppercase tracking-widest font-bold">Detecting Satellite Signal...</div>
                    </div>
                    <button onClick={handleSaveLocation} className="w-full py-3 border border-[#4DA6FF]/30 text-[#4DA6FF] rounded-xl text-[9px] font-bold tracking-[0.2em] uppercase hover:bg-[#4DA6FF]/10 transition-all flex items-center justify-center gap-2">{loading.location ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Current Location'}</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-5 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97]"><CheckCircle2 size={18} /><span className="text-[10px] font-bold tracking-widest uppercase">✔ Location Saved</span></div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Annual Turnover</p>
                <select value={income} onChange={(e) => setIncome(e.target.value)} className="w-full bg-[#1C2438] border border-[#2A3352] rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-[#4DA6FF] appearance-none cursor-pointer">
                  <option value="" disabled>Select Income Bracket</option>
                  <option value="0-2">0 – 2 Lakh</option>
                  <option value="2-6">2 – 6 Lakh</option>
                  <option value="6-8">6 – 8 Lakh</option>
                  <option value="8+">8 Lakh and above</option>
                </select>
              </div>
            </div>
            <button disabled={!isPage2Valid} onClick={goToReview} className={`w-full py-5 rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 flex items-center justify-center gap-2 group shadow-xl ${isPage2Valid ? 'bg-[#4DA6FF] text-[#0B0F1A] hover:bg-white animate-pulse shadow-[0_0_20px_rgba(77,166,255,0.4)]' : 'bg-[#2A3352] text-[#6B7280] opacity-50 cursor-not-allowed'}`}>
              NEXT <ChevronRight size={16} className={`${isPage2Valid ? 'group-hover:translate-x-1' : ''} transition-transform`} />
            </button>
          </div>
        )}

        {page === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif text-white uppercase italic">Final <span className="text-[#4DA6FF]">Review</span></h2>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#AAB0C5] font-bold">Review Before Submission</p>
            </div>
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              <InputGroup label="Name" value={panName} onChange={setPanName} icon={<User size={16}/>} />
              <InputGroup label="Date of Birth" type="date" value={dob} onChange={setDob} icon={<Calendar size={16}/>} min={minDob} max={todayStr} />
              <div className="space-y-2">
                 <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Aadhaar (Masked)</p>
                 <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4DA6FF]"><ShieldCheck size={16} /></div>
                    <input value={reviewAadhaar} onChange={(e) => setReviewAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} className="w-full bg-[#1C2438] border border-[#2A3352] rounded-2xl py-4 pl-12 pr-5 text-sm text-white focus:outline-none focus:border-[#4DA6FF] transition-all" />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">{maskValue(reviewAadhaar, 'aadhaar')}</div>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">PAN Number</p>
                 <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4DA6FF]"><ShieldCheck size={16} /></div>
                    <input value={reviewPan} onChange={(e) => setReviewPan(e.target.value.toUpperCase())} className="w-full bg-[#1C2438] border border-[#2A3352] rounded-2xl py-4 pl-12 pr-5 text-sm text-white focus:outline-none focus:border-[#4DA6FF] transition-all" />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">{maskValue(reviewPan, 'pan')}</div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <p className="text-[8px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Fingerprint</p>
                    <div className="p-4 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl flex items-center justify-between opacity-80"><span className="text-[10px] text-[#3DDC97] font-bold uppercase tracking-widest">✔ Verified</span><Lock size={12} className="text-[#6B7280]" /></div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[8px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Face ID</p>
                    <div className="p-4 bg-[#0B0F1A] border border-[#2A3352] rounded-2xl flex items-center justify-between opacity-80"><span className="text-[10px] text-[#3DDC97] font-bold uppercase tracking-widest">✔ Verified</span><Lock size={12} className="text-[#6B7280]" /></div>
                 </div>
              </div>
              <p className="text-[8px] text-center text-[#6B7280] uppercase tracking-widest font-medium italic mt-2">"Biometric details cannot be changed once registered."</p>
              {needsReverification && (
                <div className="p-4 bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 rounded-2xl flex items-start gap-4 animate-pulse">
                   <AlertCircle className="text-[#FF4D4D] mt-0.5" size={18} />
                   <div className="space-y-1"><p className="text-[10px] font-bold text-[#FF4D4D] uppercase tracking-widest">Mandatory Re-verification</p><p className="text-[9px] text-[#AAB0C5] leading-relaxed">System detected change in ID details. New Aadhaar OTP is required to proceed.</p></div>
                </div>
              )}
            </div>
            {needsReverification && !verified.reverified ? (
               <button onClick={() => simulateOtp('reverify')} disabled={loading.reverify} className="w-full py-5 bg-[#3DDC97] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl">{loading.reverify ? <Loader2 className="animate-spin" size={16} /> : 'Verify New Identity'}</button>
            ) : (
              <button disabled={needsReverification && !verified.reverified} onClick={generateFinalQR} className="w-full py-5 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all shadow-xl flex items-center justify-center gap-3 group">Generate QR <QrCode size={18} className="group-hover:rotate-90 transition-transform" /></button>
            )}
          </div>
        )}

        {page === 4 && (
          <div className="space-y-10 animate-in zoom-in-95 duration-700 text-center py-4">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-[#3DDC97]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3DDC97]/30"><CheckCircle2 size={32} className="text-[#3DDC97]" /></div>
              <h2 className="text-3xl font-serif text-white uppercase italic">Registration <span className="text-[#3DDC97]">Complete</span></h2>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#AAB0C5] font-bold opacity-80">Welcome to the Bharosa Network</p>
            </div>
            <div className="space-y-6">
               <div className="relative inline-block p-8 bg-white rounded-3xl shadow-[0_0_50px_rgba(77,166,255,0.2)]">
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-[#0B0F1A] opacity-80 border-4 border-[#0B0F1A] p-2 relative">
                     <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full opacity-40">
                        {Array.from({length: 16}).map((_, i) => (<div key={i} className={`bg-[#0B0F1A] ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-10'}`}></div>))}
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center"><div className="p-2 bg-white border-2 border-[#0B0F1A] font-serif font-bold italic text-lg leading-none">B</div></div>
                  </div>
                  <div className="absolute -top-3 -right-3 p-3 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl shadow-lg"><QrCode size={20} /></div>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] text-[#6B7280] tracking-[0.4em] uppercase font-bold">Shopkeeper ID</p>
                  <p className="text-2xl font-mono text-white tracking-widest">{shopkeeperId.slice(0,4)} {shopkeeperId.slice(4,8)} {shopkeeperId.slice(8,12)}</p>
                  <p className="text-[8px] text-[#4DA6FF] tracking-[0.2em] uppercase font-bold mt-1">Ref: {alphaId}</p>
               </div>
            </div>
            <div className="space-y-4">
               <button onClick={handleFinalize} className="w-full py-5 bg-white text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3 group"><Download size={18} className="group-hover:translate-y-1 transition-transform" /> Access Merchant Desk</button>
               <p className="text-[9px] text-[#6B7280] uppercase tracking-[0.4em] font-medium">Auto-saved to device gallery</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, onChange, icon, type = "text", maxLength, min, max }: any) => (
  <div className="space-y-2">
    <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">{label}</p>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#4DA6FF] transition-colors">{icon}</div>
      <input type={type} placeholder={placeholder} value={value} maxLength={maxLength} min={min} max={max} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#1C2438] border border-[#2A3352] rounded-2xl py-4 pl-14 pr-5 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#4DA6FF] transition-all custom-date-input" />
    </div>
  </div>
);

export default RegistrationFlow;
