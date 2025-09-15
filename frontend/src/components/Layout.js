import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Container } from '@mui/material';

function Layout() {
  return (
    <div>
      <Navbar />
      <Container component="main" sx={{ mt: 2, mb: 2 }}>
        {/* The Outlet component renders the current page based on the route */}
        <Outlet />
      </Container>
    </div>
  );
}

export default Layout;