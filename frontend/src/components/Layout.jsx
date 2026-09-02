import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PinLoginModal from './PinLoginModal';

export default function Layout({ children }) {
  const location = useLocation();

  // Determine if this is a dedicated customer-facing or kiosk route
  const customerRoutes = ['/online-ordering', '/order', '/qr-ordering', '/order-tracking', '/kiosk'];
  const isCustomerPage = customerRoutes.some(route => location.pathname.startsWith(route));

  if (isCustomerPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#131313] text-[#e5e2e1]">
        <main className="flex-1 w-full bg-[#131313] relative">
          {children}
        </main>
        <PinLoginModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#131313] text-[#e5e2e1]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#131313] relative">
          {children}
        </main>
      </div>
      <PinLoginModal />
    </div>
  );
}
