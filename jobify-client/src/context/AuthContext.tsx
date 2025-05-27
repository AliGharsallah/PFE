import React, { createContext, useState, useEffect, useContext } from 'react';

// Interface améliorée avec toutes les propriétés nécessaires
interface User {
  _id?: string;
  id?: string; // Ajouté pour correspondre à votre backend
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
  refreshUserData?: () => Promise<void>;
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

  // Fonction pour récupérer les données utilisateur depuis l'API
  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data from API:', data.user);
        return data.user;
      } else {
        console.error('Failed to fetch user profile');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Fonction pour actualiser les données utilisateur
  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = await fetchUserProfile(token);
      if (userData) {
        const updatedUser: User = {
          ...userData,
          isAuthenticated: true,
        };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    }
  };

  useEffect(() => {
    // Check if user is logged in on initial load
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role') as 'candidate' | 'recruiter' | 'Admin' | 'admin' | null;
      const userDataStr = localStorage.getItem('userData');
     
      if (token && role) {
        // Essayer de charger depuis localStorage d'abord
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            console.log('Loaded user data from localStorage:', userData);
            setUser({
              ...userData,
              role,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Error parsing userData from localStorage:', error);
          }
        }
        
        // Puis récupérer les données fraîches depuis l'API
        const freshUserData = await fetchUserProfile(token);
        if (freshUserData) {
          const updatedUser: User = {
            ...freshUserData,
            isAuthenticated: true,
          };
          console.log('Fresh user data from API:', updatedUser);
          setUser(updatedUser);
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        } else {
          // Si impossible de récupérer les données, garder les données locales ou déconnecter
          if (!userDataStr) {
            setUser({
              role,
              isAuthenticated: true,
            });
          }
        }
      }
    };

    initAuth();
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
      console.log('Login with userData:', userState);
    }
   
    setUser(userState);
    
    // Récupérer les données fraîches après login
    setTimeout(() => refreshUserData(), 100);
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
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUserInContext, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;