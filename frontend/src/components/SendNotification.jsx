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
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/groups/${groupId}`, {
                headers: { authorization: token }
            });
            setGroup(response.data);
            setSubject(`Update for ${response.data.title} Study Group`);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching group details:', error);
            setAlert({
                show: true,
                type: 'error',
                message: 'Failed to load group details'
            });
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        
        if (!subject.trim() || !message.trim()) {
            setAlert({
                show: true,
                type: 'error',
                message: 'Please fill in both subject and message fields'
            });
            return;
        }

        setSending(true);
        setAlert({ show: false, type: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/notifications/send`, {
                groupId,
                subject: subject.trim(),
                message: message.trim()
            }, {
                headers: { authorization: token }
            });

            setAlert({
                show: true,
                type: 'success',
                message: `Notification sent successfully to ${group.members.length} group members!`
            });

            // Reset form
            setSubject(`Update for ${group.title} Study Group`);
            setMessage('');
            
            // Redirect back to admin dashboard after 2 seconds
            setTimeout(() => {
                navigate('/admin');
            }, 2000);

        } catch (error) {
            console.error('Error sending notification:', error);
            setAlert({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Failed to send notification'
            });
        } finally {
            setSending(false);
        }
    };

    const handleBack = () => {
        navigate('/admin');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!group) {
        return (
            <Box sx={{ padding: 3 }}>
                <Alert severity="error">
                    Group not found or you don't have permission to access it.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3, maxWidth: 800, margin: '0 auto' }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mb: 2 }}
            >
                Back to Admin Dashboard
            </Button>

            <Typography variant="h4" gutterBottom>
                Send Notification
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Group: {group.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Subject: {group.subject} | Members: {group.members.length}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        {group.description}
                    </Typography>

                    {alert.show && (
                        <Alert 
                            severity={alert.type} 
                            sx={{ mb: 2 }}
                            onClose={() => setAlert({ show: false, type: '', message: '' })}
                        >
                            {alert.message}
                        </Alert>
                    )}

                    <form onSubmit={handleSendNotification}>
                        <TextField
                            fullWidth
                            label="Email Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                            disabled={sending}
                        />

                        <TextField
                            fullWidth
                            label="Message"
                            multiline
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your notification message for group members..."
                            sx={{ mb: 3 }}
                            required
                            disabled={sending}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : 'Send Notification'}
                            </Button>
                            
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                disabled={sending}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SendNotification;