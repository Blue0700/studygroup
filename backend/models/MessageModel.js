const mongoose = require('mongoose');
const messageSchema = mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    fileUrl: String, // For study materials
    createdAt: { type: Date, default: Date.now }
});

const messageData = mongoose.model('Message', messageSchema);
module.exports = messageData;