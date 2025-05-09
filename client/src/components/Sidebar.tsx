import React from 'react';
import { motion } from 'framer-motion';
import type { PromptSessionData } from '../App';

interface SidebarProps {
  userEmail: string;
  onLogout: () => Promise<void>;
  onNewSession: () => void;
  authLoading: boolean;
  sessionList: PromptSessionData[];
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
  currentSessionId: string | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userEmail,
  onLogout,
  onNewSession,
  authLoading,
  sessionList,
  onLoadSession,
  onDeleteSession,
  currentSessionId,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const handleSidebarItemClick = () => {
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteClick = (sessionId: string, sessionTitle: string) => {
    if (window.confirm(`Are you sure you want to delete session: "${sessionTitle || 'Untitled Session'}"?`)) {
      onDeleteSession(sessionId).then(() => {
        // Optional: Add any post-delete UI updates here if needed,
        // though App.tsx handles main state updates.
      });
    }
  };

  // Base classes for sidebar
  const sidebarBaseClasses = "d-flex flex-column flex-shrink-0 p-3 text-bg-dark vh-100";
  // Classes for mobile: fixed position, off-screen by default, slide in when open
  const mobileSidebarClasses = `position-fixed top-0 start-0 shadow-lg ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`;
  // Classes for desktop: static position
  const desktopSidebarClasses = "position-md-static";
  // Transition class
  const transitionClasses = "transition-transform duration-300 ease-in-out";
  
  // Custom style for transform needed because Bootstrap 5 doesn't have -translate-x-full utility
  const mobileTransformStyle = !isSidebarOpen ? { transform: 'translateX(-100%)' } : {transform: 'translateX(0)'};


  return (
    <div
      className={`${sidebarBaseClasses} ${desktopSidebarClasses} ${isSidebarOpen ? '' : 'd-none'} d-md-flex`} // d-md-flex ensures it's part of flex on desktop
      style={{ width: '280px', zIndex: 1045, ...mobileTransformStyle }} // zIndex to be above content if overlaying
      // For mobile, we'll use a different approach for visibility via App.tsx state
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <a href="/" className="d-flex align-items-center text-white text-decoration-none">
          <span className="fs-5">Synapse</span>
        </a>
        <button className="btn btn-sm btn-outline-light d-md-none" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
          {/* Close Icon (X) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 0 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
      <hr className="mt-0" />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-1">
          <motion.button
            onClick={() => { onNewSession(); handleSidebarItemClick(); }}
            className="nav-link text-white w-100 text-start d-flex align-items-center"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>
            New Chat
          </motion.button>
        </li>
        
        <div className="mt-2 flex-grow-1 overflow-auto pe-2" style={{maxHeight: 'calc(100vh - 280px)'}}> {/* Adjusted maxHeight */}
          {sessionList.length > 0 && <li className="nav-item small text-muted mb-1 ps-2">History</li>}
          {sessionList.map((session) => (
            <li key={session.id} className="nav-item d-flex justify-content-between align-items-center">
              <button
                onClick={() => { onLoadSession(session.id); handleSidebarItemClick(); }}
                className={`nav-link flex-grow-1 text-start text-truncate py-1 ${session.id === currentSessionId ? 'active text-dark fw-bold' : 'text-white'}`}
                title={session.title}
                style={{ marginRight: '0.25rem' }}
              >
                {session.title || 'Untitled Session'}
              </button>
              <button 
                onClick={() => handleDeleteClick(session.id, session.title)}
                className="btn btn-sm text-muted p-1"
                title="Delete session"
                style={{ lineHeight: 1 }} 
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                </svg>
              </button>
            </li>
          ))}
        </div>
      </ul>
      <div className="pt-2 border-top border-secondary"> 
        <p className="small text-muted text-center mb-1">Developed by Sameer Imtiaz</p>
        <div className="dropdown">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <strong className="text-truncate" style={{maxWidth: '180px'}}>{userEmail}</strong>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
            <li>
              <button className="dropdown-item" onClick={onLogout} disabled={authLoading}>
                {authLoading ? 'Logging out...' : 'Sign out'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
