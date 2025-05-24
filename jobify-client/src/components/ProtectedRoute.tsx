import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Props {
  children: React.ReactElement;
  requiredRole?: 'candidate' | 'recruiter'|'Admin';
}

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token and role
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // If a specific role is required, check if the user has it
    if (requiredRole && userRole !== requiredRole) {
      toast.error(`This page is only accessible to ${requiredRole}s`);
      setIsAuthenticated(false);
      
      // Redirect to the appropriate dashboard based on role
      if (userRole === 'candidate') {
        navigate('/Condidates');
      } else if (userRole === 'recruiter') {
        navigate('/recruiters');
      }
      else if (userRole === 'Admin') {
        navigate('/admin/dashboard');
      }
      else {
        navigate('/auth');
      }
      return; 
    }

    setIsAuthenticated(true);
  }, [requiredRole, navigate]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;