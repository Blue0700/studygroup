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
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3000/groups')
            .then(res => setGroups(res.data))
            .catch(err => console.log(err));
    }, []);

    const joinGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/groups/${groupId}/join`, {}, {
                headers: { authorization: token }
            });
            alert('Joined group successfully!');
        } catch (error) {
            console.error('Failed to join group:', error);
        }
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
                        </CardContent>
                        <CardActions>
                            <Button 
                                size="small" 
                                onClick={() => navigate(`/group/${group._id}`)}
                            >
                                View Details
                            </Button>
                            <Button 
                                size="small" 
                                variant="contained"
                                onClick={() => joinGroup(group._id)}
                            >
                                Join Group
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default Home;