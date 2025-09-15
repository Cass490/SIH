import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Container, Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { geocodeAddress, saveFarm } from '../services/api';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * A helper component that handles map clicks and keeps the marker position updated.
 */
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      // e.latlng is an object: { lat: ..., lng: ... }
      setPosition(e.latlng); 
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

function AddFarmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data state
  const [address, setAddress] = useState({ village: '', district: '', pincode: '' });
  const [farmName, setFarmName] = useState('');
  const [soilData, setSoilData] = useState({ N: '', P: '', K: '', ph: '' });
  
  // Map state
  const [mapCenter, setMapCenter] = useState(null); // The center of the map view, expects an array [lat, lng]
  const [finalPosition, setFinalPosition] = useState(null); // The marker's position, we will consistently use an object {lat, lng}

  const handleGeocode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const coords = await geocodeAddress(address);
    setIsLoading(false);

    if (coords && !coords.error) {
      // --- THIS IS THE KEY FIX ---
      // We set the map's center with an array, which it requires.
      setMapCenter([coords.latitude, coords.longitude]);
      // We set our final position state with an object, which is what the map click event provides.
      // This makes our state consistent.
      setFinalPosition({ lat: coords.latitude, lng: coords.longitude });
      
      setFormStep(2);
    } else {
      setError(coords.error || "Could not find this location. Please check the details.");
    }
  };
  
  const handleSaveFarm = async (e) => {
    e.preventDefault();
    // This is a more robust check to ensure the position object and its properties exist.
    if (!finalPosition || finalPosition.lat === null || finalPosition.lng === null) {
      setError("Please tap on the map to select your exact farm location.");
      return;
    }
    
    const farmData = {
      farm_name: farmName,
      user_id: "test_user_happy_path", // This will be replaced by a real user ID after login
      location: { 
          type: "Point", 
          // This code now works reliably because `finalPosition` is always an object with .lng and .lat
          coordinates: [finalPosition.lng, finalPosition.lat] 
      },
      soil_properties: {
        N: Number(soilData.N) || 0,
        P: Number(soilData.P) || 0,
        K: Number(soilData.K) || 0,
        ph: Number(soilData.ph) || 0
      }
    };

    setIsLoading(true);
    const result = await saveFarm(farmData);
    setIsLoading(false);
    
    if (result && !result.error) {
        alert("Farm saved successfully!");
        navigate('/'); // Go back to the dashboard to see the new farm
    } else {
        setError(result.error || "An error occurred while saving the farm.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Add New Farm</Typography>
      
      {formStep === 1 && (
        <Box component="form" onSubmit={handleGeocode} noValidate sx={{ mt: 1 }}>
          <Typography variant="h6">Step 1: Find Your Area</Typography>
          <TextField margin="normal" required fullWidth label="Village/Town Name" name="village" value={address.village} onChange={(e) => setAddress({...address, village: e.target.value})} />
          <TextField margin="normal" required fullWidth label="District" name="district" value={address.district} onChange={(e) => setAddress({...address, district: e.target.value})} />
          <TextField margin="normal" required fullWidth label="Pincode" name="pincode" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Find My Area'}
          </Button>
        </Box>
      )}

      {formStep === 2 && mapCenter && (
        <Box component="form" onSubmit={handleSaveFarm} noValidate sx={{ mt: 1 }}>
          <Typography variant="h6">Step 2: Pinpoint Your Farm & Add Soil Data</Typography>
          <p>Tap on the map to select your exact farm location.</p>
          <Box sx={{ height: '300px', width: '100%', mb: 2, border: '1px solid #ccc' }}>
            <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <LocationMarker position={finalPosition} setPosition={setFinalPosition} />
            </MapContainer>
          </Box>
          <TextField margin="dense" required fullWidth label="Farm Name (e.g., North Field)" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
          <TextField margin="dense" required fullWidth label="Nitrogen (N)" name="N" type="number" value={soilData.N} onChange={(e) => setSoilData({...soilData, N: e.target.value})} />
          <TextField margin="dense" required fullWidth label="Phosphorous (P)" name="P" type="number" value={soilData.P} onChange={(e) => setSoilData({...soilData, P: e.target.value})} />
          <TextField margin="dense" required fullWidth label="Potassium (K)" name="K" type="number" value={soilData.K} onChange={(e) => setSoilData({...soilData, K: e.target.value})} />
          <TextField margin="dense" required fullWidth label="Soil pH" name="ph" type="number" step="0.1" value={soilData.ph} onChange={(e) => setSoilData({...soilData, ph: e.target.value})} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save Farm'}
          </Button>
        </Box>
      )}
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
}

export default AddFarmPage;