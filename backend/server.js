require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const conversationsRoutes = require('./routes/conversations');

const app = express();

app.use(express.json());
app.use(cors());


connectDB();
app.use('/api/conversations', conversationsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
