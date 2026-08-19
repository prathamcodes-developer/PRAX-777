import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderNumber }) => {
  const { formatPrice, addToast } = useStore();
  const [query, setQuery] = useState(initialOrderNumber || 'PRX-84920');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (searchQuery: string) => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${searchQuery}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        addToast(data.error || 'Order not found', 'error');
      }
    } catch {
      addToast('Error fetching order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('PRX-84920');
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(query);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans text-white space-y-12">
      <div className="text-center space-y-3 border-b border-zinc-800 pb-8">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">LIVE SHIPMENT INTELLIGENCE</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">TRACK YOUR PACKAGE</h1>
        <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
          Enter your PRAX order number (e.g. PRX-84920) or DHL tracking number below.
        </p>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto pt-4 flex gap-2 font-mono text-xs">
          <input
            type="text"
            required
            value={query}
            onChange={e => setQuery(e.target.value.toUpperCase())}
            placeholder="PRX-84920"
            className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black hover:bg-zinc-200 font-bold uppercase px-6 py-3 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'LOOKING UP...' : 'TRACK'}</span>
          </button>
        </form>
      </div>

      {order ? (
        <div className="space-y-8 font-mono text-xs">
          {/* Status Header */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">ORDER #{order.orderNumber}</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  STATUS: {order.status}
                </span>
              </div>
              <p className="text-zinc-400 mt-1">Carrier: <strong>{order.carrier}</strong> // Tracking #: <strong>{order.trackingNumber}</strong></p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-zinc-500 block text-[10px]">ESTIMATED DELIVERY</span>
              <strong className="text-white text-sm">{order.estimatedDelivery}</strong>
            </div>
          </div>

          {/* Visual Tracking Timeline */}
          <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6">
            <h3 className="font-bold text-sm uppercase text-white tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Package className="w-4 h-4 text-zinc-400" />
              <span>SHIPMENT MILESTONES</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        step.completed ? 'bg-white text-black' : step.current ? 'bg-amber-400 text-black animate-pulse' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    <div className={`h-0.5 flex-1 ${step.completed ? 'bg-white' : 'bg-zinc-800'}`} />
                  </div>

                  <h4 className={`font-bold uppercase text-[11px] ${step.completed || step.current ? 'text-white' : 'text-zinc-600'}`}>
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500">{step.location}</p>
                  <p className="text-[10px] text-zinc-400 font-bold">{step.timestamp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items Summary */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="font-bold uppercase text-white border-b border-zinc-800 pb-2">SHIPMENT CONTENTS</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-14 object-cover bg-zinc-900" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-white font-sans">{item.product.name}</h4>
                      <p className="text-zinc-500">SIZE: {item.selectedSize} // QTY: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 font-mono text-zinc-500 text-xs">
          SEARCH FOR AN ORDER TO VIEW LIVE TRACKING STATUS.
        </div>
      )}
    </div>
  );
};
