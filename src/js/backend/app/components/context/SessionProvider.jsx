import React, { useState, useEffect, createContext, useContext } from 'react';
import request from '@common/request';
const SessionContext = createContext();

export default function SessionProvider({ children, initial = {} }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('app-session');
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-session', JSON.stringify(session));
      if (session?.authToken) {
        request.set('Authorization', session?.authToken);
      }
    } catch (error) {
      console.error(error);
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
