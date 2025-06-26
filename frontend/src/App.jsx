import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LoginSignup from './components/LoginSignup';
import GroupDetails from './components/GroupDetails';
import UserProfile from './components/UserProfile';
import CreateGroup from './components/CreateGroup';
import EditGroup from './components/EditGroup';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <div>
            <Navbar user={user} onLogout={handleLogout} />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<LoginSignup onLogin={handleLogin} />} />
                <Route path='/group/:id' element={<GroupDetails />} />
                <Route path='/profile' element={<UserProfile />} />
                <Route path='/create-group' element={<CreateGroup />} />
                <Route path='/edit-group/:id' element={<EditGroup />} />
                <Route path='/admin' element={<AdminDashboard />} />
            </Routes>
        </div>
    );
};

export default App;