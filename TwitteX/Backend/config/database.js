// Importer Mongoose-pakken for å håndtere MongoDB-tilkobling
const mongoose = require('mongoose');

// Opprett en asynkron funksjon for å koble til MongoDB-databasen
const connectDB = async () => {
  try {
    // Bruk mongoose.connect til å koble til MongoDB ved hjelp av URI fra miljøvariabler
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,  // Bruk den nye URL-parseren som er anbefalt for stabilitet
      useUnifiedTopology: true, // Bruk den nye enhetlige topologimotoren for å håndtere tilkoblinger
    });
    console.log('MongoDB connected'); // Logg til konsollen når tilkoblingen er vellykket
  } catch (err) {
    console.error(err.message); // Hvis tilkoblingen feiler, logg feilmeldingen
    process.exit(1); // Avslutt prosessen med en feilkode (1) hvis tilkoblingen mislykkes
  }
};

// Eksporter funksjonen slik at den kan brukes i andre filer
module.exports = connectDB;
