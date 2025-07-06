import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const SendNotification = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    const fetchGroupData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/admin/groups/${groupId}`, {
                headers: { authorization: token }
            });
            setGroupData(response.data);
            // **PRE-POPULATE: Set default subject for the group**
            setFormData(prev => ({
                ...prev,
                subject: `Update for ${response.data.title} - ${response.data.subject}`
            }));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching group data:', error);
            setMessage('Error loading group data');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        
        if (!formData.subject.trim() || !formData.message.trim()) {
            setMessage('Please fill in both subject and message fields');
            return;
        }

        setSending(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:3000/admin/notifications/send`, {
                groupId: groupId,
                subject: formData.subject,
                message: formData.message
            }, {
                headers: { authorization: token }
            });

            setMessage('Notification sent successfully to all group members!');
            setTimeout(() => {
                navigate('/admin');
            }, 2000);
        } catch (error) {
            console.error('Error sending notification:', error);
            setMessage('Error sending notification. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleGoBack = () => {
        navigate('/admin');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3, maxWidth: 800, margin: '0 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleGoBack}
                    sx={{ mr: 2 }}
                >
                    Back to Dashboard
                </Button>
                <Typography variant="h4" component="h1">
                    Send Notification
                </Typography>
            </Box>

            {/* **GROUP INFO CARD** */}
            {groupData && (
                <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Group Information
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Title:</strong> {groupData.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Subject:</strong> {groupData.subject}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Members:</strong> {groupData.members?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Notification will be sent to all group members
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* **NOTIFICATION FORM** */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Compose Notification
                    </Typography>
                    
                    <form onSubmit={handleSendNotification}>
                        <TextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            disabled={sending}
                            variant="outlined"
                        />
                        
                        <TextField
                            fullWidth
                            label="Message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                            multiline
                            rows={6}
                            disabled={sending}
                            variant="outlined"
                            placeholder="Enter your notification message here..."
                        />

                        {message && (
                            <Alert 
                                severity={message.includes('Error') ? 'error' : 'success'}
                                sx={{ mt: 2 }}
                            >
                                {message}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                onClick={handleGoBack}
                                disabled={sending}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                variant="contained" 
                                startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                                disabled={sending}
                                className="send-notification-btn"
                            >
                                {sending ? 'Sending...' : 'Send Notification'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SendNotification;