import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { postChatMessage } from '../services/api'; // Import the new API function

function Chatbot({ farmId }) { // Accept farmId as a prop
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      // Call the backend API
      const result = await postChatMessage(farmId, input);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just show a message. A real implementation would upload the file.
      setMessages([...messages, { text: `Image "${file.name}" selected. Disease diagnosis is not yet implemented.`, sender: 'user' }]);
    }
  };

  return (
    <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6">Chat with Agri-Friend</Typography>
      <Box sx={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', p: 1, my: 2, display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', my: 1 }}>
            <Typography
              variant="body1"
              sx={{
                display: 'inline-block', p: 1, borderRadius: '10px',
                backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#f1f1f1',
                maxWidth: '100%',
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ alignSelf: 'flex-start', my: 1 }}>
            <Typography variant="body1" sx={{ display: 'inline-block', p: 1, borderRadius: '10px', backgroundColor: '#f1f1f1' }}>
              Agri-Friend is typing... <CircularProgress size={14} />
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth variant="outlined" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a follow-up question..."
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