import React from 'react';
import { CheckCircle2, Truck, Download, ArrowRight, Package } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onNavigate }) => {
  const { formatPrice } = useStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans text-white space-y-12">
      {/* Confirmation Header */}
      <div className="text-center space-y-4 border-b border-zinc-800 pb-10">
        <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 font-bold inline-block uppercase">
          ORDER VERIFIED & CONFIRMED
        </span>

        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">THANK YOU FOR YOUR ORDER</h1>

        <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
          ORDER NUMBER: <strong className="text-white underline">{order.orderNumber}</strong> // A confirmation email has been sent to <strong className="text-white">{order.customerEmail}</strong>.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4 font-mono text-xs">
          <button
            onClick={handlePrint}
            className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-4 py-2 font-bold uppercase flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>PRINT INVOICE RECEIPT</span>
          </button>

          <button
            onClick={() => onNavigate('tracking', { orderNumber: order.orderNumber })}
            className="bg-white hover:bg-zinc-200 text-black font-bold uppercase px-4 py-2 flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>LIVE TRACK PACKAGE</span>
          </button>
        </div>
      </div>

      {/* Visual Shipment Timeline */}
      <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6 font-mono text-xs">
        <h3 className="font-bold text-sm uppercase text-white tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Package className="w-4 h-4 text-zinc-400" />
          <span>REAL-TIME SHIPMENT STATUS // TRACKING #: {order.trackingNumber}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {order.timeline.map((step, idx) => (
            <div key={idx} className="space-y-2 relative">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    step.completed ? 'bg-white text-black' : step.current ? 'bg-amber-400 text-black' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
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

      {/* Order Itemization */}
      <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6 font-mono text-xs">
        <h3 className="font-bold text-sm uppercase text-white border-b border-zinc-800 pb-3">ORDER ITEMS</h3>

        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-900">
              <div className="flex items-center gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-20 object-cover bg-zinc-900 border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-white font-sans text-sm">{item.product.name}</h4>
                  <p className="text-zinc-400 text-xs">
                    SIZE: {item.selectedSize} // COLOR: {item.selectedColor.name} // QTY: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-bold text-white text-sm">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          <div>
            <h4 className="font-bold text-white uppercase mb-2">SHIPPING ADDRESS</h4>
            <p className="text-zinc-400">{order.shippingAddress.fullName}</p>
            <p className="text-zinc-400">{order.shippingAddress.addressLine1}</p>
            <p className="text-zinc-400">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p className="text-zinc-400">{order.shippingAddress.country}</p>
          </div>

          <div className="space-y-1.5 text-zinc-400 text-right">
            <div className="flex justify-between"><span>SUBTOTAL</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-400"><span>DISCOUNT</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span>SHIPPING</span><span>{formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between"><span>ESTIMATED TAX</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-zinc-800">
              <span>TOTAL PAID</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => onNavigate('shop')}
          className="bg-white text-black font-mono font-bold uppercase py-4 px-8 text-xs tracking-widest inline-flex items-center gap-2"
        >
          <span>CONTINUE SHOPPING</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
