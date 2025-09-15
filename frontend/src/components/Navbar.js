import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
// import logo from '../assets/logo.png'; 

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* <img src={logo} alt="Green Waves Logo" style={{ height: '40px', marginRight: '10px' }} /> */}
        
        {/* --- THIS IS THE FOOLPROOF FIX FOR THE UNRESPONSIVE LINK --- */}
        {/* We wrap the Typography inside the link instead of converting it. */}
        <RouterLink to="/landing" style={{ color: 'inherit', textDecoration: 'none' }}>
          <Typography variant="h6">
            Green Waves
          </Typography>
        </RouterLink>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {user ? (
          <>
            <Button component={RouterLink} to="/" color="inherit">My Farms</Button>
            <Button component={RouterLink} to="/trends" color="inherit">Commodity Trends</Button>
            
            <IconButton size="large" onClick={handleMenu} color="inherit" sx={{ ml: 2 }}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem disabled>{user.name}</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button component={RouterLink} to="/login" color="inherit">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;