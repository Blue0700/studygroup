import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LoginSignup from './components/LoginSignup';
import GroupDetails from './components/GroupDetails';
import UserProfile from './components/UserProfile';
import CreateGroup from './components/CreateGroup';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<LoginSignup />} />
                <Route path='/group/:id' element={<GroupDetails />} />
                <Route path='/profile' element={<UserProfile />} />
                <Route path='/create-group' element={<CreateGroup />} />
                <Route path='/admin' element={<AdminDashboard />} />
            </Routes>
        </div>
    );
};

export default App;