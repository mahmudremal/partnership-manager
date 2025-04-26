import React, { useState, useEffect, createContext, useContext } from 'react';

const SessionContext = createContext();

export default function SessionProvider({ children, initial = {} }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('app-session');
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem('app-session', JSON.stringify(session));
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
