const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');


router.get('/', async (req, res) => {
  const conversations = await Conversation.find();
  res.json(conversations);
});


router.get('/:id', async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  res.json(conversation);
});


router.post('/', async (req, res) => {
  const newConversation = new Conversation(req.body);
  const savedConversation = await newConversation.save();
  res.json(savedConversation);
});


router.put('/:id', async (req, res) => {
  const { prompt, response } = req.body;
  const updatedConversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    { $push: { history: { prompt, response } } },
    { new: true }
  );
  res.json(updatedConversation);
});
router.delete('/:chatId', async (req, res) => {
  const { chatId } = req.params;

  try {
    const result = await Conversation.findByIdAndDelete(chatId);

    if (!result) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});
module.exports = router;
