
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Phone, Fingerprint, Camera, 
  CheckCircle2, Loader2, ChevronRight, X, 
  ShieldCheck, Smartphone, Scan, UserCheck, AlertCircle, Key, MessageSquare, RefreshCw
} from 'lucide-react';
import { CustomerRegistrationData } from '../types';
import { db } from '../database';

interface CustomerRegistrationFlowProps {
  onComplete: (data: CustomerRegistrationData) => void;
  onCancel: () => void;
}

const CustomerRegistrationFlow: React.FC<CustomerRegistrationFlowProps> = ({ onComplete, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [verified, setVerified] = useState<{ [key: string]: boolean }>({});
  
  // Simulated Biometric Hashes
  const [fpHash, setFpHash] = useState<string | undefined>(undefined);
  const [fHash, setFHash] = useState<string | undefined>(undefined);
  
  // Identity Match State
  const [matchFound, setMatchFound] = useState<CustomerRegistrationData | null>(null);
  const [showIdEntry, setShowIdEntry] = useState(false);
  const [enteredId, setEnteredId] = useState('');
  const [idErrorMessage, setIdErrorMessage] = useState('');

  // Forgot ID Flow State
  const [forgotStep, setForgotStep] = useState<'NONE' | 'PHONE' | 'OTP' | 'SHOW_ID'>('NONE');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoverySentOtp, setRecoverySentOtp] = useState('');

  // Face Scan States
  const [cameraActive, setCameraActive] = useState(false);
  const [faceStep, setFaceStep] = useState(0); 
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check for existing identity when biometrics are updated
  useEffect(() => {
    if (verified.finger || verified.face) {
      const match = db.findCustomerByIdentity(fpHash, fHash);
      if (match) {
        setMatchFound(match);
      }
    }
  }, [fpHash, fHash, verified]);

  const handleGetOtp = () => {
    setLoading(prev => ({ ...prev, phone: true }));
    setTimeout(() => {
      setOtp(Math.floor(100000 + Math.random() * 900000).toString());
      setTimeout(() => {
        setVerified(prev => ({ ...prev, phone: true }));
        setLoading(prev => ({ ...prev, phone: false }));
      }, 1000);
    }, 1500);
  };

  const handleScanFingerprint = () => {
    setLoading(prev => ({ ...prev, finger: true }));
    setTimeout(() => {
      const newHash = phone === '9876543210' ? 'fp-8888' : `fp-${Math.random().toString(36).substring(7)}`;
      setFpHash(newHash);
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

  const captureFaceFrame = () => {
    if (faceStep < 3) {
      setFaceStep(prev => prev + 1);
    } else {
      setFaceStep(4);
      const newFaceHash = phone === '9876543210' ? 'face-8888' : `face-${Math.random().toString(36).substring(7)}`;
      setFHash(newFaceHash);
      setVerified(prev => ({ ...prev, face: true }));
      setCameraActive(false);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const isFormValid = name.trim() !== '' && verified.phone && verified.finger && verified.face;

  const handleSubmit = () => {
    const customerId = `BH-CUST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newCustomer = {
      name,
      phone,
      fingerprintVerified: true,
      faceVerified: true,
      customerId,
      fingerprintHash: fpHash,
      faceHash: fHash
    };
    db.addCustomer(newCustomer);
    onComplete(newCustomer);
  };

  const handleIdAccess = () => {
    if (matchFound && enteredId === matchFound.customerId) {
      setIdErrorMessage('');
      onComplete(matchFound);
    } else {
      setIdErrorMessage("This customer ID does not belong to you. Try again.");
    }
  };

  // Forgot ID Flow Handlers
  const triggerRecoveryOtp = () => {
    if (recoveryPhone.length !== 10) return;
    setLoading(prev => ({ ...prev, recovery: true }));
    setTimeout(() => {
      setRecoverySentOtp(Math.floor(100000 + Math.random() * 900000).toString());
      setForgotStep('OTP');
      setLoading(prev => ({ ...prev, recovery: false }));
    }, 1500);
  };

  const verifyRecoveryOtp = () => {
    if (recoveryOtp === recoverySentOtp) {
      setForgotStep('SHOW_ID');
    } else {
      alert("Invalid OTP. Recovery failed.");
    }
  };

  // UI for ID Entry screen
  if (showIdEntry) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0B0F1A] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#141C2F] border border-[#2A3352] rounded-[2.5rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#4DA6FF]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
           
           {forgotStep === 'NONE' && (
             <div className="space-y-8 animate-in fade-in duration-300">
               <div className="w-20 h-20 bg-[#4DA6FF]/10 rounded-full flex items-center justify-center mx-auto text-[#4DA6FF] border border-[#4DA6FF]/20"><Key size={32} /></div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-serif text-white uppercase italic tracking-tight">Identify <span className="text-[#4DA6FF]">Verified</span></h2>
                 <p className="text-[10px] tracking-[0.3em] uppercase text-[#AAB0C5] font-bold">Secure Vault Access</p>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="BH-CUST-XXXXXX" 
                      value={enteredId}
                      onChange={(e) => {
                        setEnteredId(e.target.value.toUpperCase());
                        setIdErrorMessage('');
                      }}
                      className={`w-full bg-[#0B0F1A] border ${idErrorMessage ? 'border-[#FF4D4D]' : 'border-[#2A3352]'} rounded-2xl py-6 px-6 text-center font-mono text-xl text-white focus:outline-none focus:border-[#4DA6FF] transition-all`}
                    />
                    {idErrorMessage && (
                      <p className="text-[10px] text-[#FF4D4D] font-bold uppercase tracking-wider animate-bounce">{idErrorMessage}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleIdAccess}
                    className="w-full py-5 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-white transition-all shadow-xl shadow-[#4DA6FF]/10 active:scale-95"
                  >
                    Unlock Dashboard
                  </button>
                  
                  <div className="pt-4 space-y-4">
                    <button 
                      onClick={() => setForgotStep('PHONE')}
                      className="text-[10px] text-[#4DA6FF] uppercase tracking-widest font-bold hover:underline"
                    >
                      Forgot your customer ID?
                    </button>
                    <br/>
                    <button 
                      onClick={() => setShowIdEntry(false)} 
                      className="text-[9px] text-[#6B7280] uppercase tracking-widest font-bold opacity-60"
                    >
                      Return to Biometrics
                    </button>
                  </div>
               </div>
             </div>
           )}

           {forgotStep === 'PHONE' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="w-20 h-20 bg-[#4DA6FF]/10 rounded-full flex items-center justify-center mx-auto text-[#4DA6FF] border border-[#4DA6FF]/20"><Smartphone size={32} /></div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-serif text-white uppercase italic">ID <span className="text-[#4DA6FF]">Recovery</span></h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#AAB0C5] font-bold">Enter your registered phone number</p>
                </div>
                <div className="space-y-6">
                  <input 
                    type="tel" 
                    placeholder="9876543210" 
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-[#0B0F1A] border border-[#2A3352] rounded-2xl py-5 px-6 text-center font-mono text-lg text-white focus:outline-none focus:border-[#4DA6FF]"
                  />
                  <button 
                    disabled={recoveryPhone.length !== 10 || loading.recovery}
                    onClick={triggerRecoveryOtp}
                    className="w-full py-5 bg-[#3DDC97] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase disabled:opacity-30"
                  >
                    {loading.recovery ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Send Recovery OTP'}
                  </button>
                  <button onClick={() => setForgotStep('NONE')} className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">Cancel</button>
                </div>
             </div>
           )}

           {forgotStep === 'OTP' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="w-20 h-20 bg-[#3DDC97]/10 rounded-full flex items-center justify-center mx-auto text-[#3DDC97] border border-[#3DDC97]/20"><ShieldCheck size={32} /></div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-serif text-white uppercase italic">Verify <span className="text-[#3DDC97]">Identity</span></h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#AAB0C5] font-bold">Verification code sent to {recoveryPhone}</p>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit OTP" 
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-[#0B0F1A] border border-[#2A3352] rounded-2xl py-5 px-6 text-center font-mono text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-[#4DA6FF]"
                    />
                    <div className="mt-2 text-[9px] text-[#6B7280] font-mono tracking-widest">PROTOTYPE CODE: {recoverySentOtp}</div>
                  </div>
                  <button 
                    disabled={recoveryOtp.length !== 6}
                    onClick={verifyRecoveryOtp}
                    className="w-full py-5 bg-[#3DDC97] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase disabled:opacity-30"
                  >
                    Confirm & Reveal ID
                  </button>
                </div>
             </div>
           )}

           {forgotStep === 'SHOW_ID' && (
             <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-[#4DA6FF]/10 rounded-full flex items-center justify-center mx-auto text-[#4DA6FF] border border-[#4DA6FF]/20"><MessageSquare size={32} /></div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-serif text-white uppercase italic">Access <span className="text-[#4DA6FF]">Restored</span></h2>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#AAB0C5] font-bold">Your secure identifier is revealed below</p>
                </div>
                <div className="p-8 bg-[#0B0F1A] border-2 border-[#4DA6FF]/30 rounded-[2rem] space-y-4">
                   <p className="text-[10px] text-[#6B7280] tracking-[0.4em] uppercase font-bold">Private Customer ID</p>
                   <p className="text-3xl font-mono text-white tracking-[0.2em] select-all cursor-pointer hover:text-[#4DA6FF] transition-colors">
                     {matchFound?.customerId}
                   </p>
                   <p className="text-[8px] text-[#AAB0C5] italic">"ID has been successfully sent to your registered device."</p>
                </div>
                <button 
                  onClick={() => {
                    setEnteredId(matchFound?.customerId || '');
                    setForgotStep('NONE');
                  }}
                  className="w-full py-5 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all shadow-xl"
                >
                  Proceed to Dashboard
                </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#0B0F1A] flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-lg bg-[#141C2F] border border-[#2A3352] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-8 right-8 text-[#6B7280] hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center space-y-4 mb-10">
          <div className="w-12 h-12 bg-[#4DA6FF]/10 rounded-xl flex items-center justify-center mx-auto text-[#4DA6FF]">
            <Smartphone size={24} />
          </div>
          <h2 className="text-3xl font-serif text-white uppercase tracking-tight">Access the <span className="text-[#4DA6FF]">Network</span></h2>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#AAB0C5] font-bold">Secure Customer Verification</p>
        </div>

        {matchFound && (
          <div className="mb-8 p-6 bg-[#4DA6FF]/10 border border-[#4DA6FF]/30 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95">
             <div className="flex items-center gap-3 text-[#4DA6FF]">
                <AlertCircle size={20} />
                <p className="text-[10px] font-bold uppercase tracking-widest">AI Agent: Identity Matched</p>
             </div>
             <p className="text-xs text-[#AAB0C5] leading-relaxed italic">"Our biometric ledger has identified you as an existing member. You may proceed by signing in with your ID."</p>
             <button 
              onClick={() => {
                setIdErrorMessage('');
                setShowIdEntry(true);
              }}
              className="w-full py-4 bg-[#4DA6FF] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2"
             >
                <Key size={14}/> Sign In With Customer ID
             </button>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Account Holder</p>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#4DA6FF] transition-colors"><User size={18}/></div>
              <input 
                type="text" 
                placeholder="Enter your legal name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1C2438] border border-[#2A3352] rounded-2xl py-4 pl-14 pr-5 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#4DA6FF] transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Communication Channel</p>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#4DA6FF] transition-colors"><Phone size={18}/></div>
              <input 
                type="tel" 
                placeholder="9876543210 (Use for Match Demo)" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-[#1C2438] border border-[#2A3352] rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:outline-none focus:border-[#4DA6FF] transition-all"
              />
            </div>
            {!verified.phone ? (
              <button 
                disabled={phone.length !== 10 || loading.phone}
                onClick={handleGetOtp}
                className="w-full py-4 bg-[#3DDC97] text-[#0B0F1A] rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {loading.phone ? <Loader2 className="animate-spin" size={16} /> : 'Secure with Phone OTP'}
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97] animate-in slide-in-from-left-2">
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Verified: {phone}</span>
                <span className="ml-auto font-mono text-sm tracking-widest opacity-60">{otp}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Biometric – Fingerprint</p>
            {!verified.finger ? (
              <button 
                onClick={handleScanFingerprint}
                disabled={loading.finger}
                className="w-full flex items-center justify-between p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl hover:border-[#4DA6FF]/40 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0B0F1A] rounded-xl text-[#4DA6FF] group-hover:scale-110 transition-transform">
                    <Fingerprint size={24} />
                  </div>
                  <span className="text-xs font-bold text-white tracking-widest uppercase">Scan Identity Pattern</span>
                </div>
                {loading.finger ? <Loader2 className="animate-spin text-[#4DA6FF]" size={18} /> : <Scan size={18} className="text-[#2A3352]" />}
              </button>
            ) : (
              <div className="flex items-center gap-3 p-5 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97] animate-in slide-in-from-left-2">
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-bold tracking-widest uppercase">✔ Fingerprint Profile Secured</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[9px] text-[#6B7280] tracking-[0.2em] uppercase font-bold ml-1">Face Scan – Liveness Detection</p>
            {!verified.face ? (
              <div className="space-y-4">
                {!cameraActive ? (
                  <button 
                    onClick={startFaceVerification}
                    className="w-full flex items-center justify-between p-5 bg-[#1C2438] border border-[#2A3352] rounded-2xl hover:border-[#4DA6FF]/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#0B0F1A] rounded-xl text-[#4DA6FF] group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                      </div>
                      <span className="text-xs font-bold text-white tracking-widest uppercase">Verify Physical Presence</span>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-[2rem] overflow-hidden border border-[#4DA6FF]/50 bg-black aspect-square max-w-[280px] mx-auto shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-80" />
                    <div className="absolute inset-0 border-2 border-[#4DA6FF] rounded-full scale-90 animate-pulse"></div>
                    <button 
                      onClick={captureFaceFrame}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-[#0B0F1A] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl active:scale-95"
                    >
                      Capture Position
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-5 bg-[#3DDC97]/10 border border-[#3DDC97]/30 rounded-2xl text-[#3DDC97] animate-in slide-in-from-left-2">
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-bold tracking-widest uppercase">✔ Liveness Verification Success</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <button 
            disabled={!isFormValid || !!matchFound}
            onClick={handleSubmit}
            className={`w-full py-5 rounded-2xl text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 flex items-center justify-center gap-3 group shadow-2xl ${
              isFormValid && !matchFound
                ? 'bg-[#4DA6FF] text-[#0B0F1A] hover:bg-white animate-pulse shadow-[0_0_40px_rgba(77,166,255,0.3)]' 
                : 'bg-[#2A3352] text-[#6B7280] opacity-50 cursor-not-allowed'
            }`}
          >
            {matchFound ? 'Identity Recognized - Sign In Above' : isFormValid ? <><ShieldCheck size={18} /> Create Account</> : 'Awaiting Authentication'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistrationFlow;
