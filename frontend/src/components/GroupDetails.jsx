import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import axios from 'axios';

const GroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isUserInGroup, setIsUserInGroup] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchGroupDetails();
        fetchMessages();
        getCurrentUser();
    }, [id]);

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/groups/${id}`);
            setGroup(response.data);
            
            // Check if current user is in this group
            const token = localStorage.getItem('token');
            if (token) {
                const userResponse = await axios.get('http://localhost:3000/profile', {
                    headers: { authorization: token }
                });
                const userId = userResponse.data._id;
                setIsUserInGroup(response.data.members.some(member => member._id === userId));
            }
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

    const getCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://localhost:3000/profile', {
                    headers: { authorization: token }
                });
                setCurrentUserId(response.data._id);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const joinGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to join a group');
                navigate('/login');
                return;
            }

            await axios.post(`http://localhost:3000/groups/${id}/join`, {}, {
                headers: { authorization: token }
            });
            
            alert('Joined group successfully!');
            setIsUserInGroup(true);
            fetchGroupDetails(); // Refresh group data
        } catch (error) {
            console.error('Failed to join group:', error);
            alert('Failed to join group. Please try again.');
        }
    };

    const leaveGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/groups/${id}/leave`, {}, {
                headers: { authorization: token }
            });
            
            alert('Left group successfully!');
            setIsUserInGroup(false);
            fetchGroupDetails(); // Refresh group data
        } catch (error) {
            console.error('Failed to leave group:', error);
            alert('Failed to leave group. Please try again.');
        }
    };

    const handleEditGroup = () => {
        navigate(`/edit-group/${id}`);
    };

    const handleDeleteGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to delete groups');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:3000/groups/${id}`, {
                headers: { authorization: token }
            });
            
            alert('Group deleted successfully!');
            navigate('/');
        } catch (error) {
            console.error('Failed to delete group:', error);
            if (error.response?.status === 403) {
                alert('You are not authorized to delete this group');
            } else {
                alert('Failed to delete group. Please try again.');
            }
        }
        setDeleteDialogOpen(false);
    };

    const sendMessage = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to send messages');
                return;
            }

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
            alert('Failed to send message. Please try again.');
        }
    };

    const isUserLoggedIn = () => {
        return localStorage.getItem('token') !== null;
    };

    const isGroupCreator = () => {
        return currentUserId && group && group.creator && group.creator._id === currentUserId;
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
                    
                    {/* Action Buttons */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {/* Join/Leave Group Button */}
                        {isUserLoggedIn() && !isGroupCreator() && (
                            <>
                                {isUserInGroup ? (
                                    <Button 
                                        variant="outlined" 
                                        color="secondary"
                                        onClick={leaveGroup}
                                    >
                                        Leave Group
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="contained" 
                                        onClick={joinGroup}
                                    >
                                        Join Group
                                    </Button>
                                )}
                            </>
                        )}
                        
                        {/* Edit/Delete Buttons - Only for Group Creator */}
                        {isGroupCreator() && (
                            <>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleEditGroup}
                                >
                                    Edit Group
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    Delete Group
                                </Button>
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Messages Section - Only show if user is in group */}
            {isUserInGroup ? (
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
            ) : (
                <Card>
                    <CardContent>
                        <Alert severity="info">
                            You need to join this group to view messages and participate in discussions.
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Group</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this group? This action cannot be undone.
                        All messages and materials will be permanently deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteGroup} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupDetails;