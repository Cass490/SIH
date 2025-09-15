import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Import Layout and Pages
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FarmHubPage from './pages/FarmHubPage';
import AddFarmPage from './pages/AddFarmPage';
import LoginPage from './pages/LoginPage';
import CommodityPage from './pages/CommodityPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage'; // <-- THE MISSING IMPORT
import CommodityTrendsPage from './pages/CommodityTrendsPage'; 

function App() {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* --- Protected Routes (wrapped in Layout) --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard is the INDEX route for "/" */}
          <Route index element={<DashboardPage />} /> 
          
          {/* All other pages inside the main layout */}
          <Route path="landing" element={<LandingPage />} />
          <Route path="farm/:farmId" element={<FarmHubPage />} />
          <Route path="add-farm" element={<AddFarmPage />} />
          <Route path="commodity-prices" element={<CommodityPage />} />
          <Route path="market-trends" element={<CommodityTrendsPage />} />
        </Route>

        {/* --- Fallback Redirect --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
     </ThemeProvider>
  );
}

export default App;