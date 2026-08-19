import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Truck, CheckCircle2, ArrowRight, ArrowLeft, QrCode, Smartphone, Building2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Address, Order } from '../types';

interface CheckoutPageProps {
  onOrderCompleted?: (order: Order) => void;
  onOrderSuccess?: (order: Order) => void;
  onNavigate: (page: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderCompleted, onOrderSuccess, onNavigate }) => {
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

  // Address & Contact State
  const defaultAddr = user?.addresses.find(a => a.isDefault) || user?.addresses[0];
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user?.name || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(defaultAddr?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(defaultAddr?.addressLine2 || '');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || defaultAddr?.postalCode || '');
  const [district, setDistrict] = useState(defaultAddr?.district || defaultAddr?.city || '');
  const [stateName, setStateName] = useState(defaultAddr?.state || 'Maharashtra');
  const [country, setCountry] = useState(defaultAddr?.country || 'India');

  // Delivery Method
  const isFreeExpress = cartSubtotal >= 1999;
  const [selectedShipping, setSelectedShipping] = useState({
    id: 'express',
    name: isFreeExpress ? 'Delhivery Air Express (FREE)' : 'Delhivery Air Express',
    price: isFreeExpress ? 0 : 149,
    estimatedDays: '1-3 Days Fast Delivery'
  });

  // Payment Options
  const [paymentType, setPaymentType] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState(user?.name || 'PRAX CLIENT');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [bankName, setBankName] = useState('HDFC Bank');

  const [submitting, setSubmitting] = useState(false);

  const shippingFee = selectedShipping.price;
  const tax = Math.round(cartTotal * 0.05); // 5% GST
  const finalGrandTotal = cartTotal + shippingFee + tax;

  // Auto-detect pincode info helper
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      // Mock district helper
      if (!district) {
        if (val.startsWith('400')) setDistrict('Mumbai');
        else if (val.startsWith('110')) setDistrict('New Delhi');
        else if (val.startsWith('560')) setDistrict('Bengaluru');
        else if (val.startsWith('600')) setDistrict('Chennai');
        else if (val.startsWith('700')) setDistrict('Kolkata');
        else if (val.startsWith('500')) setDistrict('Hyderabad');
        else if (val.startsWith('380')) setDistrict('Ahmedabad');
        else setDistrict('Central District');
      }
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !phone || !addressLine1 || !pincode || !district || !stateName) {
      addToast('Please fill all mandatory shipping address fields', 'error');
      setStep(1);
      return;
    }

    if (paymentType === 'upi' && !upiId.trim()) {
      addToast('Please enter a valid UPI ID (e.g. mobile@upi)', 'error');
      return;
    }

    setSubmitting(true);

    const shippingAddressObj: Address = {
      id: 'addr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      pincode,
      postalCode: pincode,
      district,
      city: district,
      state: stateName,
      country,
      isDefault: false
    };

    let paymentLabel = 'UPI / QR Payment';
    if (paymentType === 'card') paymentLabel = 'Credit / Debit Card (RuPay/Visa)';
    else if (paymentType === 'netbanking') paymentLabel = `NetBanking (${bankName})`;
    else if (paymentType === 'cod') paymentLabel = 'Cash on Delivery (COD)';

    const paymentMethodObj = {
      type: paymentLabel,
      cardBrand: paymentType === 'card' ? 'RuPay / Visa' : undefined,
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
      addToast('Order placed successfully!', 'success');
      if (onOrderCompleted) {
        onOrderCompleted(res.order);
      } else if (onOrderSuccess) {
        onOrderSuccess(res.order);
      }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-8">
      {/* Checkout Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">EXPRESS CHECKOUT (INDIA)</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">PRAX STUDIO CHECKOUT</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-BIT SECURE ENCRYPTION</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Steps (7 Columns) */}
        <div className="lg:col-span-7 space-y-6 font-mono text-xs">
          {/* Step Navigation */}
          <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2 border border-zinc-800 text-center font-bold">
            <button
              onClick={() => setStep(1)}
              className={`py-2 border transition-all ${step === 1 ? 'bg-white text-black border-white shadow-lg' : 'text-zinc-400 border-zinc-900 hover:text-white'}`}
            >
              1. SHIPPING DETAILS
            </button>
            <button
              onClick={() => setStep(2)}
              className={`py-2 border transition-all ${step === 2 ? 'bg-white text-black border-white shadow-lg' : 'text-zinc-400 border-zinc-900 hover:text-white'}`}
            >
              2. DELIVERY
            </button>
            <button
              onClick={() => setStep(3)}
              className={`py-2 border transition-all ${step === 3 ? 'bg-white text-black border-white shadow-lg' : 'text-zinc-400 border-zinc-900 hover:text-white'}`}
            >
              3. PAYMENT
            </button>
          </div>

          <form onSubmit={handleCompleteOrder} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Address Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 bg-zinc-950 border border-zinc-800 space-y-5"
                >
                  <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span>CLIENT DELIVERY ADDRESS DETAILS</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="mr.praxlabs@gmail.com"
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">Contact No (Mobile) *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Prax Kumar"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Flat, House No., Building, Street Address *</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={e => setAddressLine1(e.target.value)}
                      placeholder="Flat 402, Building A, MG Road"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Area, Sector, Landmark (Optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={e => setAddressLine2(e.target.value)}
                      placeholder="Near City Mall"
                      className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="400001"
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">District / City *</label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 uppercase mb-1">State *</label>
                      <select
                        value={stateName}
                        onChange={e => setStateName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                      >
                        {INDIAN_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase mb-1">Country</label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full bg-zinc-900/50 border border-zinc-800 px-3 py-2.5 text-zinc-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!email || !fullName || !phone || !addressLine1 || !pincode || !district) {
                        addToast('Please fill all required fields before proceeding', 'error');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold uppercase py-3.5 tracking-wider flex items-center justify-center gap-2 transition-colors mt-4"
                  >
                    <span>PROCEED TO DELIVERY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Delivery Speed */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 bg-zinc-950 border border-zinc-800 space-y-4"
                >
                  <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-zinc-400" />
                    <span>SELECT COURIER DELIVERY METHOD</span>
                  </h2>

                  <div className="space-y-3">
                    <div
                      onClick={() =>
                        setSelectedShipping({
                          id: 'express',
                          name: isFreeExpress ? 'Delhivery Air Express (FREE)' : 'Delhivery Air Express',
                          price: isFreeExpress ? 0 : 149,
                          estimatedDays: '1-2 Days Fast Air Shipping'
                        })
                      }
                      className={`p-4 border cursor-pointer flex items-center justify-between transition-all ${
                        selectedShipping.id === 'express' ? 'bg-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-white" />
                        <div>
                          <h4 className="font-bold text-white uppercase">Delhivery Air Express</h4>
                          <p className="text-[11px] text-zinc-400">Insured 1-2 Days Express Priority Delivery across India</p>
                        </div>
                      </div>
                      <span className="font-bold text-white">{isFreeExpress ? 'FREE' : formatPrice(149)}</span>
                    </div>

                    <div
                      onClick={() =>
                        setSelectedShipping({
                          id: 'standard',
                          name: 'Standard Surface Courier',
                          price: 79,
                          estimatedDays: '3-5 Business Days'
                        })
                      }
                      className={`p-4 border cursor-pointer flex items-center justify-between transition-all ${
                        selectedShipping.id === 'standard' ? 'bg-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-zinc-500" />
                        <div>
                          <h4 className="font-bold text-white uppercase">Bluedart Standard Ground</h4>
                          <p className="text-[11px] text-zinc-400">3-5 Business Days Surface Shipping</p>
                        </div>
                      </div>
                      <span className="font-bold text-white">{formatPrice(79)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-zinc-900 text-white font-bold uppercase py-3.5 px-6 border border-zinc-800 hover:bg-zinc-800"
                    >
                      BACK
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold uppercase py-3.5 flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>PROCEED TO PAYMENT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment Options (UPI, Card, Netbanking, COD) */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 bg-zinc-950 border border-zinc-800 space-y-6"
                >
                  <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-400" />
                    <span>SELECT PAYMENT GATEWAY</span>
                  </h2>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('upi')}
                      className={`p-3 border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentType === 'upi' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="text-[10px]">UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('card')}
                      className={`p-3 border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentType === 'card' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[10px]">CARDS / RUPAY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('netbanking')}
                      className={`p-3 border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentType === 'netbanking' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-[10px]">NETBANKING</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('cod')}
                      className={`p-3 border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentType === 'cod' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="text-[10px]">CASH ON DELIVERY</span>
                    </button>
                  </div>

                  {/* Payment Sub-forms */}
                  {paymentType === 'upi' && (
                    <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                        <QrCode className="w-4 h-4" />
                        <span>INSTANT UPI PAYMENT (GPay, PhonePe, Paytm, BHIM)</span>
                      </div>
                      <div>
                        <label className="block text-zinc-400 uppercase mb-1">Enter UPI VPA / ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="e.g. 9876543210@ybl or username@okaxis"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                        />
                      </div>
                      <p className="text-zinc-500 text-[10px]">
                        A payment collect request will be pushed directly to your UPI app upon order submission.
                      </p>
                    </div>
                  )}

                  {paymentType === 'card' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-tr from-zinc-900 to-zinc-950 border border-zinc-700 shadow-xl relative overflow-hidden font-mono space-y-4">
                        <div className="flex justify-between items-center text-zinc-400">
                          <span className="font-bold tracking-widest text-white">PRAX VIP RUPAY / VISA</span>
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-bold tracking-widest text-white font-mono">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end text-[10px] text-zinc-400 uppercase">
                          <div>
                            <span className="text-[8px] block text-zinc-500">CARD HOLDER</span>
                            <strong className="text-white">{cardName || 'CLIENT'}</strong>
                          </div>
                          <div>
                            <span className="text-[8px] block text-zinc-500">EXPIRES</span>
                            <strong className="text-white">{cardExpiry || '12/28'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-zinc-400 uppercase mb-1">Card Number</label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono focus:outline-none focus:border-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-zinc-400 uppercase mb-1">Expiry Date</label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={e => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 uppercase mb-1">CVV</label>
                            <input
                              type="text"
                              required
                              value={cardCvv}
                              onChange={e => setCardCvv(e.target.value)}
                              placeholder="888"
                              className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentType === 'netbanking' && (
                    <div className="p-4 bg-zinc-900 border border-zinc-800 space-y-3">
                      <label className="block text-zinc-400 uppercase mb-1">Select Bank</label>
                      <select
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-white"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="IndusInd Bank">IndusInd Bank</option>
                      </select>
                    </div>
                  )}

                  {paymentType === 'cod' && (
                    <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-300 space-y-2">
                      <h4 className="font-bold text-white uppercase text-xs flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>PAY CASH UPON DOORSTEP DELIVERY</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Pay via cash or UPI directly to the delivery agent when your parcel arrives.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-zinc-900 text-white font-bold uppercase py-3.5 px-6 border border-zinc-800 hover:bg-zinc-800"
                    >
                      BACK
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold uppercase py-3.5 tracking-widest text-xs flex items-center justify-center gap-2 transition-colors shadow-2xl"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{submitting ? 'PROCESSING...' : `PLACE ORDER • ${formatPrice(finalGrandTotal)}`}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right Summary Sidebar (5 Columns) */}
        <div className="lg:col-span-5 p-6 bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-6 h-fit">
          <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-2 flex items-center justify-between">
            <span>ORDER SUMMARY</span>
            <span className="text-zinc-500 font-normal">{cart.reduce((a, b) => a + b.quantity, 0)} ITEMS</span>
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

          <div className="space-y-2.5 border-t border-zinc-900 pt-4 text-zinc-400">
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
              <span>ESTIMATED GST (5%)</span>
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
