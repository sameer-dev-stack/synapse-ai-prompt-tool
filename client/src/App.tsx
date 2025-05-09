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

  useEffect(() => {
    console.log("sessionList updated:", sessionList);
  }, [sessionList]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('bg-dark', 'text-light');
    return () => {
        document.documentElement.removeAttribute('data-bs-theme');
        document.body.classList.remove('bg-dark', 'text-light');
    }
  }, []);

  const fetchSessionList = useCallback(async (userId: string) => {
    console.log('Fetching session list for user ID:', userId); 
    if (!userId) {
      console.log('fetchSessionList: No userId provided, returning.');
      return;
    }
    const { data, error } = await supabase
      .from('prompt_sessions')
      .select('id, user_id, title, messages, created_at') 
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching session list from Supabase:', error.message);
    } else if (data) {
      console.log('Fetched session list data:', data);
      setSessionList(data as PromptSessionData[]);
    } else {
      console.log('No data returned for session list, setting to empty array.');
      setSessionList([]); 
    }
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
        setMessages([]);
        setCurrentSessionId(null);
        fetchSessionList(currentAuthSession.user.id);
      }
      if (event === 'SIGNED_OUT') {
        setMessages([]);
        setCurrentSessionId(null);
        setSessionList([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchSessionList]); 

  const triggerConfetti = useCallback(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 10000 });
  }, []);

  const handleLogin = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true); setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }, [email, password]);

  const handleSignUp = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true); setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError("Signup successful! Please check your email for verification.");
      setAuthMode('login');
    }
    setAuthLoading(false);
  }, [email, password]);

  const handleLogout = useCallback(async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setAuthLoading(false);
  }, []);

  const handleNewPromptSession = useCallback(() => {
    setMessages([]);
    setPromptInput('');
    setCurrentSessionId(null); 
  }, []);

  const handleDeleteSession = useCallback(async (sessionIdToDelete: string) => {
    if (!session?.user) return;
    console.log("[handleDeleteSession] Attempting to delete session ID:", sessionIdToDelete);
    const { error } = await supabase
      .from('prompt_sessions')
      .delete()
      .eq('id', sessionIdToDelete)
      .eq('user_id', session.user.id); 

    if (error) {
      console.error('Error deleting session:', error.message);
    } else {
      console.log('Session deleted successfully:', sessionIdToDelete);
      setSessionList(prevList => prevList.filter(s => s.id !== sessionIdToDelete));
      if (currentSessionId === sessionIdToDelete) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    }
  }, [session, currentSessionId]);

  const handleLoadSession = useCallback((sessionIdToLoad: string) => {
    console.log("[handleLoadSession] Attempting to load session ID:", sessionIdToLoad);
    const selectedSession = sessionList.find(s => s.id === sessionIdToLoad);
    if (selectedSession) {
      console.log("[handleLoadSession] Found session data in list:", selectedSession);
      const messagesToLoad = Array.isArray(selectedSession.messages) ? selectedSession.messages : [];
      console.log("[handleLoadSession] Messages to load:", messagesToLoad);
      setMessages(messagesToLoad);
      setCurrentSessionId(selectedSession.id);
      setPromptInput('');
    } else {
      console.error("[handleLoadSession] Session not found in list:", sessionIdToLoad);
    }
  }, [sessionList]);

  const saveOrUpdateSession = async (sessionId: string | null, newMessages: AppMessage[], title?: string): Promise<string | null> => {
    if (!session?.user) return null;

    const sessionDataToSave: Omit<PromptSessionData, 'id' | 'created_at'> & { id?: string } = {
        user_id: session.user.id,
        messages: newMessages,
        title: '', 
    };
    
    const firstMessageText = newMessages[0]?.text;
    sessionDataToSave.title = title || (firstMessageText ? firstMessageText.substring(0, 50) : 'New Prompt');


    if (sessionId) {
      const { data, error } = await supabase
        .from('prompt_sessions')
        .update({ messages: newMessages })
        .eq('id', sessionId)
        .eq('user_id', session.user.id)
        .select('id') 
        .single();
      if (error) console.error('Error updating session:', error.message);
      return data ? data.id : null;
    } else {
      const { data, error } = await supabase
        .from('prompt_sessions')
        .insert(sessionDataToSave)
        .select('id') 
        .single();
      if (error) console.error('Error creating session:', error.message);
      else if (data) {
        setCurrentSessionId(data.id);
        if (session?.user) fetchSessionList(session.user.id);
      }
      return data ? data.id : null;
    }
  };

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || !session?.user) return;

    const newUserMessage: AppMessage = { id: Date.now().toString() + '_user', text: inputText, type: 'userInput' };
    const currentLocalMessages = messages; 
    const updatedMessages = [...currentLocalMessages, newUserMessage];
    setMessages(updatedMessages);
    
    setPromptLoading(true);
    setPromptInput('');

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      const sessionTitle = inputText.substring(0, 50) || 'New Prompt';
      activeSessionId = await saveOrUpdateSession(null, updatedMessages, sessionTitle);
    } else {
      await saveOrUpdateSession(activeSessionId, updatedMessages);
    }

    if (!activeSessionId) {
        console.error("Failed to create or identify a session ID for user message.");
        setMessages(currentLocalMessages); 
        setPromptLoading(false);
        const errMessage: AppMessage = {id: Date.now().toString(), text: "Error: Could not save your message. Please try starting a new chat.", type: 'error'};
        setMessages(prev => [...prev, errMessage]);
        return;
    }
    
    try {
      const historyForAPI = updatedMessages.slice(0, -1).map(msg => ({
        text: msg.text,
        type: msg.type, 
      }));

      const response = await fetch('http://localhost:3001/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: newUserMessage.text, history: historyForAPI }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newAiMessage: AppMessage = { id: Date.now().toString() + '_ai', text: data.prompt, type: 'aiPrompt' };
      const finalMessages = [...updatedMessages, newAiMessage];
      setMessages(finalMessages);
      
      await saveOrUpdateSession(activeSessionId, finalMessages);
      triggerConfetti();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      const newErrorMessage: AppMessage = { id: Date.now().toString() + '_error', text: `Oops! Something went wrong: ${message}`, type: 'error' };
      const errorMessages = [...updatedMessages, newErrorMessage];
      setMessages(errorMessages);
      await saveOrUpdateSession(activeSessionId, errorMessages);
      console.error("Failed to generate prompt:", err);
    } finally {
      setPromptLoading(false);
    }
  }, [session, messages, currentSessionId, triggerConfetti, fetchSessionList]); 

  if (!session) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
        <AuthForm
          authMode={authMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword}
          authLoading={authLoading} authError={authError} handleLogin={handleLogin} handleSignUp={handleSignUp}
          setAuthMode={setAuthMode} setAuthError={setAuthError}
        />
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar
        userEmail={session.user?.email || 'User'}
        onLogout={handleLogout}
        onNewSession={handleNewPromptSession}
        authLoading={authLoading}
        sessionList={sessionList}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession} 
        currentSessionId={currentSessionId}
      />
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="py-2 px-3 border-bottom d-flex justify-content-between align-items-center bg-dark text-light">
          <h1 className="h5 mb-0">Synapse</h1> {/* Updated App Name */}
        </header>
        <ChatArea messages={messages} />
        <InputBar
          inputValue={promptInput}
          onInputChange={setPromptInput}
          onSubmit={() => handleSendMessage(promptInput)}
          isLoading={promptLoading}
        />
      </div>
    </div>
  );
}

export default App;
