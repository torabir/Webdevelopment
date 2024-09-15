// -- Oppretter middleware som beskyttes rutene som behøver autotentisering
// Middleware er en funksjon som behandler forespørsler før de når rutehåndtereren.
// Det brukes til oppgaver som autentisering, logging og validering.
// Her sjekkes det om en gyldig JWT er tilstede før tilgang gis til beskyttede ruter. --


// Importer jwt (JSON Web Token) for å verifisere tokens
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Hent token fra headeren
  const token = req.header('x-auth-token');

  // Sjekk om token eksisterer
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verifiser token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Sett bruker fra token i req-objektet
    next(); // Gå videre til neste middleware/rute
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
