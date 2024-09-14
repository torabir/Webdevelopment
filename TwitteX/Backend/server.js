// Linje 5 - 30: Oppretter en express add som lytter til en spesifikk port
// Linje 30 - 


// Importer nødvendige pakker
const express = require('express'); // Express er et rammeverk for å lage APIer og håndtere HTTP-forespørsler.
const mongoose = require('mongoose'); // Mongoose brukes til å koble til og håndtere MongoDB-databasen.
const cors = require('cors'); // CORS lar serveren håndtere forespørsler fra andre domener (for frontend/backend-kommunikasjon).

// Opprett en Express-applikasjon
const app = express();

// Middleware som lar Express håndtere JSON-data i forespørselskroppen
app.use(express.json());

// Aktiver CORS slik at APIet kan motta forespørsler fra frontend-applikasjoner på andre domener
app.use(cors());

// Definer en grunnleggende rute for å teste om serveren kjører
app.get('/', (req, res) => {
  res.send('Twitter Clone Backend is running'); // Returnerer en enkel melding når du besøker rot-URLen ("/").
});

// Definer porten serveren skal kjøre på (bruker miljøvariabelen PORT hvis den finnes, ellers 5000)
const PORT = process.env.PORT || 5000;

// Start serveren og lyt på den definerte porten
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Logger til konsollen at serveren kjører.
});

