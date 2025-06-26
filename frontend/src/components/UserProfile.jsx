import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import axios from 'axios';

const UserProfile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        contactNumber: ''
    });
    const [myGroups, setMyGroups] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchMyGroups();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/profile', {
                headers: { authorization: token }
            });
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchMyGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/my-groups', {
                headers: { authorization: token }
            });
            setMyGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:3000/profile', profile, {
                headers: { authorization: token }
            });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const leaveGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/groups/${groupId}/leave`, {}, {
                headers: { authorization: token }
            });
            fetchMyGroups();
            alert('Left group successfully!');
        } catch (error) {
            console.error('Error leaving group:', error);
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        My Profile
                    </Typography>
                    
                    <TextField
                        fullWidth
                        name="name"
                        label="Name"
                        value={profile.name}
                        onChange={handleChange}
                        margin="normal"
                        disabled={!isEditing}
                    />
                    
                    <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        value={profile.email}
                        onChange={handleChange}
                        margin="normal"
                        disabled={!isEditing}
                    />
                    
                    <TextField
                        fullWidth
                        name="contactNumber"
                        label="Contact Number"
                        value={profile.contactNumber}
                        onChange={handleChange}
                        margin="normal"
                        disabled={!isEditing}
                    />
                    
                    <Box sx={{ mt: 2 }}>
                        {isEditing ? (
                            <>
                                <Button 
                                    variant="contained" 
                                    onClick={handleSave}
                                    sx={{ mr: 2 }}
                                >
                                    Save
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button 
                                variant="outlined" 
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        My Study Groups
                    </Typography>
                    
                    <List>
                        {myGroups.map((group) => (
                            <div key={group._id}>
                                <ListItem>
                                    <ListItemText
                                        primary={group.title}
                                        secondary={`Subject: ${group.subject} | Members: ${group.members?.length || 0}`}
                                    />
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        size="small"
                                        onClick={() => leaveGroup(group._id)}
                                    >
                                        Leave
                                    </Button>
                                </ListItem>
                                <Divider />
                            </div>
                        ))}
                        {myGroups.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                You haven't joined any groups yet.
                            </Typography>
                        )}
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UserProfile;