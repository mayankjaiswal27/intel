const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  chat_name: String,
  history: [
    {
      prompt: String,
      response: mongoose.Schema.Types.Mixed, // Changed to allow any type of object
    },
  ],
});

module.exports = mongoose.model('Conversation', conversationSchema);
