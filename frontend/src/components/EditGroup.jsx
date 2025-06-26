import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import axios from 'axios';

const EditGroup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        subject: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGroupDetails();
    }, [id]);

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/groups/${id}`);
            const group = response.data;
            
            // Check if current user is the creator
            const token = localStorage.getItem('token');
            if (token) {
                const userResponse = await axios.get('http://localhost:3000/profile', {
                    headers: { authorization: token }
                });
                
                if (group.creator._id !== userResponse.data._id) {
                    setError('You are not authorized to edit this group');
                    return;
                }
            } else {
                setError('Please login to edit groups');
                return;
            }
            
            setForm({
                title: group.title,
                subject: group.subject,
                description: group.description
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching group details:', error);
            setError('Failed to load group details');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to edit groups');
                navigate('/login');
                return;
            }

            await axios.put(`http://localhost:3000/groups/${id}`, form, {
                headers: { authorization: token }
            });
            
            alert('Group updated successfully!');
            navigate(`/group/${id}`);
        } catch (error) {
            console.error('Error updating group:', error);
            if (error.response?.status === 403) {
                alert('You are not authorized to edit this group');
            } else {
                alert('Failed to update group. Please try again.');
            }
        }
    };

    const handleCancel = () => {
        navigate(`/group/${id}`);
    };

    if (loading) return <div>Loading...</div>;

    if (error) {
        return (
            <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Back to Home
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Edit Study Group
                    </Typography>
                    
                    <TextField
                        fullWidth
                        name="title"
                        label="Group Title"
                        value={form.title}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    
                    <TextField
                        fullWidth
                        name="subject"
                        label="Subject"
                        value={form.subject}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    
                    <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        value={form.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                    />
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleSubmit}
                            sx={{ flex: 1 }}
                        >
                            Update Group
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={handleCancel}
                            sx={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EditGroup;