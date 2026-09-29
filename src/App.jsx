import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmailRequests from './pages/EmailRequests.jsx';
import DocumentProgress from './pages/DocumentProgress.jsx';
import { useRequests } from './store.js';
import Laser from './pages/Laser.jsx';
import Placeholder from './pages/Placeholder.jsx';
import { menuGroups } from './data.js';

const titles = Object.fromEntries(menuGroups.flatMap((g) => g.items).map((i) => [i.id, i.label]));

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebar, setSidebar] = useState(true);
  const [dark, setDark] = useState(false);
  const { requests, setApproval, moveToApproval } = useRequests();
  const [loggedOut, setLoggedOut] = useState(false);

  if (loggedOut) {
    return (
      <div className="logged-out">
        <h2>You have been logged out</h2>
        <button className="pill" onClick={() => setLoggedOut(false)}>Log in again</button>
      </div>
    );
  }

  // sidebar highlight: invoice sub-pages keep "Invoice" title but no item highlight
  return (
    <div className={`app ${dark ? 'dark' : ''}`}>
      <Sidebar active={page} onNavigate={setPage} open={sidebar} />
      <div className="main">
        <Header
          onToggleSidebar={() => setSidebar((s) => !s)}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
          onLogout={() => setLoggedOut(true)}
        />
        <main className="content">
          {page === 'dashboard' ? (
            <Dashboard onNavigate={setPage} />
          ) : page === 'email-requests' ? (
            <EmailRequests rows={requests} setApproval={setApproval} />
          ) : page === 'document-progress' ? (
            <DocumentProgress rows={requests} moveToApproval={moveToApproval} />
          ) : page === 'laser' ? (
            <Laser />
          ) : (
            <Placeholder title={titles[page] || page} />
          )}
        </main>
      </div>
    </div>
  );
}
