const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    contactNumber: String,
    password: String,
    role: { type: String, default: 'user' }, // 'user' or 'admin'
    isBlocked: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, required: true, default: false }, // NEW: Terms acceptance field
    joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    createdAt: { type: Date, default: Date.now }
});

const userData = mongoose.model('User', userSchema);
module.exports = userData;