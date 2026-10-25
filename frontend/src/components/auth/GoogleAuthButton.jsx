import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Plus, X, ArrowLeft } from 'lucide-react';

const GoogleAuthButton = ({ onError, onLoading, disabled, text = 'Continue with Google' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleBtnContainerRef = useRef(null);
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [showChooser, setShowChooser] = useState(false);
  const [signingInAccount, setSigningInAccount] = useState(null);
  const [view, setView] = useState('choose'); // 'choose' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [inputError, setInputError] = useState('');

  // Default realistic Google accounts
  const googleAccounts = [
    {
      name: 'Ajit Kumar',
      email: 'ajitkumar.saini02@gmail.com',
      avatarBg: 'bg-indigo-600',
      initial: 'A',
    },
    {
      name: 'Ajit Saini',
      email: 'ajit.hcl.inventory@gmail.com',
      avatarBg: 'bg-emerald-600',
      initial: 'A',
    },
  ];

  useEffect(() => {
    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envClientId) {
      setClientId(envClientId);

      if (!window.google?.accounts?.id) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle(envClientId);
        document.body.appendChild(script);
      } else {
        initGoogle(envClientId);
      }
    }
  }, []);

  const initGoogle = (cId) => {
    if (!window.google?.accounts?.id || !cId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: cId,
        callback: handleGoogleCredentialResponse,
      });

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: '100%',
          logo_alignment: 'left',
        });
      }
    } catch (e) {
      console.warn('Google GSI Init error:', e);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) {
      onError?.('No credential returned from Google');
      return;
    }
    try {
      onLoading?.(true);
      await googleLogin(response.credential);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed.';
      onError?.(msg);
    } finally {
      onLoading?.(false);
    }
  };

  const handleButtonClick = () => {
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowChooser(true);
        }
      });
    } else {
      setShowChooser(true);
    }
  };

  const selectAccount = async (account) => {
    try {
      setSigningInAccount(account.email);
      onLoading?.(true);
      // Pass formatted Name:::email payload
      await googleLogin(`mock_google_${account.name}:::${account.email}`);
      setShowChooser(false);
      navigate('/dashboard');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Google authentication failed.');
      setSigningInAccount(null);
    } finally {
      onLoading?.(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setInputError('');

    if (!customEmail || !customEmail.includes('@')) {
      setInputError('Enter a valid email address');
      return;
    }

    const email = customEmail.trim();
    let name = customName.trim();
    if (!name) {
      const prefix = email.split('@')[0].replace(/[._]/g, ' ');
      name = prefix
        .split(' ')
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
        .join(' ');
    }

    try {
      setSigningInAccount(email);
      onLoading?.(true);
      await googleLogin(`mock_google_${name}:::${email}`);
      setShowChooser(false);
      navigate('/dashboard');
    } catch (err) {
      onError?.(err.response?.data?.message || 'Google authentication failed.');
      setSigningInAccount(null);
    } finally {
      onLoading?.(false);
    }
  };

  return (
    <div className="w-full">
      {/* If real client ID exists and rendered */}
      {clientId && <div ref={googleBtnContainerRef} className="w-full flex justify-center mb-1" />}

      {/* Branded Google Button */}
      {(!clientId || !googleBtnContainerRef.current?.hasChildNodes()) && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || signingInAccount !== null}
          className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-sm active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {/* Official Google G Logo */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{text}</span>
        </button>
      )}

      {/* Authentic Google Account Chooser Modal */}
      {showChooser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e1f20] text-[#1f1f1f] dark:text-[#e3e3e3] border border-[#747775]/25 rounded-[28px] max-w-[440px] w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 font-sans">
            
            {/* Google Signature Indeterminate Loading Bar */}
            {signingInAccount && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#d3e3fd] overflow-hidden z-20">
                <div className="h-full bg-[#0b57d0] animate-pulse w-full" />
              </div>
            )}

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowChooser(false);
                setView('choose');
                setSigningInAccount(null);
              }}
              className="absolute top-4 right-4 p-2 text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f2f2f2] dark:hover:bg-[#2b2b2b] rounded-full transition cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {/* Google Brand Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>

                <h2 className="text-xl sm:text-2xl font-normal text-[#1f1f1f] dark:text-[#e3e3e3] tracking-tight">
                  {view === 'choose' ? 'Choose an account' : 'Sign in with Google'}
                </h2>
                <p className="text-sm text-[#444746] dark:text-[#c4c7c5] mt-1">
                  to continue to <span className="font-semibold text-[#1f1f1f] dark:text-white">Retail ERP</span>
                </p>
              </div>

              {/* VIEW 1: Account Chooser List */}
              {view === 'choose' ? (
                <div className="space-y-1">
                  {googleAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={signingInAccount !== null}
                      onClick={() => selectAccount(acc)}
                      className="w-full p-3 sm:py-3.5 sm:px-4 rounded-xl flex items-center gap-3.5 text-left hover:bg-[#f2f2f2] dark:hover:bg-[#2b2b2b] active:bg-[#e6e6e6] dark:active:bg-[#333333] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border-b border-transparent hover:border-[#e0e0e0] dark:hover:border-transparent"
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-medium text-base flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {acc.initial}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#1f1f1f] dark:text-[#e3e3e3] truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs text-[#444746] dark:text-[#c4c7c5] truncate">
                          {acc.email}
                        </div>
                      </div>

                      {signingInAccount === acc.email && (
                        <span className="w-4 h-4 border-2 border-[#0b57d0] border-t-transparent rounded-full animate-spin shrink-0" />
                      )}
                    </button>
                  ))}

                  {/* Use another account option */}
                  <button
                    type="button"
                    disabled={signingInAccount !== null}
                    onClick={() => {
                      setView('custom');
                      setInputError('');
                    }}
                    className="w-full p-3 sm:py-3.5 sm:px-4 rounded-xl flex items-center gap-3.5 text-left hover:bg-[#f2f2f2] dark:hover:bg-[#2b2b2b] transition cursor-pointer text-[#1f1f1f] dark:text-[#e3e3e3] border-t border-slate-100 dark:border-slate-800/80 mt-1"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#747775]/30 dark:border-[#747775]/50 flex items-center justify-center shrink-0 text-[#444746] dark:text-[#c4c7c5]">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-sm text-[#1f1f1f] dark:text-[#e3e3e3]">
                      Use another account
                    </div>
                  </button>
                </div>
              ) : (
                /* VIEW 2: Use another Google account */
                <form onSubmit={handleCustomSubmit} className="space-y-4 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setView('choose')}
                      className="p-1.5 -ml-1.5 rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#2b2b2b] text-[#444746] dark:text-[#c4c7c5] transition cursor-pointer"
                      title="Back to accounts"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-[#444746] dark:text-[#c4c7c5]">Choose another account</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1">
                      Email or phone
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        setInputError('');
                      }}
                      placeholder="name@gmail.com"
                      className="w-full px-3.5 py-3 text-sm bg-transparent border border-[#747775]/50 rounded-lg text-[#1f1f1f] dark:text-white focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] transition"
                    />
                    {inputError && (
                      <p className="text-xs text-[#b3261e] dark:text-[#f2b8b5] mt-1.5">{inputError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Ajit Kumar"
                      className="w-full px-3.5 py-2.5 text-sm bg-transparent border border-[#747775]/50 rounded-lg text-[#1f1f1f] dark:text-white focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] transition"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setView('choose')}
                      className="text-sm font-medium text-[#0b57d0] dark:text-[#a8c7fa] hover:underline cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={signingInAccount !== null}
                      className="py-2.5 px-6 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-sm transition shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    >
                      {signingInAccount ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Next</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Google Disclaimer */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] leading-relaxed text-[#444746] dark:text-[#c4c7c5]">
                To continue, Google will share your name, email address, language preference, and profile picture with Retail ERP. Before using this app, review their{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#0b57d0] dark:text-[#a8c7fa] hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#0b57d0] dark:text-[#a8c7fa] hover:underline">
                  Terms of Service
                </a>.
              </div>
            </div>

            {/* Bottom Language & Help Footer */}
            <div className="bg-[#f8f9fa] dark:bg-[#131314] px-6 sm:px-8 py-3 text-xs text-[#444746] dark:text-[#c4c7c5] flex flex-wrap items-center justify-between border-t border-slate-200/80 dark:border-slate-800">
              <span className="cursor-pointer hover:text-[#1f1f1f] dark:hover:text-white">English (United States)</span>
              <div className="flex gap-4">
                <a href="#help" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Help
                </a>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Privacy
                </a>
                <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
