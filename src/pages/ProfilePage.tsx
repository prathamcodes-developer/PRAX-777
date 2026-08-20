import React, { useState } from 'react';
import { User as UserIcon, Package, MapPin, Settings, LogOut, Plus, Trash2, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address } from '../types';

interface ProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const {
    user,
    logout,
    updateProfile,
    addAddress,
    removeAddress,
    orders,
    formatPrice,
    addToCart,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings'>('orders');

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [addrPhone, setAddrPhone] = useState('');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center font-mono text-white space-y-4">
        <h2 className="text-2xl font-bold uppercase">CLIENT LOGIN REQUIRED</h2>
        <p className="text-xs text-zinc-400">Please log in or register an account to view your client dashboard.</p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-white text-black font-bold uppercase py-3 px-6 text-xs"
        >
          RETURN TO HOME
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, phone });
    setSavingProfile(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addAddress({
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone: addrPhone,
      isDefault: user.addresses.length === 0
    });
    if (success) {
      setShowAddAddress(false);
      setAddressLine1('');
      setCity('');
      setPostalCode('');
    }
  };

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addToCart(item.product, item.selectedSize, item.selectedColor, item.quantity);
    });
    addToast('Order items re-added to your bag', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-10">
      {/* Header Profile Summary */}
      <div className="p-8 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user.avatar || '/images/prax_hero_banner.jpg'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('prax_hero_banner.jpg')) {
                target.src = '/images/prax_hero_banner.jpg';
              }
            }}
          />
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PRAX CLIENT PROFILE</span>
            <h1 className="text-2xl font-black uppercase text-white font-sans">{user.name}</h1>
            <p className="text-xs font-mono text-zinc-400">{user.email} // CLIENT SINCE {new Date(user.createdAt).getFullYear()}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs font-bold uppercase py-2.5 px-4 flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>SIGN OUT</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2 border border-zinc-800 font-mono text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 flex items-center justify-center gap-2 border transition-colors ${
            activeTab === 'orders' ? 'bg-white text-black border-white' : 'text-zinc-400 border-zinc-900 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>ORDER HISTORY ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`py-3 flex items-center justify-center gap-2 border transition-colors ${
            activeTab === 'addresses' ? 'bg-white text-black border-white' : 'text-zinc-400 border-zinc-900 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>ADDRESS BOOK ({user.addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 flex items-center justify-center gap-2 border transition-colors ${
            activeTab === 'settings' ? 'bg-white text-black border-white' : 'text-zinc-400 border-zinc-900 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ACCOUNT SETTINGS</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6 font-mono text-xs">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950 border border-zinc-800 space-y-3">
              <Package className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-400">NO PAST ORDERS FOUND IN CLIENT HISTORY.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                  <div>
                    <span className="font-bold text-white text-sm">ORDER #{order.orderNumber}</span>
                    <span className="text-zinc-500 ml-3">PLACED ON {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      {order.status}
                    </span>
                    <span className="font-bold text-white">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover bg-zinc-900"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('prax_hero_banner.jpg')) {
                              target.src = '/images/prax_hero_banner.jpg';
                            }
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-white font-sans">{item.product.name}</h4>
                          <p className="text-zinc-500">SIZE: {item.selectedSize} // QTY: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-white">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-zinc-900">
                  <span className="text-zinc-500">Carrier: {order.carrier} // Tracking: {order.trackingNumber}</span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('tracking', { orderNumber: order.orderNumber })}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>TRACK PACKAGE</span>
                    </button>

                    <button
                      onClick={() => handleReorder(order)}
                      className="bg-white text-black font-bold uppercase px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>RE-ORDER</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Address Book */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">SAVED DELIVERY LOCATIONS ({user.addresses.length})</span>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="bg-white text-black font-bold uppercase px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW ADDRESS</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
              <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2">NEW ADDRESS DETAILS</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Full Recipient Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Phone Number"
                  value={addrPhone}
                  onChange={e => setAddrPhone(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
                />
              </div>

              <input
                type="text"
                required
                placeholder="Street Address Line 1"
                value={addressLine1}
                onChange={e => setAddressLine1(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
              />

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="State / Region"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
                />
              </div>

              <button type="submit" className="w-full bg-white text-black font-bold uppercase py-3">
                SAVE ADDRESS
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map(addr => (
              <div key={addr.id} className="p-6 bg-zinc-950 border border-zinc-800 space-y-2 relative">
                {addr.isDefault && (
                  <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 uppercase">
                    DEFAULT ADDRESS
                  </span>
                )}
                <h4 className="font-bold text-white text-sm font-sans pt-1">{addr.fullName}</h4>
                <p className="text-zinc-400">{addr.addressLine1}</p>
                <p className="text-zinc-400">{addr.city}, {addr.state} {addr.postalCode}</p>
                <p className="text-zinc-400">{addr.country}</p>

                <button
                  onClick={() => removeAddress(addr.id)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 p-1"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleUpdateProfile} className="p-8 bg-zinc-950 border border-zinc-800 space-y-4 font-mono text-xs max-w-xl">
          <h3 className="font-bold text-white uppercase text-sm border-b border-zinc-800 pb-2">PERSONAL ACCOUNT DATA</h3>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Email Address (Read Only)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-zinc-900/50 border border-zinc-800 px-3 py-2.5 text-zinc-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full bg-white text-black font-bold uppercase py-3.5 transition-colors"
          >
            {savingProfile ? 'SAVING...' : 'UPDATE PROFILE'}
          </button>
        </form>
      )}
    </div>
  );
};
