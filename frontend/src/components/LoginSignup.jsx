import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import axios from 'axios';
import TermsAndConditions from './TermsAndConditions';

const LoginSignup = ({ onLogin }) => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [signupForm, setSignupForm] = useState({
        name: '', email: '', contactNumber: '', password: '', confirmPassword: '', termsAccepted: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsDialogOpen, setTermsDialogOpen] = useState(false); // NEW: Terms dialog state

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setError(''); // Clear errors when switching tabs
    };

    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
        setError(''); // Clear error when user types
    };

    const handleSignupChange = (e) => {
        if (e.target.name === 'termsAccepted') {
            setSignupForm({ ...signupForm, [e.target.name]: e.target.checked });
        } else {
            setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
        }
        setError(''); // Clear error when user types
    };

    const handleLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/login', loginForm);
            
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Update parent component state
            onLogin(response.data.user);
            
            // Navigate to home page
            navigate('/');
            
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!signupForm.name || !signupForm.email || !signupForm.contactNumber || 
            !signupForm.password || !signupForm.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (signupForm.password !== signupForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // NEW: Check if terms are accepted
        if (!signupForm.termsAccepted) {
            setError('You must accept the Terms and Conditions to register');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:3000/register', signupForm);
            alert('Registration successful! Please login.');
            setTabValue(0);
            // Clear signup form
            setSignupForm({
                name: '', email: '', contactNumber: '', password: '', confirmPassword: '', termsAccepted: false
            });
        } catch (error) {
            console.error('Signup failed:', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // NEW: Handle terms dialog open
    const handleTermsLinkClick = (e) => {
        e.preventDefault();
        setTermsDialogOpen(true);
    };

    // NEW: Handle terms acceptance from dialog
    const handleTermsAccept = () => {
        setSignupForm({ ...signupForm, termsAccepted: true });
        setTermsDialogOpen(false);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Login" />
                <Tab label="Sign Up" />
            </Tabs>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {tabValue === 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleLogin} 
                        fullWidth 
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
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
                        required
                    />
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        name="contactNumber"
                        label="Contact Number"
                        value={signupForm.contactNumber}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={signupForm.password}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={handleSignupChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    
                    {/* NEW: Terms and Conditions Checkbox */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="termsAccepted"
                                checked={signupForm.termsAccepted}
                                onChange={handleSignupChange}
                                color="primary"
                            />
                        }
                        label={
                            <span>
                                I agree to the{' '}
                                <Link 
                                    href="#" 
                                    onClick={handleTermsLinkClick}
                                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Terms and Conditions
                                </Link>
                            </span>
                        }
                        sx={{ mt: 2, mb: 2, textAlign: 'left' }}
                    />
                    
                    <Button 
                        variant="contained" 
                        onClick={handleSignup} 
                        fullWidth 
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                </Box>
            )}

            {/* NEW: Terms and Conditions Dialog */}
            <TermsAndConditions
                open={termsDialogOpen}
                onClose={() => setTermsDialogOpen(false)}
                onAccept={handleTermsAccept}
            />
        </Box>
    );
};

export default LoginSignup;