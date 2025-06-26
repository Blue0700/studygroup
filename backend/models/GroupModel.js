const mongoose = require('mongoose');
const groupSchema = mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, default: 'pending' }, // 'pending', 'approved', 'rejected'
    createdAt: { type: Date, default: Date.now }
});

const groupData = mongoose.model('Group', groupSchema);
module.exports = groupData;