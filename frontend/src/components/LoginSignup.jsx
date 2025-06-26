import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';

const LoginSignup = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [signupForm, setSignupForm] = useState({
        name: '', email: '', contactNumber: '', password: '', confirmPassword: ''
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3000/login', loginForm);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // Navigate to home
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleSignup = async () => {
        try {
            await axios.post('http://localhost:3000/register', signupForm);
            alert('Registration successful! Please login.');
            setTabValue(0);
        } catch (error) {
            console.error('Signup failed:', error);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Login" />
                <Tab label="Sign Up" />
            </Tabs>

            {tabValue === 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <TextField
                        name="email"
                        label="Email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleLogin} fullWidth sx={{ mt: 2 }}>
                        Login
                    </Button>
                </Box>
            )}

            {tabValue === 1 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <TextField
                        name="name"
                        label="Name"
                        value={signupForm.name}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="email"
                        label="Email"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="contactNumber"
                        label="Contact Number"
                        value={signupForm.contactNumber}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleSignup} fullWidth sx={{ mt: 2 }}>
                        Sign Up
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default LoginSignup;