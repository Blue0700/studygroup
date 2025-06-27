import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const SendNotification = ({ open, onClose, onNotificationSent }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (open) {
            fetchGroups();
            // Reset form when dialog opens
            setSelectedGroup('');
            setSubject('');
            setMessage('');
            setError('');
            setSuccess('');
        }
    }, [open]);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/admin/groups', {
                headers: { authorization: token }
            });
            // Only show approved groups with members
            const approvedGroups = response.data.filter(
                group => group.status === 'approved' && group.members && group.members.length > 0
            );
            setGroups(approvedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError('Failed to fetch groups');
        }
    };

    const handleSendNotification = async () => {
        if (!selectedGroup || !subject.trim() || !message.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/notifications/send-group-notification',
                {
                    groupId: selectedGroup,
                    subject: subject.trim(),
                    message: message.trim()
                },
                {
                    headers: { authorization: token }
                }
            );

            setSuccess(response.data.message);
            
            // Reset form
            setSelectedGroup('');
            setSubject('');
            setMessage('');
            
            // Notify parent component
            if (onNotificationSent) {
                onNotificationSent(response.data);
            }
            
            // Auto close after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
            
        } catch (error) {
            console.error('Error sending notification:', error);
            setError(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const selectedGroupInfo = groups.find(g => g._id === selectedGroup);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Send Group Notification</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert severity="success" onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Select Study Group</InputLabel>
                        <Select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            label="Select Study Group"
                            disabled={loading}
                        >
                            {groups.map((group) => (
                                <MenuItem key={group._id} value={group._id}>
                                    {group.title} - {group.subject} ({group.members?.length || 0} members)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedGroupInfo && (
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Group:</strong> {selectedGroupInfo.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Subject:</strong> {selectedGroupInfo.subject}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Creator:</strong> {selectedGroupInfo.creator?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Members:</strong> {selectedGroupInfo.members?.length || 0}
                            </Typography>
                        </Box>
                    )}

                    <TextField
                        label="Email Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        fullWidth
                        disabled={loading}
                        placeholder="Enter notification subject"
                    />

                    <TextField
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        multiline
                        rows={6}
                        disabled={loading}
                        placeholder="Enter your notification message here..."
                        helperText="This message will be sent to all members of the selected group"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSendNotification} 
                    variant="contained" 
                    disabled={loading || !selectedGroup || !subject.trim() || !message.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Sending...' : 'Send Notification'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendNotification;