import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  role: 'candidate' | 'recruiter' | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const defaultState: AuthContextType = {
  user: { role: null, isAuthenticated: false },
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultState);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    role: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'candidate' | 'recruiter' | null;
    
    if (token && role) {
      setUser({
        role,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    
    setUser({
      role: role as 'candidate' | 'recruiter',
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    setUser({
      role: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;