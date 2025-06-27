const express = require('express');
const router = express.Router();
const GroupModel = require('../models/GroupModel');
const UserModel = require('../models/UserModel');
const NotificationModel = require('../models/NotificationModel');
const { sendGroupNotification } = require('../services/emailService');

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Send notification to group members
router.post('/send-group-notification', verifyAdmin, async (req, res) => {
    try {
        const { groupId, subject, message } = req.body;
        
        if (!groupId || !subject || !message) {
            return res.status(400).json({ 
                message: 'Group ID, subject, and message are required' 
            });
        }
        
        // Get group with members populated
        const group = await GroupModel.findById(groupId)
            .populate('members', 'name email')
            .populate('creator', 'name');
            
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        if (group.members.length === 0) {
            return res.status(400).json({ message: 'No members in this group to notify' });
        }
        
        // Send emails
        const emailResult = await sendGroupNotification(
            group.members,
            subject,
            message,
            group.title
        );
        
        // Save notification record
        const notification = new NotificationModel({
            groupId: groupId,
            subject: subject,
            message: message,
            sentBy: req.user.userId,
            recipients: group.members.map(member => member._id),
            status: 'sent'
        });
        
        await notification.save();
        
        res.json({
            message: `Notification sent successfully to ${emailResult.count} members`,
            notificationId: notification._id,
            recipientCount: emailResult.count
        });
        
    } catch (error) {
        console.error('Notification sending error:', error);
        
        // Save failed notification record
        if (req.body.groupId && req.body.subject && req.body.message) {
            try {
                const failedNotification = new NotificationModel({
                    groupId: req.body.groupId,
                    subject: req.body.subject,
                    message: req.body.message,
                    sentBy: req.user.userId,
                    recipients: [],
                    status: 'failed'
                });
                await failedNotification.save();
            } catch (saveError) {
                console.error('Failed to save notification record:', saveError);
            }
        }
        
        res.status(500).json({ 
            message: 'Failed to send notification', 
            error: error.message 
        });
    }
});

// Get notification history for admin
router.get('/history', verifyAdmin, async (req, res) => {
    try {
        const notifications = await NotificationModel.find()
            .populate('groupId', 'title')
            .populate('sentBy', 'name')
            .populate('recipients', 'name email')
            .sort({ sentAt: -1 })
            .limit(50); // Limit to last 50 notifications
            
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching notification history', 
            error: error.message 
        });
    }
});

// Get notifications for a specific group
router.get('/group/:groupId', verifyAdmin, async (req, res) => {
    try {
        const notifications = await NotificationModel.find({ groupId: req.params.groupId })
            .populate('sentBy', 'name')
            .populate('recipients', 'name email')
            .sort({ sentAt: -1 });
            
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching group notifications', 
            error: error.message 
        });
    }
});

module.exports = router;