import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Truck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address, Order } from '../types';

interface CheckoutPageProps {
  onOrderCompleted: (order: Order) => void;
  onNavigate: (page: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderCompleted, onNavigate }) => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    discount,
    discountAmount,
    user,
    formatPrice,
    placeOrder,
    addToast
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Delivery, 3: Payment

  // Contact & Address State
  const defaultAddr = user?.addresses.find(a => a.isDefault) || user?.addresses[0];
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [addressLine1, setAddressLine1] = useState(defaultAddr?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(defaultAddr?.addressLine2 || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '');
  const [country, setCountry] = useState(defaultAddr?.country || 'United States');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');

  // Shipping Method State
  const isFreeExpress = cartSubtotal >= 200;
  const [selectedShipping, setSelectedShipping] = useState({
    id: 'express',
    name: isFreeExpress ? 'DHL Express Courier (FREE)' : 'DHL Express Courier',
    price: isFreeExpress ? 0 : 25,
    estimatedDays: '1-2 Business Days'
  });

  // Payment Method State
  const [paymentType, setPaymentType] = useState<'card' | 'apple_pay' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState(user?.name || 'PRAX CLIENT');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  const [submitting, setSubmitting] = useState(false);

  const shippingFee = selectedShipping.price;
  const tax = Number((cartTotal * 0.08).toFixed(2));
  const finalGrandTotal = Number((cartTotal + shippingFee + tax).toFixed(2));

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !addressLine1 || !city || !postalCode) {
      addToast('Please complete all required shipping fields', 'error');
      setStep(1);
      return;
    }

    setSubmitting(true);

    const shippingAddressObj: Address = {
      id: 'addr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: false
    };

    const paymentMethodObj = {
      type: paymentType === 'card' ? 'Credit Card' : paymentType === 'apple_pay' ? 'Apple Pay' : 'Cash on Delivery',
      cardBrand: paymentType === 'card' ? 'Visa' : undefined,
      last4: paymentType === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined
    };

    const res = await placeOrder({
      email,
      shippingAddress: shippingAddressObj,
      shippingMethod: selectedShipping,
      paymentMethod: paymentMethodObj,
      subtotal: cartSubtotal,
      discount: discountAmount,
      shippingFee,
      tax,
      total: finalGrandTotal
    });

    setSubmitting(false);

    if (res.success && res.order) {
      onOrderCompleted(res.order);
    } else {
      addToast(res.error || 'Failed to complete order. Please try again.', 'error');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-mono space-y-4 text-white">
        <h2 className="text-2xl font-bold uppercase">YOUR BAG IS EMPTY</h2>
        <p className="text-zinc-400 text-xs">Add items to your bag before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-white text-black font-bold uppercase py-3 px-6 text-xs"
        >
          EXPLORE COLLECTIONS
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-10">
      {/* Checkout Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">SECURE CHECKOUT</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">PRAX EXPRESS CHECKOUT</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>256-BIT ENCRYPTED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form Steps (7 Columns) */}
        <div className="lg:col-span-7 space-y-8 font-mono text-xs">
          {/* Step Indicators */}
          <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2 border border-zinc-800 text-center font-bold">
            <button
              onClick={() => setStep(1)}
              className={`py-2 border transition-colors ${step === 1 ? 'bg-white text-black border-white' : 'text-zinc-400 border-zinc-900'}`}
            >
              1. ADDRESS
            </button>
            <button
              onClick={() => setStep(2)}
              className={`py-2 border transition-colors ${step === 2 ? 'bg-white text-black border-white' : 'text-zinc-400 border-zinc-900'}`}
            >
              2. DELIVERY
            </button>
            <button
              onClick={() => setStep(3)}
              className={`py-2 border transition-colors ${step === 3 ? 'bg-white text-black border-white' : 'text-zinc-400 border-zinc-900'}`}
            >
              3. PAYMENT
            </button>
          </div>

          <form onSubmit={handleCompleteOrder} className="space-y-6">
            {/* STEP 1: Shipping Address */}
            {step === 1 && (
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2">
                  CLIENT SHIPPING DETAILS
                </h2>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Email Address (For Order Tracking)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="client@praxfashion.com"
                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    placeholder="742 Fashion Avenue, Suite 12"
                    className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="NY"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      placeholder="10018"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black font-bold uppercase py-3.5 tracking-wider flex items-center justify-center gap-2 transition-colors mt-4"
                >
                  <span>CONTINUE TO DELIVERY OPTIONS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Delivery Options */}
            {step === 2 && (
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
                <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2">
                  DELIVERY METHOD
                </h2>

                <div className="space-y-3">
                  <div
                    onClick={() =>
                      setSelectedShipping({
                        id: 'express',
                        name: isFreeExpress ? 'DHL Express Courier (FREE)' : 'DHL Express Courier',
                        price: isFreeExpress ? 0 : 25,
                        estimatedDays: '1-2 Business Days'
                      })
                    }
                    className={`p-4 border cursor-pointer flex items-center justify-between transition-colors ${
                      selectedShipping.id === 'express' ? 'bg-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-white" />
                      <div>
                        <h4 className="font-bold text-white uppercase">DHL Express Global Courier</h4>
                        <p className="text-[11px] text-zinc-400">Guaranteed 1-2 Business Days Worldwide Air Delivery</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">{isFreeExpress ? 'FREE' : formatPrice(25)}</span>
                  </div>

                  <div
                    onClick={() =>
                      setSelectedShipping({
                        id: 'standard',
                        name: 'Standard Postal Delivery',
                        price: 10,
                        estimatedDays: '3-5 Business Days'
                      })
                    }
                    className={`p-4 border cursor-pointer flex items-center justify-between transition-colors ${
                      selectedShipping.id === 'standard' ? 'bg-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-zinc-500" />
                      <div>
                        <h4 className="font-bold text-white uppercase">Standard International Post</h4>
                        <p className="text-[11px] text-zinc-400">3-5 Business Days Delivery</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">{formatPrice(10)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-zinc-900 text-white font-bold uppercase py-3.5 px-6 border border-zinc-800"
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-white text-black font-bold uppercase py-3.5 flex items-center justify-center gap-2"
                  >
                    <span>CONTINUE TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Gateway */}
            {step === 3 && (
              <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-6">
                <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2">
                  PAYMENT GATEWAY
                </h2>

                {/* Credit Card Visual Preview */}
                <div className="p-6 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-700 rounded-none shadow-2xl relative overflow-hidden font-mono space-y-6">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-bold tracking-widest text-white">PRAX VIP CARD</span>
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>

                  <div className="text-lg font-bold tracking-widest text-white font-mono">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end text-[11px] text-zinc-400 uppercase">
                    <div>
                      <span className="text-[9px] block text-zinc-500">CARDHOLDER NAME</span>
                      <strong className="text-white">{cardName || 'CLIENT NAME'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] block text-zinc-500">EXPIRES</span>
                      <strong className="text-white">{cardExpiry || '12/28'}</strong>
                    </div>
                  </div>
                </div>

                {/* Payment Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">CVV / Security Code</label>
                      <input
                        type="text"
                        required
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="888"
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-zinc-900 text-white font-bold uppercase py-4 px-6 border border-zinc-800"
                  >
                    BACK
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold uppercase py-4 tracking-widest text-xs flex items-center justify-center gap-2 transition-colors shadow-2xl"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{submitting ? 'AUTHORIZING...' : `PAY ${formatPrice(finalGrandTotal)} & PLACE ORDER`}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Summary Sidebar (5 Columns) */}
        <div className="lg:col-span-5 p-6 bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-6 h-fit">
          <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2">
            ORDER SUMMARY ({cart.reduce((a, b) => a + b.quantity, 0)} ITEMS)
          </h2>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex gap-3 pb-3 border-b border-zinc-900">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-14 h-16 object-cover bg-zinc-900 shrink-0 border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate font-sans text-xs">{item.product.name}</h4>
                  <p className="text-zinc-500 text-[10px]">QTY: {item.quantity} // {item.selectedSize} / {item.selectedColor.name}</p>
                  <p className="font-bold text-white mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-zinc-900 pt-4 text-zinc-400">
            <div className="flex justify-between">
              <span>ITEMS SUBTOTAL</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>PROMO DISCOUNT ({discount?.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>SHIPPING ({selectedShipping.name})</span>
              <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
            </div>

            <div className="flex justify-between">
              <span>ESTIMATED TAX (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-zinc-800">
              <span>TOTAL DUE</span>
              <span>{formatPrice(finalGrandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
