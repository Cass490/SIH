// This is the central point for all communication with your FastAPI backend.
const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * A helper function to make API calls and handle errors consistently.
 * @param {string} endpoint - The API endpoint to call (e.g., '/farms').
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
 * @param {object|null} body - The JSON body for POST requests.
 * @returns {Promise<object>} - The JSON response from the server or an error object.
 */
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      // Try to parse the error message from the backend
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    // Return a consistent error format for the frontend to handle
    return { error: error.message };
  }
}

// --- LOCATION SERVICES ---
export const geocodeAddress = (address) => apiCall('/geolocate', 'POST', address);

// --- FARM SERVICES ---
export const saveFarm = (farmData) => apiCall('/farms', 'POST', farmData);
export const getFarmsForUser = (userId) => apiCall(`/farms?user_id=${userId}`);
export const getFarmHubData = (farmId) => apiCall(`/farms/${farmId}/hub`);

// --- AUTHENTICATION SERVICES ---
export const registerUser = (userData) => apiCall('/auth/register', 'POST', userData);
export const loginUser = (phone, password) => apiCall('/auth/login', 'POST', { phone, password });

// --- CHATBOT SERVICES (Future) ---
// export const postChatMessage = (farmId, message) => apiCall(`/farms/${farmId}/chat`, 'POST', { message });
// export const postDiseaseImage = (farmId, formData) => { /* Special handling for files */ };
// ... (at the end of the file, with the other exports)

// --- CHATBOT SERVICES ---
export const postChatMessage = (farmId, message) => apiCall(`/farms/${farmId}/chat`, 'POST', { message });