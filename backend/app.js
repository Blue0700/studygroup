const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Import database connection
require('./connection');

// Import models
const UserModel = require('./models/UserModel');
const GroupModel = require('./models/GroupModel');
const MessageModel = require('./models/MessageModel');

// **NEW: Import file routes**
const fileRoutes = require('./routes/fileRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **NEW: Serve static files from uploads directory**
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// **NEW: File upload routes**
app.use('/api', fileRoutes);

// Authentication middleware
const jwt = require('jsonwebtoken');
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

// **User Registration**
app.post('/register', async (req, res) => {
    try {
        const { name, email, contactNumber, password } = req.body;
        
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new UserModel({
            name,
            email,
            contactNumber,
            password
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// **User Login**
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check for admin credentials
        if (email === 'admin@studygroup.com' && password === 'admin123') {
            const token = jwt.sign(
                { userId: 'admin', email: 'admin@studygroup.com', role: 'admin' },
                'your-secret-key'
            );
            return res.json({
                token,
                user: { id: 'admin', name: 'Admin', email: 'admin@studygroup.com', role: 'admin' }
            });
        }

        const user = await UserModel.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: 'user' },
            'your-secret-key'
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: 'user' }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// **Get User Profile**
app.get('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.json({
                _id: 'admin',
                name: 'Admin',
                email: 'admin@studygroup.com',
                role: 'admin'
            });
        }

        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
});

// **Update User Profile**
app.put('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Admin profile cannot be updated' });
        }

        const { name, email, contactNumber } = req.body;
        const user = await UserModel.findByIdAndUpdate(
            req.user.userId,
            { name, email, contactNumber },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
});

// **Create Group**
app.post('/groups', verifyToken, async (req, res) => {
    try {
        const { title, subject, description } = req.body;
        
        const newGroup = new GroupModel({
            title,
            subject,
            description,
            creator: req.user.userId,
            members: [req.user.userId]
        });

        await newGroup.save();
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create group', error: error.message });
    }
});

// **Get All Groups**
app.get('/groups', async (req, res) => {
    try {
        const groups = await GroupModel.find({ status: 'approved' })
            .populate('creator', 'name')
            .populate('members', 'name');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
    }
});

// **Get Single Group**
app.get('/groups/:id', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id)
            .populate('creator', 'name')
            .populate('members', 'name');
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch group', error: error.message });
    }
});

// **Update Group**
app.put('/groups/:id', verifyToken, async (req, res) => {
    try {
        const { title, subject, description } = req.body;
        
        const group = await GroupModel.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is the creator or admin
        if (group.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        const updatedGroup = await GroupModel.findByIdAndUpdate(
            req.params.id,
            { title, subject, description },
            { new: true }
        ).populate('creator', 'name').populate('members', 'name');

        res.json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update group', error: error.message });
    }
});

// **Delete Group**
app.delete('/groups/:id', verifyToken, async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is the creator or admin
        if (group.creator.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }

        await GroupModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete group', error: error.message });
    }
});

// **Join Group**
app.post('/groups/:id/join', verifyToken, async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.members.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Already a member of this group' });
        }

        group.members.push(req.user.userId);
        await group.save();

        res.json({ message: 'Joined group successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to join group', error: error.message });
    }
});

// **Leave Group**
app.post('/groups/:id/leave', verifyToken, async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Not a member of this group' });
        }

        group.members = group.members.filter(member => member.toString() !== req.user.userId);
        await group.save();

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to leave group', error: error.message });
    }
});

// **Send Message**
app.post('/groups/:id/messages', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        
        const group = await GroupModel.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Must be a member to send messages' });
        }

        const newMessage = new MessageModel({
            message,
            sender: req.user.userId,
            group: req.params.id
        });

        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
});

// **Get Messages**
app.get('/groups/:id/messages', async (req, res) => {
    try {
        const messages = await MessageModel.find({ group: req.params.id })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
});

// **Admin Routes**
app.get('/admin/groups', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const groups = await GroupModel.find()
            .populate('creator', 'name')
            .populate('members', 'name');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
    }
});

app.put('/admin/groups/:id/approve', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const group = await GroupModel.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ message: 'Group approved successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve group', error: error.message });
    }
});

app.put('/admin/groups/:id/reject', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const group = await GroupModel.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ message: 'Group rejected successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject group', error: error.message });
    }
});

// **Get All Users (Admin)**
app.get('/admin/users', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const users = await UserModel.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

// **Delete User (Admin)**
app.delete('/admin/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        await UserModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

// **Error handling middleware**
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large' });
        }
    }
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});