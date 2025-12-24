
import React from 'react';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, setScreen, title }) => {
  const navItems = [
    { id: AppScreen.HOME, icon: 'fa-home', label: 'Home' },
    { id: AppScreen.AI_TEACHER, icon: 'fa-robot', label: 'AI Guru' },
    { id: AppScreen.PHOTO_SEARCH, icon: 'fa-camera', label: 'Scan' },
    { id: AppScreen.QUIZ, icon: 'fa-clipboard-list', label: 'Quiz' },
    { id: AppScreen.PROFILE, icon: 'fa-user', label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden max-w-md mx-auto shadow-2xl relative border-x">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg z-20">
        <div className="flex items-center gap-2">
          {activeScreen !== AppScreen.HOME && (
            <button onClick={() => setScreen(AppScreen.HOME)} className="p-1">
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight">
            {activeScreen === AppScreen.HOME ? 'SEARCH EARTH' : title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white hover:bg-blue-700 p-2 rounded-full transition">
            <i className="fa-solid fa-bell"></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around py-3 px-2 shadow-2xl z-30">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === item.id ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            {activeScreen === item.id && (
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
