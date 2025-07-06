const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, default: 'pending' }, // 'pending', 'approved', 'rejected'
    // **NEW: Files array to store uploaded materials**
    files: [{
        originalName: String,
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const groupData = mongoose.model('Group', groupSchema);
module.exports = groupData;