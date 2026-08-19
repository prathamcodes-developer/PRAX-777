import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, RefreshCw, Truck, Award, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { addToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    addToast('Welcome to PRAX Studio! Your 10% promo code is PRAX10', 'success');
  };

  return (
    <footer className="bg-[#050505] text-white border-t border-[#1a1a1a] pt-16 pb-12 font-sans">
      {/* Brand Guarantees Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <Truck className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">Global Express</h4>
              <p className="text-xs text-zinc-400 mt-1">Free express DHL courier delivery on all orders over $200.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <RefreshCw className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">30-Day Returns</h4>
              <p className="text-xs text-zinc-400 mt-1">Hassle-free international exchange and returns policy.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <Award className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">500 GSM Heavyweight</h4>
              <p className="text-xs text-zinc-400 mt-1">100% organic custom milled French terry and raw cotton.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <ShieldCheck className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">Secure Payment</h4>
              <p className="text-xs text-zinc-400 mt-1">256-bit encrypted checkout with Apple Pay, Visa & Amex.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-3xl font-black tracking-[0.25em] font-display uppercase">PRAX</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Architectural silhouettes. Muted tonal depth. Uncompromising Japanese and European fabrications engineered for modern luxury streetwear.
          </p>

          {/* Newsletter Form */}
          <div className="pt-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-zinc-300 mb-2">Join PRAX Studio Access</h3>
            {subscribed ? (
              <div className="p-3 bg-[#111111] border border-[#222222] text-xs text-emerald-400 font-mono">
                ✓ SUBMISSION CONFIRMED // USE CODE <strong className="text-white">PRAX10</strong> AT CHECKOUT FOR 10% OFF
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-[#111111] border border-[#222222] border-r-0 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white flex-1 font-mono"
                />
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-zinc-200 px-4 py-2.5 text-xs font-mono font-bold uppercase flex items-center gap-1 transition-colors tracking-wider"
                >
                  <span>JOIN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[10px] text-zinc-500 mt-2 font-mono">Subscribe to receive drop notifications and private capsule keys.</p>
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 mb-4">Collections</h3>
          <ul className="space-y-2.5 text-xs font-mono text-zinc-400">
            <li>
              <button onClick={() => onNavigate('shop', { category: 'Hoodies' })} className="hover:text-white transition-colors">
                Hoodies & Fleece
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'T-Shirts' })} className="hover:text-white transition-colors">
                Heavyweight Tees
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'Pants' })} className="hover:text-white transition-colors">
                Trousers & Tech Pants
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'Jackets' })} className="hover:text-white transition-colors">
                Outerwear & Down
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'Accessories' })} className="hover:text-white transition-colors">
                Leather & Bags
              </button>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 mb-4">Client Care</h3>
          <ul className="space-y-2.5 text-xs font-mono text-zinc-400">
            <li>
              <button onClick={() => onNavigate('tracking')} className="hover:text-white transition-colors">
                Track Order
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('profile')} className="hover:text-white transition-colors">
                Client Profile
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('lookbook')} className="hover:text-white transition-colors">
                SS26 Lookbook
              </button>
            </li>
            <li>
              <span className="text-zinc-500 cursor-not-allowed">Shipping & Express Delivery</span>
            </li>
            <li>
              <span className="text-zinc-500 cursor-not-allowed">Sustainability & Ethics</span>
            </li>
          </ul>
        </div>

        {/* Studio Admin & Meta */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 mb-4">PRAX System</h3>
          <ul className="space-y-2.5 text-xs font-mono text-zinc-400">
            <li>
              <button
                onClick={() => onNavigate('admin')}
                className="text-white hover:underline flex items-center gap-1 font-bold bg-zinc-900 border border-zinc-800 px-3 py-1.5 w-max"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Admin Portal</span>
              </button>
            </li>
            <li className="pt-2 text-[11px] text-zinc-500">
              PRAX Tokyo / New York / Lisbon Studios
            </li>
            <li className="text-[11px] text-zinc-500">
              Support: concierge@praxfashion.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 mt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <p>© 2026 PRAX CLOTHING BRAND INC. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-4 text-[10px]">
          <span>PRIVACY POLICY</span>
          <span>//</span>
          <span>TERMS OF SERVICE</span>
          <span>//</span>
          <span>COOKIE PREFERENCES</span>
        </div>
      </div>
    </footer>
  );
};
