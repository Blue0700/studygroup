import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateGroup = () => {
    const [form, setForm] = useState({
        title: '',
        subject: '',
        description: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/groups/create', form, {
                headers: { authorization: token }
            });
            alert('Group created successfully! Waiting for admin approval.');
            navigate('/');
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    return (
        <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Create New Study Group
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
                    
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                        fullWidth
                    >
                        Create Group
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateGroup;