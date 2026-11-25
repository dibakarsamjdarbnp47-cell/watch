import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { MemberDashboard } from './components/MemberDashboard.js';
import { RecognitionTable } from './components/RecognitionTable.js';
import { BinaryTreeVisualizer } from './components/BinaryTreeVisualizer.js';
import { WatchVideoEarning } from './components/WatchVideoEarning.js';
import { WalletManagement } from './components/WalletManagement.js';
import { OnlineJoiningForm } from './components/OnlineJoiningForm.js';
import { KycManagement } from './components/KycManagement.js';
import { PromotionsSafeguard } from './components/PromotionsSafeguard.js';
import { RepurchaseStore } from './components/RepurchaseStore.js';
import { AdminPanel } from './components/AdminPanel.js';
import { AiAdvisorModal } from './components/AiAdvisorModal.js';
import { CorporateWebsite } from './components/CorporateWebsite.js';
import { BusinessBrochure } from './components/BusinessBrochure.js';
import { AccountManagement } from './components/AccountManagement.js';
import { AllNetworkDirectory } from './components/AllNetworkDirectory.js';
import { LoginPage } from './components/LoginPage.js';
import { ProductStoreHub } from './components/ecommerce/ProductStoreHub.js';
import { BpWalletSection } from './components/ecommerce/BpWalletSection.js';
import { Sparkles, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('website');
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-amber-400">
          Loading Watch Video, Dream in Hand MLM ERP...
        </p>
      </div>
    );
  }

  // If viewing the full public corporate website
  if (currentView === 'website') {
    return (
      <>
        <CorporateWebsite
          onNavigateToERP={(view) => setCurrentView(view || 'dashboard')}
          onNavigateToBrochure={() => setCurrentView('brochure')}
          onNavigateToJoin={() => setCurrentView('joining-form')}
          onOpenAiCoach={() => setIsAiOpen(true)}
        />
        {/* Floating AI Growth Coach Trigger */}
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-full shadow-2xl shadow-indigo-500/40 border border-indigo-400/40 transition hover:scale-105"
          title="Open AI MLM Growth Coach"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">Ask AI Growth Coach</span>
        </button>
        <AiAdvisorModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </>
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'brochure':
        return (
          <BusinessBrochure
            onNavigateToJoin={() => setCurrentView('joining-form')}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
          />
        );
      case 'dashboard':
        return <MemberDashboard onNavigate={setCurrentView} onOpenAi={() => setIsAiOpen(true)} />;
      case 'account':
        return (
          <AccountManagement
            onNavigateToNetwork={() => setCurrentView('network')}
            onNavigateToAllNetwork={() => setCurrentView('all-network')}
          />
        );
      case 'network':
      case 'binary-tree':
        return (
          <BinaryTreeVisualizer
            onNavigateToAllNetwork={() => setCurrentView('all-network')}
            onNavigateToAccount={() => setCurrentView('account')}
          />
        );
      case 'all-network':
        return (
          <AllNetworkDirectory
            onNavigateToTree={() => setCurrentView('network')}
            onNavigateToAccount={() => setCurrentView('account')}
          />
        );
      case 'product':
        return (
          <ProductStoreHub
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToDashboard={() => setCurrentView('bp-wallet')}
          />
        );
      case 'bp-wallet':
        return <BpWalletSection onNavigateToProducts={() => setCurrentView('product')} />;
      case 'recognition':
        return <RecognitionTable />;
      case 'video-tasks':
        return <WatchVideoEarning />;
      case 'wallet':
        return <WalletManagement />;
      case 'joining-form':
        return <OnlineJoiningForm onSuccess={() => setCurrentView('dashboard')} />;
      case 'kyc':
        return <KycManagement />;
      case 'promotions-safeguard':
        return <PromotionsSafeguard />;
      case 'repurchase-store':
        return <RepurchaseStore />;
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={() => setCurrentView('dashboard')}
            onNavigate={setCurrentView}
          />
        );
      case 'admin':
        return <AdminPanel />;
      default:
        return <MemberDashboard onNavigate={setCurrentView} onOpenAi={() => setIsAiOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Navbar
        onNavigate={setCurrentView}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenLogin={() => setCurrentView('login')}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenAi={() => setIsAiOpen(true)}
        />

        {/* Dynamic Center Stage Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating AI Growth Coach Trigger on mobile / desktop */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-full shadow-2xl shadow-indigo-500/40 border border-indigo-400/40 transition hover:scale-105"
        title="Open AI MLM Growth Coach"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span className="hidden sm:inline">Ask AI Growth Coach</span>
      </button>

      {/* AI Advisor Modal Dialog */}
      <AiAdvisorModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
