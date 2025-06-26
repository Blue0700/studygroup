import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';

const AdminDashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchGroups();
        fetchUsers();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/admin/groups', {
                headers: { authorization: token }
            });
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/admin/users', {
                headers: { authorization: token }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const approveGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/admin/groups/${groupId}/approve`, {}, {
                headers: { authorization: token }
            });
            fetchGroups();
            alert('Group approved successfully!');
        } catch (error) {
            console.error('Error approving group:', error);
        }
    };

    const rejectGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/admin/groups/${groupId}/reject`, {}, {
                headers: { authorization: token }
            });
            fetchGroups();
            alert('Group rejected successfully!');
        } catch (error) {
            console.error('Error rejecting group:', error);
        }
    };

    const toggleUserBlock = async (userId, isBlocked) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/admin/users/${userId}/block`, 
                { isBlocked: !isBlocked }, 
                { headers: { authorization: token } }
            );
            fetchUsers();
            alert(`User ${!isBlocked ? 'blocked' : 'unblocked'} successfully!`);
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Study Groups" />
                <Tab label="Users" />
            </Tabs>

            {tabValue === 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Study Groups Management
                        </Typography>
                        
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Creator</TableCell>
                                        <TableCell>Members</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map((group) => (
                                        <TableRow key={group._id}>
                                            <TableCell>{group.title}</TableCell>
                                            <TableCell>{group.subject}</TableCell>
                                            <TableCell>{group.creator?.name}</TableCell>
                                            <TableCell>{group.members?.length || 0}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={group.status} 
                                                    color={getStatusColor(group.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {group.status === 'pending' && (
                                                    <>
                                                        <Button 
                                                            size="small" 
                                                            color="success"
                                                            onClick={() => approveGroup(group._id)}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => rejectGroup(group._id)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {tabValue === 1 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Users Management
                        </Typography>
                        
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Contact</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.contactNumber}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={user.isBlocked ? 'Blocked' : 'Active'} 
                                                    color={user.isBlocked ? 'error' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    size="small" 
                                                    color={user.isBlocked ? 'success' : 'error'}
                                                    onClick={() => toggleUserBlock(user._id, user.isBlocked)}
                                                >
                                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default AdminDashboard;