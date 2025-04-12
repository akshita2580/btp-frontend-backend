const express = require('express');
const mongoose = require('mongoose');
const Contact = require('./models/contact');
const cors = require('cors');
require('dotenv').config(); 
const app = express();

app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.error('MongoDB connection error:', err));
  app.get('/', (req, res) => {
    res.send('Server is up and running 🚀');
  });
  

  app.get('/api/contacts/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const userContacts = await Contact.findOne({ userId });
      res.json(userContacts?.contacts || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Add a new contact
  app.post('/api/contacts/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, phone, relation } = req.body;
   console.log("user id is:",userId)
    try {
      let userContacts = await Contact.findOne({ userId });
  
      if (!userContacts) {
        userContacts = new Contact({ userId:userId, contacts: [] });
      }
  
      userContacts.contacts.push({ name, phone, relation });
      await userContacts.save();
  
      res.status(201).json(userContacts.contacts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Start server
  app.listen(5000, () => {
    console.log('Server started on port 5000');
  });