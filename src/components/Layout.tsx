import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SettingsDialog from './SettingsDialog';
import { useTranslation } from '../hooks/useTranslation';

export default function Layout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}