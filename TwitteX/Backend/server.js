// --Oppretter en express app som lytter til en spesifikk port--
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Last inn miljøvariabler fra .env-filen
dotenv.config();

// Initialiser Express-appen
const app = express();

// Bruk body-parser for å parse JSON forespørsler
app.use(bodyParser.json());

// Importer ruter
const authRoutes = require('./routes/auth'); // Sørg for at denne peker riktig

// Bruk ruter
app.use('/api/auth', authRoutes);

// Koble til MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Sett opp port fra miljøvariabel, eller bruk 5000 som standard
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// const dotenv = require('dotenv');
// dotenv.config(); // Dette må være øverst, før du bruker process.env

console.log('Server file loaded');
console.log(process.env.MONGO_URI);
console.log(process.env.PORT);
console.log(process.env.JWT_SECRET);

console.log('Mongo URI:', process.env.MONGO_URI);
console.log('Port:', process.env.PORT);
console.log('JWT Secret:', process.env.JWT_SECRET);

