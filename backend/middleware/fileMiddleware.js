const multer = require('multer');
const path = require('path');
const fs = require('fs');

// **File validation and storage configuration**
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
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// **File filter for allowed types**
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, PPT, DOC, XLS, images, and videos are allowed.'), false);
    }
};

// **File upload configuration**
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// **File validation middleware**
const validateFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Additional validation can be added here
    next();
};

module.exports = { upload, validateFile };