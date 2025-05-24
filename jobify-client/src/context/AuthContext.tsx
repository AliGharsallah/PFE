import React, { createContext, useState, useEffect, useContext } from 'react';

// Interface améliorée avec toutes les propriétés nécessaires
interface User {
  _id?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  role: 'candidate' | 'recruiter' | 'Admin' | 'admin' | null;
  isAuthenticated: boolean;
  companyInfo?: {
    companyName?: string;
    industry?: string;
    companySize?: string;
    companyLogo?: string;
    description?: string;
    website?: string;
    contactPhone?: string;
    jobTitle?: string;
    department?: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      zipCode?: string;
      country?: string;
    };
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  candidateInfo?: {
    skills?: string[];
    phone?: string;
    location?: string;
    resume?: string;
    education?: Array<{
      institution?: string;
      degree?: string;
      fieldOfStudy?: string;
      from?: Date;
      to?: Date;
    }>;
    experience?: Array<{
      title?: string;
      company?: string;
      from?: Date;
      to?: Date;
      description?: string;
    }>;
  };
}

interface AuthContextType {
  user: User;
  login: (token: string, role: string, userData?: any) => void;
  logout: () => void;
  updateUserInContext?: (updatedUserData: Partial<User>) => void;
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
    const role = localStorage.getItem('role') as 'candidate' | 'recruiter' | 'Admin' | 'admin' | null;
    const userDataStr = localStorage.getItem('userData');
    
    if (token && role) {
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUser({
            ...userData,
            role,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error parsing userData from localStorage:', error);
          setUser({
            role,
            isAuthenticated: true,
          });
        }
      } else {
        setUser({
          role,
          isAuthenticated: true,
        });
      }
    }
  }, []);

  const login = (token: string, role: string, userData?: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    
    const userState: User = {
      role: role as 'candidate' | 'recruiter' | 'Admin' | 'admin',
      isAuthenticated: true,
    };

    if (userData) {
      // Si userData est fourni, l'ajouter à l'état utilisateur
      Object.assign(userState, userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    setUser(userState);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    
    setUser({
      role: null,
      isAuthenticated: false,
    });
  };
  
  // Fonction pour mettre à jour les données de l'utilisateur dans le contexte
  const updateUserInContext = (updatedUserData: Partial<User>) => {
    setUser(prevUser => {
      const newUserState = { ...prevUser, ...updatedUserData };
      localStorage.setItem('userData', JSON.stringify(newUserState));
      return newUserState;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;