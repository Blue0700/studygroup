import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const EmailNotification = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groupData, setGroupData] = useState(null);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        recipients: 'group', // 'group', 'all', 'specific'
        subject: '',
        message: '',
        selectedUsers: []
    });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (groupId) {
            fetchGroupData();
        }
        fetchUsers();
    }, [groupId]);

    const fetchGroupData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/admin/groups/${groupId}`, {
                headers: { authorization: token }
            });
            setGroupData(response.data);
            setFormData(prev => ({
                ...prev,
                subject: `Update for ${response.data.title}`
            }));
        } catch (error) {
            console.error('Error fetching group data:', error);
            setNotification({
                type: 'error',
                message: 'Failed to load group data'
            });
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/admin/users', {
                headers: { authorization: token }
            });
            setUsers(response.data.filter(user => !user.isBlocked));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUserSelect = (userId) => {
        setFormData(prev => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(userId)
                ? prev.selectedUsers.filter(id => id !== userId)
                : [...prev.selectedUsers, userId]
        }));
    };

    const getRecipientCount = () => {
        switch (formData.recipients) {
            case 'group':
                return groupData?.members?.length || 0;
            case 'all':
                return users.length;
            case 'specific':
                return formData.selectedUsers.length;
            default:
                return 0;
        }
    };

    const handleSendNotification = async () => {
        if (!formData.subject || !formData.message) {
            setNotification({
                type: 'error',
                message: 'Please fill in all required fields'
            });
            return;
        }

        if (formData.recipients === 'specific' && formData.selectedUsers.length === 0) {
            setNotification({
                type: 'error',
                message: 'Please select at least one user'
            });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                groupId: groupId || null
            };

            await axios.post('http://localhost:3000/api/notifications/send', payload, {
                headers: { authorization: token }
            });

            setNotification({
                type: 'success',
                message: `Notification sent successfully to ${getRecipientCount()} recipients!`
            });

            // Reset form
            setFormData({
                recipients: 'group',
                subject: groupData ? `Update for ${groupData.title}` : '',
                message: '',
                selectedUsers: []
            });

        } catch (error) {
            console.error('Error sending notification:', error);
            setNotification({
                type: 'error',
                message: 'Failed to send notification. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const getRecipientLabel = () => {
        switch (formData.recipients) {
            case 'group':
                return `Group Members (${getRecipientCount()})`;
            case 'all':
                return `All Users (${getRecipientCount()})`;
            case 'specific':
                return `Selected Users (${getRecipientCount()})`;
            default:
                return 'No recipients';
        }
    };

    return (
        <Box sx={{ padding: 3, maxWidth: 800, margin: '0 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin-dashboard')}
                    sx={{ mr: 2 }}
                >
                    Back to Dashboard
                </Button>
                <Typography variant="h4">
                    Send Email Notification
                </Typography>
            </Box>

            {notification && (
                <Alert 
                    severity={notification.type} 
                    sx={{ mb: 3 }}
                    onClose={() => setNotification(null)}
                >
                    {notification.message}
                </Alert>
            )}

            {groupData && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {groupData.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Subject: {groupData.subject} | Members: {groupData.members?.length || 0}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Compose Notification
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Recipients</InputLabel>
                        <Select
                            value={formData.recipients}
                            onChange={(e) => handleInputChange('recipients', e.target.value)}
                        >
                            {groupId && (
                                <MenuItem value="group">
                                    <GroupIcon sx={{ mr: 1 }} />
                                    Group Members Only
                                </MenuItem>
                            )}
                            <MenuItem value="all">
                                <PersonIcon sx={{ mr: 1 }} />
                                All Users
                            </MenuItem>
                            <MenuItem value="specific">
                                <PersonIcon sx={{ mr: 1 }} />
                                Specific Users
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ mb: 3 }}>
                        <Chip 
                            label={getRecipientLabel()}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>

                    {formData.recipients === 'specific' && (
                        <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Select Users:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {users.map(user => (
                                    <Chip
                                        key={user._id}
                                        label={user.name}
                                        onClick={() => handleUserSelect(user._id)}
                                        color={formData.selectedUsers.includes(user._id) ? 'primary' : 'default'}
                                        variant={formData.selectedUsers.includes(user._id) ? 'filled' : 'outlined'}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Card>
                    )}

                    <TextField
                        fullWidth
                        label="Subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        sx={{ mb: 3 }}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        sx={{ mb: 3 }}
                        required
                        placeholder="Enter your notification message here..."
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin-dashboard')}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                            onClick={handleSendNotification}
                            disabled={loading || getRecipientCount() === 0}
                        >
                            {loading ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EmailNotification;