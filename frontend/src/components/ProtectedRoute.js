import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Check for user data in the browser's local storage
  const user = localStorage.getItem('user');

  if (!user) {
    // If no user is found, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If a user is found, render the page they were trying to access
  return children;
}

export default ProtectedRoute;