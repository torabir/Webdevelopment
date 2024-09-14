// -- Opprett et brukerskjema med Mongoose for å håndtere brukerdata -- 

// Importer Mongoose-pakken for å lage en MongoDB-database modell
const mongoose = require('mongoose');

// Opprett et nytt bruker (User) skjema med Mongoose
// Dette skjemaet definerer hvordan brukerdata vil bli lagret i databasen
const UserSchema = new mongoose.Schema({
  // Brukernavn for hver bruker, som må være en streng, unik og påkrevd
  username: {
    type: String, // Datatypen er en streng (tekst)
    required: true, // Påkrevd felt - må være fylt ut
    unique: true, // Brukernavnet må være unikt i databasen
  },
  
  // E-postadresse for brukeren, også en streng, unik og påkrevd
  email: {
    type: String, // Datatype er en streng
    required: true, // Påkrevd felt - må være fylt ut
    unique: true, // E-postadressen må også være unik i databasen
  },
  
  // Passord for brukeren, som er påkrevd
  password: {
    type: String, // Datatype er en streng (passordet lagres vanligvis kryptert)
    required: true, // Påkrevd felt - må være fylt ut
  },

  // Profilbilde-URL for brukeren, ikke obligatorisk
  profile_image: String, // Valgfritt felt som lagrer URL for profilbildet
  
  // Biografi for brukeren, også valgfritt
  bio: String, // Valgfritt felt som kan inneholde en kort beskrivelse om brukeren

  // En liste over brukere som følger denne brukeren
  // Refererer til andre brukere i databasen ved bruk av deres ObjectId
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, // ObjectId refererer til en annen bruker
    ref: 'User' // Refererer til User-skjemaet for å lage en relasjon
  }],
  
  // En liste over brukere som denne brukeren følger
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, // ObjectId refererer til en annen bruker
    ref: 'User' // Referanse til User-skjemaet, for å lage en relasjon mellom brukere
  }],
});

// Eksporter User-modellen, som vil bli brukt til å samhandle med "users" i MongoDB
module.exports = mongoose.model('User', UserSchema);
