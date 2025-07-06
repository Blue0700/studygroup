import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const NotificationHistory = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/notifications/history', {
                headers: { authorization: token }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (notification) => {
        setSelectedNotification(notification);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedNotification(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getRecipientTypeIcon = (type) => {
        switch (type) {
            case 'group':
                return <GroupIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            case 'all':
                return <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            case 'specific':
                return <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            default:
                return <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />;
        }
    };

    const getRecipientTypeLabel = (type, count) => {
        switch (type) {
            case 'group':
                return `Group (${count})`;
            case 'all':
                return `All Users (${count})`;
            case 'specific':
                return `Selected (${count})`;
            default:
                return `Recipients (${count})`;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent':
                return 'success';
            case 'failed':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const filteredNotifications = notifications.filter(notification =>
        notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.groupName && notification.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin-dashboard')}
                    sx={{ mr: 2 }}
                >
                    Back to Dashboard
                </Button>
                <Typography variant="h4">
                    Notification History
                </Typography>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Email Notifications ({filteredNotifications.length})
                        </Typography>
                        <TextField
                            size="small"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ width: 300 }}
                        />
                    </Box>

                    {filteredNotifications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? 'No notifications found' : 'No notifications sent yet'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchTerm ? 'Try adjusting your search terms' : 'Start sending notifications to users'}
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Recipients</TableCell>
                                        <TableCell>Group</TableCell>
                                        <TableCell>Date Sent</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredNotifications.map((notification) => (
                                        <TableRow key={notification._id}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {notification.subject}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.message.substring(0, 60)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {getRecipientTypeIcon(notification.recipientType)}
                                                    {getRecipientTypeLabel(notification.recipientType, notification.recipientCount)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {notification.groupName ? (
                                                    <Chip 
                                                        label={notification.groupName}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        General
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(notification.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={notification.status}
                                                    color={getStatusColor(notification.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(notification)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Notification Details
                </DialogTitle>
                <DialogContent>
                    {selectedNotification && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {selectedNotification.subject}
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Sent: {formatDate(selectedNotification.createdAt)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Recipients: {getRecipientTypeLabel(selectedNotification.recipientType, selectedNotification.recipientCount)}
                                </Typography>
                                {selectedNotification.groupName && (
                                    <Typography variant="body2" color="text.secondary">
                                        Group: {selectedNotification.groupName}
                                    </Typography>
                                )}
                                <Chip 
                                    label={selectedNotification.status}
                                    color={getStatusColor(selectedNotification.status)}
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Typography variant="subtitle2" gutterBottom>
                                Message:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedNotification.message}
                                </Typography>
                            </Paper>

                            {selectedNotification.recipients && selectedNotification.recipients.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Recipients:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedNotification.recipients.map((recipient, index) => (
                                            <Chip
                                                key={index}
                                                label={recipient.name || recipient.email}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationHistory;