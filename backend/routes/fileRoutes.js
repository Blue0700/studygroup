const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const GroupModel = require('../models/GroupModel');
const fileMiddleware = require('../middleware/fileMiddleware');

// **Authentication Middleware**
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

// **Multer configuration for group files**
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/groups/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${req.params.groupId}_${uniqueSuffix}_${name}${ext}`);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: fileMiddleware.fileFilter
});

// **Upload file to group**
router.post('/groups/:groupId/files', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { groupId } = req.params;
        
        // Check if user is a member of the group
        const group = await GroupModel.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        if (!group.members.includes(req.user.userId)) {
            return res.status(403).json({ message: 'You must be a member of this group to upload files' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create file object
        const fileObject = {
            originalName: req.file.originalname,
            fileName: req.file.filename,
            fileUrl: `/uploads/groups/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedBy: req.user.userId,
            uploadedAt: new Date()
        };

        // Add file to group
        group.files.push(fileObject);
        await group.save();

        // Return the uploaded file info
        const uploadedFile = group.files[group.files.length - 1];
        await uploadedFile.populate('uploadedBy', 'name');

        res.json({
            message: 'File uploaded successfully',
            file: uploadedFile
        });

    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up uploaded file if database operation fails
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads/groups/', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(500).json({ message: 'Failed to upload file', error: error.message });
    }
});

// **Get all files for a group**
router.get('/groups/:groupId/files', async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const group = await GroupModel.findById(groupId)
            .populate('files.uploadedBy', 'name')
            .select('files');
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group.files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Failed to fetch files', error: error.message });
    }
});

// **Download file**
router.get('/groups/:groupId/files/:fileId/download', async (req, res) => {
    try {
        const { groupId, fileId } = req.params;
        
        const group = await GroupModel.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const file = group.files.id(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '../uploads/groups/', file.fileName);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimeType);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download file', error: error.message });
    }
});

// **Delete file**
router.delete('/groups/:groupId/files/:fileId', verifyToken, async (req, res) => {
    try {
        const { groupId, fileId } = req.params;
        
        const group = await GroupModel.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const file = group.files.id(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if user can delete this file (uploader or group creator)
        if (file.uploadedBy.toString() !== req.user.userId && group.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete files you uploaded or if you are the group creator' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../uploads/groups/', file.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove file from group
        group.files.pull(fileId);
        await group.save();

        res.json({ message: 'File deleted successfully' });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
});

// **Get file info**
router.get('/groups/:groupId/files/:fileId', async (req, res) => {
    try {
        const { groupId, fileId } = req.params;
        
        const group = await GroupModel.findById(groupId)
            .populate('files.uploadedBy', 'name')
            .select('files');
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const file = group.files.id(fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.json(file);
        
    } catch (error) {
        console.error('Error fetching file info:', error);
        res.status(500).json({ message: 'Failed to fetch file info', error: error.message });
    }
});

module.exports = router;