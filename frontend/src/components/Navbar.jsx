import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';

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

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar 
                position="static" 
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Toolbar sx={{ minHeight: '70px !important' }}>
                    {/* Modern Logo Section */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                filter: 'brightness(1.1)'
                            }
                        }}
                        onClick={handleLogoClick}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '12px',
                                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 2,
                                fontSize: '20px',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            📚
                        </Box>
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            StudyHub
                        </Typography>
                    </Box>
                    
                    {/* Spacer */}
                    <Box sx={{ flexGrow: 1 }} />
                    
                    {/* Navigation Links */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Home" arrow>
                            <Link to='/' style={{ textDecoration: 'none' }}>
                                <Button 
                                    color="inherit" 
                                    startIcon={<HomeIcon />}
                                    sx={{
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '8px 16px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                                        }
                                    }}
                                >
                                    Home
                                </Button>
                            </Link>
                        </Tooltip>
                        
                        {user ? (
                            <>
                                <Tooltip title="Create New Group" arrow>
                                    <Link to='/create-group' style={{ textDecoration: 'none' }}>
                                        <Button 
                                            color="inherit" 
                                            startIcon={<AddIcon />}
                                            sx={{
                                                color: 'white',
                                                borderRadius: '12px',
                                                padding: '8px 16px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                                                }
                                            }}
                                        >
                                            Create Group
                                        </Button>
                                    </Link>
                                </Tooltip>
                                
                                {user.role === 'admin' && (
                                    <Tooltip title="Admin Dashboard" arrow>
                                        <Link to='/admin' style={{ textDecoration: 'none' }}>
                                            <Button 
                                                color="inherit" 
                                                startIcon={<AdminPanelSettingsIcon />}
                                                sx={{
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    padding: '8px 16px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(45deg, #ff5252, #d63031)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)'
                                                    }
                                                }}
                                            >
                                                Admin
                                            </Button>
                                        </Link>
                                    </Tooltip>
                                )}
                                
                                {/* Notifications Button */}
                                <Tooltip title="Notifications" arrow>
                                    <IconButton
                                        color="inherit"
                                        sx={{
                                            color: 'white',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                                            }
                                        }}
                                    >
                                        <Badge badgeContent={3} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>
                                </Tooltip>
                                
                                {/* User Profile Menu */}
                                <Tooltip title="Profile Menu" arrow>
                                    <IconButton
                                        size="medium"
                                        onClick={handleMenu}
                                        color="inherit"
                                        sx={{
                                            padding: '4px',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                                            }
                                        }}
                                    >
                                        <Avatar 
                                            sx={{ 
                                                width: 36, 
                                                height: 36,
                                                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                            }}
                                        >
                                            {user.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    PaperProps={{
                                        sx: {
                                            mt: 1,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            minWidth: 200,
                                            '& .MuiMenuItem-root': {
                                                borderRadius: '8px',
                                                margin: '4px 8px',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                    transform: 'translateX(4px)'
                                                }
                                            }
                                        }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem 
                                        onClick={() => { navigate('/profile'); handleClose(); }}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                    >
                                        <PersonIcon fontSize="small" color="primary" />
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                Profile
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                View and edit profile
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={handleLogout}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            color: '#d32f2f'
                                        }}
                                    >
                                        <LogoutIcon fontSize="small" />
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                Logout
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Sign out of your account
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Tooltip title="Login or Sign Up" arrow>
                                <Link to='/login' style={{ textDecoration: 'none' }}>
                                    <Button 
                                        color="inherit" 
                                        startIcon={<LoginIcon />}
                                        sx={{
                                            color: 'white',
                                            borderRadius: '12px',
                                            padding: '8px 20px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #45b7b8, #3d8b85)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(78, 205, 196, 0.4)'
                                            }
                                        }}
                                    >
                                        Login / Sign Up
                                    </Button>
                                </Link>
                            </Tooltip>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;