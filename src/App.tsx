import React from 'react';
import { AppShell } from './components/AppShell';
import { QueueCastProvider, useQueueCast } from './context/QueueCastContext';
import { AlertsView } from './views/AlertsView';
import { CanteenDetailView } from './views/CanteenDetailView';
import { CanteensView } from './views/CanteensView';
import { DashboardView } from './views/DashboardView';
import { HelpChatbotView } from './views/HelpChatbotView';
import { HomeView } from './views/HomeView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { StaffPanelView } from './views/StaffPanelView';
import { SubscriptionView } from './views/SubscriptionView';
import { WelcomeView } from './views/WelcomeView';

const QueueCastRouter: React.FC = () => {
  const { currentUser, activeTab } = useQueueCast();

  if (!currentUser) {
    return <WelcomeView />;
  }

  const role = currentUser.role;

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'canteens':
        return <CanteensView />;
      case 'canteen-detail':
        return <CanteenDetailView />;
      case 'staff':
        return role === 'staff' || role === 'admin' ? (
          <StaffPanelView />
        ) : (
          <CanteensView />
        );
      case 'dashboard':
        return role === 'admin' ? <DashboardView /> : <HomeView />;
      case 'reports':
        return role === 'admin' ? <ReportsView /> : <HomeView />;
      case 'alerts':
        return <AlertsView />;
      case 'subscription':
        return <SubscriptionView />;
      case 'help':
        return <HelpChatbotView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
};

export default function App() {
  return (
    <QueueCastProvider>
      <QueueCastRouter />
    </QueueCastProvider>
  );
}
