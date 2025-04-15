"use client";

import React, { useState, useEffect } from "react";
import { Message } from "logic/Message";
import { MessageService } from "services/MessageService";
import { auth } from "config/firebase";
import {
  Button,
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";

const MessageComponent: React.FC = () => {
  const [isWriting, setIsWriting] = useState(true);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Set<string>>(new Set());
  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    if (recipient.trim()) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [recipient]);

  useEffect(() => {
    if (userEmail) {
      MessageService.getEmailsFromMessages(userEmail).then(setContacts).catch(console.error);
    }
  }, [userEmail]);

  const fetchMessages = async () => {
    if (userEmail && recipient.trim()) {
      try {
        const fetchedMessages = await MessageService.getMessagesBetweenMails(userEmail, recipient);
        fetchedMessages.sort((a, b) => a.getMessageTimestamp().getTime() - b.getMessageTimestamp().getTime());
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && recipient.trim() && userEmail) {
      const newMessage = new Message(userEmail, recipient, message, new Date());
      await MessageService.createMessage(newMessage);
      setMessage("");
      fetchMessages();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Messages
        </Typography>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Contacts
        </Typography>
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2}>
          {[...contacts].length ? (
            [...contacts].map((contact) => (
              <Paper
                key={contact}
                elevation={3}
                sx={{ padding: 2, cursor: "pointer", textAlign: "center", ":hover": { boxShadow: 6 } }}
                onClick={() => {
                  setIsWriting(true);
                  setRecipient(contact);
                }}
              >
                <Typography variant="body1">{contact}</Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body1">No previous messages found.</Typography>
          )}
        </Box>
      </Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
            Send Message
      </Typography>
      <Card elevation={4} sx={{ p: 3, borderRadius: 2 }}>
        <CardContent>
          {!isWriting ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsWriting(true)}>
              Write Message
            </Button>
          ) : (
            <>
              <TextField
                fullWidth
                variant="outlined"
                label="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box maxHeight={300} overflow="auto" sx={{ mb: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                {messages.length ? (
                  messages.map((msg, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{ p: 2, mb: 1, borderRadius: 2, backgroundColor: msg.getSenderEmail() === userEmail ? "#e3f2fd" : "#fff3cd" }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {msg.getSenderEmail()}
                      </Typography>
                      <Typography variant="body1">{msg.getText()}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {msg.getMessageTimestamp().toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    No messages found
                  </Typography>
                )}
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSendMessage} color="primary">
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default MessageComponent;
