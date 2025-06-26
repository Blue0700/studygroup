const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const app = new express();
const PORT = 3000;

require('./connection');
const UserModel = require('./models/UserModel');
const GroupModel = require('./models/GroupModel');
const MessageModel = require('./models/MessageModel');

app.use(express.json());
app.use(cors());

// **NEW: Authentication Middleware**
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// **UPDATED: User Registration with Terms Validation**
app.post('/register', async(req, res) => {
    try {
        const { name, email, contactNumber, password, termsAccepted } = req.body;
        
        // Validate terms acceptance
        if (!termsAccepted) {
            return res.status(400).json({ message: 'You must accept the terms and conditions to register' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new UserModel({
            name,
            email,
            contactNumber,
            password: hashedPassword,
            termsAccepted: true
        });
        
        await user.save();
        res.json({ message: 'User registered successfully' });
    } catch(error) {
        res.status(400).json({ message: 'Registration failed', error });
    }
});

// **NEW: User Login**
app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account blocked' });
        }
        
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            'your-secret-key'
        );
        
        res.json({ token, user: { name: user.name, role: user.role } });
    } catch(error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

// Get all approved groups (similar to your blog's GET /)
app.get('/groups', async(req, res) => {
    try {
        const groups = await GroupModel.find({ status: 'approved' })
            .populate('creator', 'name')
            .populate('members', 'name');
        res.json(groups);
    } catch(error) {
        res.status(500).json({ error });
    }
});

// **NEW: Join Group**
app.post('/groups/:id/join', verifyToken, async(req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id);
        const user = await UserModel.findById(req.user.userId);
        
        if (!group.members.includes(req.user.userId)) {
            group.members.push(req.user.userId);
            user.joinedGroups.push(group._id);
            
            await group.save();
            await user.save();
        }
        
        res.json({ message: 'Joined group successfully' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// **UPDATED: Create group with auto-membership for creator**
app.post('/groups/create', verifyToken, async(req, res) => {
    try {
        const group = new GroupModel({
            ...req.body,
            creator: req.user.userId,
            members: [req.user.userId] // **NEW: Auto-add creator as member**
        });
        
        await group.save();
        
        // **NEW: Add group to creator's joinedGroups**
        await UserModel.findByIdAndUpdate(
            req.user.userId,
            { $push: { joinedGroups: group._id } }
        );
        
        res.json({ message: 'Group created and pending approval. You have been added as a member.' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// **NEW: Admin Routes**
app.get('/admin/groups', verifyToken, async(req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const groups = await GroupModel.find()
            .populate('creator', 'name')
            .populate('members', 'name');
        res.json(groups);
    } catch(error) {
        res.status(500).json({ error });
    }
});

app.put('/admin/groups/:id/approve', verifyToken, async(req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        await GroupModel.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ message: 'Group approved' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Get single group details
app.get('/groups/:id', async(req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id)
            .populate('creator', 'name')
            .populate('members', 'name');
        res.json(group);
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Get group messages
app.get('/groups/:id/messages', async(req, res) => {
    try {
        const messages = await MessageModel.find({ groupId: req.params.id })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Send message to group
app.post('/groups/:id/messages', verifyToken, multer().single('file'), async(req, res) => {
    try {
        const message = new MessageModel({
            groupId: req.params.id,
            sender: req.user.userId,
            message: req.body.message,
            fileUrl: req.file ? req.file.path : null
        });
        await message.save();
        res.json({ message: 'Message sent successfully' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Get user profile
app.get('/profile', verifyToken, async(req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId).select('-password');
        res.json(user);
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Update user profile
app.put('/profile', verifyToken, async(req, res) => {
    try {
        await UserModel.findByIdAndUpdate(req.user.userId, req.body);
        res.json({ message: 'Profile updated successfully' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Get user's groups
app.get('/my-groups', verifyToken, async(req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId).populate('joinedGroups');
        res.json(user.joinedGroups);
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Leave group
app.post('/groups/:id/leave', verifyToken, async(req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id);
        const user = await UserModel.findById(req.user.userId);
        
        group.members = group.members.filter(member => !member.equals(req.user.userId));
        user.joinedGroups = user.joinedGroups.filter(groupId => !groupId.equals(req.params.id));
        
        await group.save();
        await user.save();
        
        res.json({ message: 'Left group successfully' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Admin: Get all users
app.get('/admin/users', verifyToken, async(req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const users = await UserModel.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Admin: Block/Unblock user
app.put('/admin/users/:id/block', verifyToken, async(req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        await UserModel.findByIdAndUpdate(req.params.id, { isBlocked: req.body.isBlocked });
        res.json({ message: 'User status updated' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

// Admin: Reject group
app.put('/admin/groups/:id/reject', verifyToken, async(req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        await GroupModel.findByIdAndUpdate(req.params.id, { status: 'rejected' });
        res.json({ message: 'Group rejected' });
    } catch(error) {
        res.status(500).json({ error });
    }
});

app.listen(PORT, () => {
    console.log("Server listening on port 3000");
});