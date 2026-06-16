const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  readStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Post-save hook to emit real-time notification via Socket.io
NotificationSchema.post('save', function (doc) {
  if (global.io) {
    global.io.to(doc.userId.toString()).emit('notification', doc);
    console.log(`Real-time notification emitted to user room: ${doc.userId}`);
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);

