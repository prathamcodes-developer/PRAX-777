import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { ToastContainer } from './components/ToastContainer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { LookbookPage } from './pages/LookbookPage';
import { AdminPage } from './pages/AdminPage';
import { Product, Order } from './types';

function MainLayout() {
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pageParams, setPageParams] = useState<any>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleNavigate = (page: string, params?: any) => {
    setActivePage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (order: Order) => {
    setCompletedOrder(order);
    setActivePage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-[#f2f2f2] flex flex-col font-sans selection:bg-white selection:text-black">
      <Header activePage={activePage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />
        )}

        {activePage === 'shop' && (
          <ShopPage
            initialCategory={pageParams?.category}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />
        )}

        {activePage === 'wishlist' && (
          <WishlistPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderCompleted}
          />
        )}

        {activePage === 'order-confirmation' && (
          <OrderConfirmationPage
            order={completedOrder}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'tracking' && (
          <OrderTrackingPage onNavigate={handleNavigate} />
        )}

        {activePage === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}

        {activePage === 'lookbook' && (
          <LookbookPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'admin' && (
          <AdminPage onNavigate={handleNavigate} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Global Modals & Drawers */}
      <CartDrawer onNavigate={handleNavigate} />
      <SearchModal onSelectProduct={handleSelectProduct} />
      <AuthModal />
      <QuickViewModal
        onSelectProduct={handleSelectProduct}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

