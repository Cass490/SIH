import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button, Paper, Typography, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
// This is the single, correct import for all necessary API functions
import { postChatMessage, uploadDiseaseImage } from '../services/api';

/**
 * An interactive chatbot component for a specific farm.
 * @param {object} props - The component's props.
 * @param {string} props.farmId - The unique ID of the farm this chat is associated with.
 */
function Chatbot({ farmId }) {
  // i18n instance to get the currently selected language
  const { i18n } = useTranslation(); 
  
  // State management for the chat
  const [messages, setMessages] = useState([]); // Holds the list of chat messages
  const [input, setInput] = useState(''); // Holds the text in the input field
  const [isLoading, setIsLoading] = useState(false); // Tracks if the AI is "typing"

  /**
   * Handles sending a text message to the backend.
   */
  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = { text: input, sender: 'user' };
      // Add the user's message to the chat window immediately for good UX
      setMessages(prev => [...prev, userMessage]);
      const currentInput = input;
      setInput('');
      setIsLoading(true);

      // Get the current language and send it with the message to the backend
      const currentLanguage = i18n.language;
      const result = await postChatMessage(farmId, currentInput, currentLanguage);
      
      setIsLoading(false);

      if (result && !result.error) {
        const aiMessage = { text: result.response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { text: "Sorry, I couldn't get a response. Please try again.", sender: 'ai' };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  /**
   * Handles uploading an image file for disease diagnosis.
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && !isLoading) {
      // Show a placeholder message while the image is being processed
      setMessages(prev => [...prev, { text: `Analyzing image: ${file.name}...`, sender: 'user' }]);
      setIsLoading(true);
      
      // Call the API service to upload the image
      const result = await uploadDiseaseImage(farmId, file);
      setIsLoading(false);

      if (result && !result.error) {
        // The analysis from the backend is the AI's message
        const aiMessage = { text: result.analysis, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { text: "Sorry, I couldn't analyze that image. Please try uploading a clear photo of the affected area.", sender: 'ai' };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6">Chat with Agri-Friend</Typography>
      
      {/* Message Display Area */}
      <Box sx={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', p: 1, my: 2, display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', my: 1, maxWidth: '80%' }}>
            <Typography
              variant="body1"
              sx={{
                display: 'inline-block', p: 1, borderRadius: '10px',
                backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#f1f1f1',
                whiteSpace: 'pre-wrap', // This makes sure line breaks from the AI are respected
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={{ alignSelf: 'flex-start', my: 1 }}>
            <Typography variant="body1" sx={{ display: 'inline-block', p: 1, borderRadius: '10px', backgroundColor: '#f1f1f1' }}>
              Agri-Friend is typing... <CircularProgress size={14} />
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Input Area */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth variant="outlined" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a follow-up question or upload an image..."
          disabled={isLoading}
        />
        <IconButton color="primary" component="label" disabled={isLoading}>
          <PhotoCameraIcon />
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </IconButton>
        <Button variant="contained" onClick={handleSend} endIcon={<SendIcon />} disabled={isLoading}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default Chatbot;