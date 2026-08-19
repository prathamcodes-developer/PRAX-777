import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  onCheckout?: () => void;
  onNavigate?: (page: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onNavigate }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    discount,
    discountAmount,
    applyDiscount,
    removeDiscount,
    formatPrice
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const freeShippingThreshold = 200;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    setApplyingPromo(true);
    await applyDiscount(promoInput);
    setPromoInput('');
    setApplyingPromo(false);
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col h-full shadow-2xl z-10 font-sans"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-black tracking-widest font-sans uppercase">YOUR BAG</h2>
              <span className="bg-zinc-800 text-zinc-300 text-xs font-mono px-2 py-0.5 font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)} ITEMS
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Ribbon */}
          <div className="bg-zinc-900/90 border-b border-zinc-800 p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Truck className="w-4 h-4 text-zinc-400" />
                {amountNeededForFreeShipping === 0 ? (
                  <strong className="text-emerald-400">FREE EXPRESS SHIPPING UNLOCKED!</strong>
                ) : (
                  <span>Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> for Free Express Delivery</span>
                )}
              </span>
              <span className="text-zinc-500 font-bold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4 font-mono">
                <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto stroke-1" />
                <p className="text-sm text-zinc-400">YOUR BAG IS CURRENTLY EMPTY</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase py-3 px-6 tracking-wider transition-colors"
                >
                  EXPLORE COLLECTIONS
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-4 pb-6 border-b border-zinc-900">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover bg-zinc-900 shrink-0 border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold tracking-wide text-zinc-100 line-clamp-1">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] font-mono text-zinc-400 mt-1 space-x-3">
                        <span>SIZE: <strong>{item.selectedSize}</strong></span>
                        <span>COLOR: <strong>{item.selectedColor.name}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 font-mono">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-zinc-800 bg-zinc-900">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-white">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-950 space-y-4">
              {/* Promo Code Form */}
              <div>
                {discount ? (
                  <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-700 font-mono text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{discount.code} ({discount.description})</span>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-zinc-400 hover:text-white text-xs underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. PRAX10)"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 flex-1 focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      disabled={applyingPromo || !promoInput}
                      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-mono text-xs px-4 font-bold transition-colors"
                    >
                      APPLY
                    </button>
                  </form>
                )}
              </div>

              {/* Order Calculations */}
              <div className="space-y-2 font-mono text-xs border-t border-zinc-900 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>SUBTOTAL</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>DISCOUNT ({discount?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>ESTIMATED SHIPPING</span>
                  <span>{amountNeededForFreeShipping === 0 ? 'FREE' : formatPrice(15)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>ESTIMATED TOTAL</span>
                  <span>{formatPrice(cartTotal + (amountNeededForFreeShipping === 0 ? 0 : 15))}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (onCheckout) {
                    onCheckout();
                  } else if (onNavigate) {
                    onNavigate('checkout');
                  }
                }}
                className="w-full bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs tracking-widest uppercase py-4 flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
