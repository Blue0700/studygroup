const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const GroupModel = require('../models/GroupModel');
const { upload, validateFile } = require('../middleware/fileMiddleware');

// **Authentication middleware (assuming it's defined in main app)**
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// **Upload file to group**
router.post('/groups/:id/files', verifyToken, upload.single('file'), validateFile, async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member of the group
        if (!group.members.includes(req.user.userId)) {
            return res.status(403).json({ message: 'You must be a member to upload files' });
        }

        const fileData = {
            originalName: req.file.originalname,
            fileName: req.file.filename,
            fileUrl: `/uploads/groups/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedBy: req.user.userId
        };

        group.files.push(fileData);
        await group.save();

        res.json({ 
            message: 'File uploaded successfully',
            file: fileData
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

// **Get group files**
router.get('/groups/:id/files', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.id)
            .populate('files.uploadedBy', 'name')
            .select('files');
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group.files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
});

// **Download file**
router.get('/groups/:groupId/files/:fileId/download', async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const file = group.files.id(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '../uploads/groups', file.fileName);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, file.originalName);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
});

// **Delete file (only by uploader or group creator)**
router.delete('/groups/:groupId/files/:fileId', verifyToken, async (req, res) => {
    try {
        const group = await GroupModel.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const file = group.files.id(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if user is the uploader or group creator
        if (file.uploadedBy.toString() !== req.user.userId && 
            group.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own files or files in your group' });
        }

        // Delete physical file
        const filePath = path.join(__dirname, '../uploads/groups', file.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from database
        group.files = group.files.filter(f => f._id.toString() !== req.params.fileId);
        await group.save();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
});

module.exports = router;