import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Globe,
  Truck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Currency } from '../types';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const {
    cartCount,
    cartTotal,
    wishlist,
    user,
    currency,
    setCurrency,
    formatPrice,
    setIsCartOpen,
    setIsSearchOpen,
    setIsAuthOpen,
    setAuthMode
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Shop All', page: 'shop', category: 'All' },
    { label: 'Hoodies', page: 'shop', category: 'Hoodies' },
    { label: 'T-Shirts', page: 'shop', category: 'T-Shirts' },
    { label: 'Pants', page: 'shop', category: 'Pants' },
    { label: 'Jackets', page: 'shop', category: 'Jackets' },
    { label: 'Accessories', page: 'shop', category: 'Accessories' },
    { label: 'Lookbook', page: 'lookbook' },
    { label: 'Track Order', page: 'tracking' }
  ];

  const handleNavClick = (page: string, category?: string) => {
    onNavigate(page, category ? { category } : undefined);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-black text-white border-b border-zinc-800 transition-all">
      {/* Top Ticker Banner */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 border-b border-zinc-800 font-mono flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Truck className="w-3.5 h-3.5 text-zinc-400" />
          <span>FREE WORLDWIDE EXPRESS SHIPPING OVER $200 // USE CODE <strong className="text-white underline">PRAX10</strong> FOR 10% OFF</span>
        </div>

        {/* Currency Switcher */}
        <div className="hidden sm:flex items-center gap-4 relative">
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1.5 hover:text-white transition-colors text-xs font-mono py-0.5 px-2 bg-zinc-800/80 rounded-none border border-zinc-700"
            >
              <Globe className="w-3 h-3 text-zinc-400" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-24 bg-zinc-950 border border-zinc-800 shadow-xl z-50 py-1">
                {(['USD', 'EUR', 'GBP'] as Currency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-zinc-800 transition-colors ${
                      currency === c ? 'text-white font-bold bg-zinc-900' : 'text-zinc-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-3xl sm:text-4xl font-black tracking-widest font-sans uppercase text-white hover:opacity-90 transition-opacity flex items-center gap-1"
        >
          <span>PRAX</span>
          <span className="text-xs font-mono font-normal tracking-normal text-zinc-500 self-end mb-1">®</span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.page, link.category)}
              className={`text-sm tracking-widest uppercase font-medium transition-colors hover:text-white py-2 border-b-2 ${
                activePage === link.page
                  ? 'text-white border-white'
                  : 'text-zinc-400 border-transparent hover:border-zinc-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 p-2 text-zinc-400 hover:text-white transition-colors group"
            title="Search Products (Ctrl+K)"
            aria-label="Search"
          >
            <Search className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span className="hidden md:inline text-xs font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
              ⌘K
            </span>
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="relative p-2 text-zinc-400 hover:text-white transition-colors group"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 group-hover:scale-105 transition-transform" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* User Account Button */}
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 p-2 text-zinc-300 hover:text-white transition-colors"
              title="My Account"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
              <span className="hidden sm:inline text-xs font-mono tracking-wider max-w-[100px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthOpen(true);
              }}
              className="flex items-center gap-1.5 p-2 text-zinc-400 hover:text-white transition-colors"
              title="Sign In"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-mono uppercase tracking-wider">LOGIN</span>
            </button>
          )}

          {/* Shopping Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 bg-white text-black hover:bg-zinc-200 transition-colors py-2 px-3.5 text-xs font-bold font-mono tracking-wider uppercase group"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>BAG</span>
            <span className="bg-black text-white px-1.5 py-0.5 text-[10px] rounded-none font-bold">
              {cartCount}
            </span>
            {cartCount > 0 && (
              <span className="hidden md:inline pl-1 border-l border-zinc-300">
                {formatPrice(cartTotal)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-6 space-y-4 font-mono">
          <div className="flex flex-col space-y-3">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page, link.category)}
                className="text-left text-sm uppercase tracking-widest text-zinc-300 hover:text-white py-1.5 border-b border-zinc-900"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>CURRENCY:</span>
            <div className="flex gap-2">
              {(['USD', 'EUR', 'GBP'] as Currency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 font-mono text-xs ${
                    currency === c ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
