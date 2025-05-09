import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import { type MessageType as AppMessageType } from './components/ChatMessage';

export interface AppMessage {
  id: string;
  text: string;
  type: AppMessageType;
}

export interface PromptSessionData {
  id: string; 
  user_id: string;
  title: string;
  messages: AppMessage[];
  created_at: string; 
}

interface AuthFormProps {
  authMode: 'login' | 'signup';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  authLoading: boolean;
  authError: string | null;
  handleLogin: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSignUp: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setAuthMode: (mode: 'login' | 'signup') => void;
  setAuthError: (error: string | null) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  authMode, email, setEmail, password, setPassword, authLoading, authError,
  handleLogin, handleSignUp, setAuthMode, setAuthError
}) => (
  <div className="w-100" style={{ maxWidth: '400px' }}>
    <div className="card bg-dark text-light shadow-lg">
      <div className="card-body p-4 p-md-5">
        <h2 className="card-title text-center h3 mb-4">
          {authMode === 'login' ? 'Welcome to Synapse' : 'Create Synapse Account'}
        </h2>
        {authError && <p className="text-center text-danger small mb-3">{authError}</p>}
        <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="needs-validation" noValidate>
          <div className="mb-3">
            <label htmlFor="email-auth" className="form-label small">Email address</label>
            <input id="email-auth" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-sm bg-secondary text-light border-secondary" />
          </div>
          <div className="mb-3">
            <label htmlFor="password-auth" className="form-label small">Password</label>
            <input id="password-auth" name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="form-control form-control-sm bg-secondary text-light border-secondary" />
          </div>
          <button type="submit" disabled={authLoading}
            className="btn btn-primary btn-sm w-100">
            {authLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : (authMode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <p className="small text-center mt-3 mb-0">
          {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }}
            className="btn btn-link btn-sm p-0 text-info">
            {authMode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  </div>
);

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionList, setSessionList] = useState<PromptSessionData[]>([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('bg-dark', 'text-light');
    return () => {
        document.documentElement.removeAttribute('data-bs-theme');
        document.body.classList.remove('bg-dark', 'text-light');
    }
  }, []);

  const fetchSessionList = useCallback(async (userId: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('prompt_sessions')
      .select('id, user_id, title, messages, created_at') 
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching session list from Supabase:', error.message);
    else if (data) setSessionList(data as PromptSessionData[]);
    else setSessionList([]); 
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) fetchSessionList(initialSession.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentAuthSession) => {
      setSession(currentAuthSession);
      setEmail(''); setPassword(''); setAuthError(null);
      if (event === 'SIGNED_IN' && currentAuthSession) {
        setMessages([]); setCurrentSessionId(null); fetchSessionList(currentAuthSession.user.id);
      }
      if (event === 'SIGNED_OUT') {
        setMessages([]); setCurrentSessionId(null); setSessionList([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchSessionList]); 

  const triggerConfetti = useCallback(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 10000 });
  }, []);

  const handleLogin = useCallback(async (event: React.FormEvent<HTMLFormElement>) => { /* ... */ event.preventDefault(); setAuthLoading(true); setAuthError(null); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setAuthError(error.message); setAuthLoading(false); }, [email, password]);
  const handleSignUp = useCallback(async (event: React.FormEvent<HTMLFormElement>) => { /* ... */ event.preventDefault(); setAuthLoading(true); setAuthError(null); const { error } = await supabase.auth.signUp({ email, password }); if (error) setAuthError(error.message); else { setAuthError("Signup successful! Please check your email for verification."); setAuthMode('login');} setAuthLoading(false); }, [email, password]);
  const handleLogout = useCallback(async () => { /* ... */ setAuthLoading(true); await supabase.auth.signOut(); setAuthLoading(false); }, []);
  const handleNewPromptSession = useCallback(() => { /* ... */ setMessages([]); setPromptInput(''); setCurrentSessionId(null); setIsSidebarOpen(false); }, []);
  const handleDeleteSession = useCallback(async (sessionIdToDelete: string) => { /* ... */ if (!session?.user) return; const { error } = await supabase.from('prompt_sessions').delete().eq('id', sessionIdToDelete).eq('user_id', session.user.id); if (error) console.error('Error deleting session:', error.message); else { setSessionList(prevList => prevList.filter(s => s.id !== sessionIdToDelete)); if (currentSessionId === sessionIdToDelete) { setMessages([]); setCurrentSessionId(null); } } }, [session, currentSessionId]);
  const handleLoadSession = useCallback((sessionIdToLoad: string) => { /* ... */ const selectedSession = sessionList.find(s => s.id === sessionIdToLoad); if (selectedSession) { setMessages(selectedSession.messages || []); setCurrentSessionId(selectedSession.id); setPromptInput(''); setIsSidebarOpen(false); } else { console.error("Session not found in list:", sessionIdToLoad); } }, [sessionList]);

  const saveOrUpdateSession = async (sessionId: string | null, newMessages: AppMessage[], title?: string): Promise<string | null> => { /* ... */ if (!session?.user) return null; const sessionDataToSave: Omit<PromptSessionData, 'id' | 'created_at'> & { id?: string } = { user_id: session.user.id, messages: newMessages, title: title || (newMessages[0]?.text?.substring(0,50)) || 'New Prompt', }; if (sessionId) { const { data, error } = await supabase.from('prompt_sessions').update({ messages: newMessages }).eq('id', sessionId).eq('user_id', session.user.id).select('id').single(); if (error) console.error('Error updating session:', error.message); return data ? data.id : null; } else { const { data, error } = await supabase.from('prompt_sessions').insert(sessionDataToSave).select('id').single(); if (error) console.error('Error creating session:', error.message); else if (data) { setCurrentSessionId(data.id); if (session?.user) fetchSessionList(session.user.id); } return data ? data.id : null; } };

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || !session?.user) return;
    const newUserMessage: AppMessage = { id: Date.now().toString() + '_user', text: inputText, type: 'userInput' };
    const currentLocalMessages = messages; 
    const updatedMessages = [...currentLocalMessages, newUserMessage];
    setMessages(updatedMessages);
    setPromptLoading(true); setPromptInput('');
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await saveOrUpdateSession(null, updatedMessages, inputText.substring(0, 50) || 'New Prompt');
    } else {
      await saveOrUpdateSession(activeSessionId, updatedMessages);
    }
    if (!activeSessionId) {
        console.error("Failed to create/identify session ID for user message.");
        setMessages(currentLocalMessages); setPromptLoading(false);
        setMessages(prev => [...prev, {id: Date.now().toString(), text: "Error: Could not save message. Try new chat.", type: 'error'}]);
        return;
    }
    try {
      const historyForAPI = updatedMessages.slice(0, -1).map(msg => ({ text: msg.text, type: msg.type }));
      const apiUrl = 'https://synapse-ai-backend-il8z.onrender.com/api/generate-prompt';
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputText: newUserMessage.text, history: historyForAPI }) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || `HTTP error! status: ${response.status}`); }
      const data = await response.json();
      const newAiMessage: AppMessage = { id: Date.now().toString() + '_ai', text: data.prompt, type: 'aiPrompt' };
      const finalMessages = [...updatedMessages, newAiMessage];
      setMessages(finalMessages);
      await saveOrUpdateSession(activeSessionId, finalMessages);
      triggerConfetti();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      const newErrorMessage: AppMessage = { id: Date.now().toString() + '_error', text: `Oops! Something went wrong: ${message}`, type: 'error' };
      setMessages([...updatedMessages, newErrorMessage]);
      await saveOrUpdateSession(activeSessionId, [...updatedMessages, newErrorMessage]);
      console.error("Failed to generate prompt:", err);
    } finally {
      setPromptLoading(false);
    }
  }, [session, messages, currentSessionId, triggerConfetti, fetchSessionList]); 

  if (!session) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
        <AuthForm {...{authMode, email, setEmail, password, setPassword, authLoading, authError, handleLogin, handleSignUp, setAuthMode, setAuthError}} />
      </div>
    );
  }

  return (
    <div className="d-flex vh-100"> {/* Main flex container for sidebar and content */}
      {/* Sidebar: Hidden on xs/sm, visible and static on md+ OR slides in on xs/sm if isSidebarOpen */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''} d-none d-md-flex`}>
        <Sidebar
          userEmail={session.user?.email || 'User'}
          onLogout={handleLogout}
          onNewSession={handleNewPromptSession}
          authLoading={authLoading}
          sessionList={sessionList}
          onLoadSession={handleLoadSession}
          onDeleteSession={handleDeleteSession} 
          currentSessionId={currentSessionId}
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>
      
      {/* Main content area */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden position-relative"> {/* Added position-relative for hamburger */}
        {/* Hamburger Menu Button (Visible only on small screens) */}
        <button 
          className="btn btn-dark d-md-none position-absolute top-0 start-0 m-2"
          style={{zIndex: 1051}} // Ensure it's above sidebar if sidebar is also fixed/absolute
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>

        <header className="py-2 px-3 border-bottom d-flex justify-content-center justify-content-md-between align-items-center bg-dark text-light"> {/* Centered on mobile, space-between on md+ */}
          <span className="d-md-none me-auto"></span> {/* Invisible spacer to help center title on mobile when hamburger is present */}
          <h1 className="h5 mb-0">Synapse</h1>
          <span className="d-md-none ms-auto"></span> {/* Invisible spacer */}
        </header>
        <ChatArea messages={messages} />
        <InputBar
          inputValue={promptInput}
          onInputChange={setPromptInput}
          onSubmit={() => handleSendMessage(promptInput)}
          isLoading={promptLoading}
        />
        {/* New Footer */}
        <footer className="p-2 text-center text-muted small border-top">
          Developed by Sameer Imtiaz | 
          <a href="https://github.com/sameer-dev-stack" target="_blank" rel="noopener noreferrer" className="ms-1 text-info">
            {/* Simple GitHub Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16" style={{verticalAlign: '-.125em'}}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg> GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
