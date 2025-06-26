import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
        fetchUserGroups();
        getCurrentUser();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://localhost:3000/groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchUserGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://localhost:3000/my-groups', {
                    headers: { authorization: token }
                });
                setUserGroups(response.data.map(group => group._id));
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
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

    const joinGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to join a group');
                navigate('/login');
                return;
            }

            await axios.post(`http://localhost:3000/groups/${groupId}/join`, {}, {
                headers: { authorization: token }
            });
            
            alert('Joined group successfully!');
            // Refresh the data to update button states
            fetchGroups();
            fetchUserGroups();
        } catch (error) {
            console.error('Failed to join group:', error);
            alert('Failed to join group. Please try again.');
        }
    };

    const leaveGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/groups/${groupId}/leave`, {}, {
                headers: { authorization: token }
            });
            
            alert('Left group successfully!');
            // Refresh the data to update button states
            fetchGroups();
            fetchUserGroups();
        } catch (error) {
            console.error('Failed to leave group:', error);
            alert('Failed to leave group. Please try again.');
        }
    };

    const isUserInGroup = (groupId) => {
        return userGroups.includes(groupId);
    };

    const isUserLoggedIn = () => {
        return localStorage.getItem('token') !== null;
    };

    return (
        <Grid container spacing={3} sx={{ padding: 2 }}>
            {groups.map((group) => (
                <Grid item xs={12} sm={6} md={4} key={group._id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{group.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Subject: {group.subject}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {group.description}
                            </Typography>
                            <Typography variant="body2">
                                Members: {group.members.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Created by: {group.creator?.name}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button 
                                size="small" 
                                onClick={() => navigate(`/group/${group._id}`)}
                            >
                                View Details
                            </Button>
                            
                            {isUserLoggedIn() && (
                                isUserInGroup(group._id) ? (
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => leaveGroup(group._id)}
                                    >
                                        Leave Group
                                    </Button>
                                ) : (
                                    <Button 
                                        size="small" 
                                        variant="contained"
                                        onClick={() => joinGroup(group._id)}
                                    >
                                        Join Group
                                    </Button>
                                )
                            )}
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default Home;