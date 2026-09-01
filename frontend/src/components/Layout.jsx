import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PinLoginModal from './PinLoginModal';

export default function Layout({ children }) {
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
