import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        onLogout();
        handleClose();
        navigate('/');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        📚 Study Group Finder
                    </Typography>
                    
                    <Link to='/' style={{ textDecoration: 'none' }}>
                        <Button color="inherit" style={{ color: "white" }}>Home</Button>
                    </Link>
                    
                    {user ? (
                        <>
                            <Link to='/create-group' style={{ textDecoration: 'none' }}>
                                <Button color="inherit" style={{ color: "white" }}>Create Group</Button>
                            </Link>
                            
                            {user.role === 'admin' && (
                                <Link to='/admin' style={{ textDecoration: 'none' }}>
                                    <Button color="inherit" style={{ color: "white" }}>Admin</Button>
                                </Link>
                            )}
                            
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Link to='/login' style={{ textDecoration: 'none' }}>
                            <Button color="inherit" style={{ color: "white" }}>Login/Signup</Button>
                        </Link>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;