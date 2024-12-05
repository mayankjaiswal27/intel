const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  chat_name: String,
  history: [
    {
      prompt: String,
      response: String,
    },
  ],
});

module.exports = mongoose.model('Conversation', conversationSchema);
