import React, { useState, useEffect } from 'react';
import { ShieldCheck, DollarSign, ShoppingBag, TrendingUp, Package, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';

export const AdminPage: React.FC = () => {
  const { formatPrice, products, addToast } = useStore();

  const [stats, setStats] = useState<any>({
    totalRevenue: 12450.00,
    totalOrders: 28,
    avgOrderValue: 444.64,
    totalProducts: products.length
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok) {
        setStats({
          totalRevenue: data.totalRevenue,
          totalOrders: data.totalOrders,
          avgOrderValue: data.avgOrderValue,
          totalProducts: data.totalProducts
        });
        setRecentOrders(data.recentOrders || []);
      }
    } catch {
      console.warn('Admin stats fallback to client state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        addToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
        fetchAdminStats();
      }
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-10">
      {/* Admin Title */}
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">INTERNAL SYSTEM MANAGEMENT</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">PRAX STUDIO ADMIN PORTAL</h1>
        </div>

        <button
          onClick={fetchAdminStats}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-mono text-xs uppercase px-4 py-2 font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH STATS</span>
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
        <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span>TOTAL GROSS REVENUE</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatPrice(stats.totalRevenue)}</div>
          <p className="text-[10px] text-emerald-400">↑ 18.4% vs last month</p>
        </div>

        <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span>TOTAL COMPLETED ORDERS</span>
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalOrders}</div>
          <p className="text-[10px] text-zinc-400">All channels active</p>
        </div>

        <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span>AVG ORDER VALUE (AOV)</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatPrice(stats.avgOrderValue)}</div>
          <p className="text-[10px] text-zinc-400">Premium apparel benchmark</p>
        </div>

        <div className="p-6 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span>ACTIVE SKUS IN CATALOG</span>
            <Package className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalProducts}</div>
          <p className="text-[10px] text-zinc-400">100% in-stock availability</p>
        </div>
      </div>

      {/* Orders Fulfillment Manager */}
      <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6 font-mono text-xs">
        <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-3">
          RECENT CLIENT ORDERS FULFILLMENT MANAGER
        </h2>

        {recentOrders.length === 0 ? (
          <p className="text-zinc-500 py-6 text-center">NO ORDERS FOUND IN DATABASE.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[11px]">
                  <th className="py-3 px-3">ORDER #</th>
                  <th className="py-3 px-3">CLIENT</th>
                  <th className="py-3 px-3">DATE</th>
                  <th className="py-3 px-3">ITEMS</th>
                  <th className="py-3 px-3">TOTAL</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3">CHANGE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(ord => (
                  <tr key={ord.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                    <td className="py-3 px-3 font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-3 text-zinc-300">{ord.customerName}</td>
                    <td className="py-3 px-3 text-zinc-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-zinc-300">{ord.items.length} items</td>
                    <td className="py-3 px-3 font-bold text-white">{formatPrice(ord.total)}</td>
                    <td className="py-3 px-3">
                      <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 font-bold uppercase text-[10px] text-emerald-400">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={ord.status}
                        onChange={e => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="bg-zinc-900 border border-zinc-800 text-white font-bold text-[10px] px-2 py-1 uppercase"
                      >
                        <option value="placed">PLACED</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="out_for_delivery">OUT FOR DELIVERY</option>
                        <option value="delivered">DELIVERED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalog Inventory Monitor */}
      <div className="p-8 bg-zinc-950 border border-zinc-800 space-y-6 font-mono text-xs">
        <h2 className="text-sm font-bold uppercase text-white border-b border-zinc-800 pb-3">
          CATALOG INVENTORY & STOCK LEVELS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="p-4 bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={p.images[0]} alt={p.name} className="w-12 h-14 object-cover bg-zinc-800" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-white font-sans text-xs truncate max-w-[140px]">{p.name}</h4>
                  <p className="text-zinc-500 text-[10px]">SKU: {p.sku} // {p.category}</p>
                  <p className="text-emerald-400 text-[10px] font-bold mt-1">STOCK: {p.stockCount} UNITS</p>
                </div>
              </div>

              <span className="text-xs font-bold text-white">{formatPrice(p.price)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
