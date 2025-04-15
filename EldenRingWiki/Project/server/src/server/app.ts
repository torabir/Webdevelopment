import express from 'express';
import session from 'express-session';
import wikiRouter from '../controllers/wiki-router';
import passport from 'passport';

/**
 * Express application.
 */
const app = express();

// CHAT GPT HAR SKREVET FRA {

// ER FOR Å SETTE OPP SESSIONS OG COOKIES SLIT AT VI KAN LA BRUKERE LOGGE INN PÅ NETTSIDEN
// Middleware setup

// Set up express-session
app.use(
  session({
    secret: 'your-secret-key', // Change this to a secure key in production
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save a session even if it is new
    cookie: { maxAge: 60000 * 60 * 24, secure: false }, // DETTE BESTEMMER HVOR LENGE EN SESSION / COOKIE VARER, MED ANDRE ORD SÅ BESTEMMER DEN HVOR LENGE EN BRUKER KAN VÆRE PÅ LOGGET UTEN AT DEN MÅ LOGGE INN PÅ NYTT MANUELT
  }),
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// } TIL HIT

// Set the body parser to accept larger payloads
app.use(express.json({ limit: '10mb' })); // Adjust '10mb' to your desired limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Since API is not compatible with v1, API version is increased to v2
app.use('/api/v2', wikiRouter);

export default app;
