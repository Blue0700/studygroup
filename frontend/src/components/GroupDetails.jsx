import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import axios from 'axios';

const GroupDetails = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchGroupDetails();
        fetchMessages();
    }, [id]);

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/groups/${id}`);
            setGroup(response.data);
        } catch (error) {
            console.error('Error fetching group details:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/groups/${id}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('message', newMessage);
            if (file) {
                formData.append('file', file);
            }

            await axios.post(`http://localhost:3000/groups/${id}/messages`, formData, {
                headers: { 
                    authorization: token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setNewMessage('');
            setFile(null);
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!group) return <div>Loading...</div>;

    return (
        <Box sx={{ padding: 3 }}>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {group.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Subject: {group.subject}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {group.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Created by: {group.creator?.name}
                    </Typography>
                    <Typography variant="body2">
                        Members: {group.members?.length || 0}
                    </Typography>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Group Messages & Materials
                    </Typography>
                    
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {messages.map((message) => (
                            <div key={message._id}>
                                <ListItem>
                                    <ListItemText
                                        primary={message.sender?.name}
                                        secondary={
                                            <>
                                                <Typography variant="body2">
                                                    {message.message}
                                                </Typography>
                                                {message.fileUrl && (
                                                    <Typography variant="caption" color="primary">
                                                        📎 File attached
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" display="block">
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                            </div>
                        ))}
                    </List>

                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Send a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ marginBottom: '10px' }}
                        />
                        
                        <Button 
                            variant="contained" 
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                        >
                            Send Message
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default GroupDetails;