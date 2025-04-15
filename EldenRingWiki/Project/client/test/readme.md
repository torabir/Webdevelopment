# Testing notater

# English: 

## Testing Strategy: Mocking in Client Tests and Real Data in Server Tests

### Overview
Our testing strategy is designed to balance **speed**, **efficiency**, and **realism** by employing **mocking** in client-side tests and using real data in server-side tests. This approach aligns with widely accepted best practices in software testing while allowing for flexibility based on our project needs.

---

### Why Mocking is Used in Client Tests

1. **Isolation of Component Logic**:
   - Mocking isolates the component's logic from backend dependencies.
   - Example: When testing a login component, we focus on UI behavior and logic (e.g., form validation) without relying on real API responses.

2. **Speed and Efficiency**:
   - Mocking eliminates the need for real network requests, making tests faster and more reliable.
   - Example: Hundreds of frontend tests run more quickly with mocked API responses.

3. **Control Over Test Scenarios**:
   - Mocking allows us to simulate a wide range of API responses (success, failure, edge cases) without modifying backend behavior.
   - Example: Testing how the app handles a 404 error or a slow network response is straightforward with mocked APIs.

4. **Reduced External Dependencies**:
   - Tests are not dependent on the availability or stability of the backend.
   - Example: Frontend development and testing can continue even if the backend is under maintenance.

5. **Focus on Backend Testing for Realism**:
   - Realistic backend tests ensure that APIs are functional and reliable, reducing the need to validate backend behavior in client tests.

---

### Why We Test the Backend Without Mocking

1. **Realism**:
   - Testing without mocking ensures the backend APIs work as intended in a realistic environment, including interactions with the database.
   - Example: Fetching an article by ID validates that the server returns correct data from the database.

2. **End-to-End Validation**:
   - Testing the actual API ensures that the integration between backend logic and the database is robust and free of issues.

3. **Error Handling**:
   - By not mocking, we can test how the backend handles invalid requests, edge cases, and server errors.

4. **Confidence in API Stability**:
   - Comprehensive server-side tests ensure that the API behaves as expected, which reduces the need to retest this behavior on the frontend.

---

### Best Practices Alignment

This strategy adheres to best practices in testing by:

1. **Separating Unit, Integration, and E2E Tests**:
   - Unit and component tests on the client use mocking for speed and focus.
   - Server tests use real data for realistic validation.
   - End-to-end (E2E) tests can be added to validate the complete flow, from frontend to backend.

2. **Efficient Use of Resources**:
   - Mocking in frontend tests reduces complexity and resource consumption.
   - Realistic backend tests ensure high confidence in API reliability without duplicating effort.

3. **Flexibility**:
   - Mocking allows developers to test components independently of backend progress or availability.

---

### When Adjustments Are Needed

While this approach is robust, adjustments may be required in specific scenarios:
- **Complex Frontend-Backend Interactions**: Add more integration tests to validate communication between layers.
- **Independent Teams**: Use extra mocking for serverside tests if backend and frontend are developed separately.
- **Critical Flows**: Implement more E2E tests for essential user journeys (e.g., authentication or checkout processes).

---

### Conclusion

By combining mocking in client-side tests with real data in server-side tests, we achieve a balance between speed and realism. This strategy allows for rapid development and testing of frontend components while ensuring the backend is robust and reliable. For critical end-to-end workflows, additional E2E tests can be included to provide full system validation.

# Norsk: 

## Teststrategi: Mocking i Klienttester og Reelle Data i Servertester

### Oversikt
Vår teststrategi er designet for å balansere **hastighet**, **effektivitet** og **realisme** ved å bruke **mocking** i klienttester og ekte data i servertester. Denne tilnærmingen følger anerkjente beste praksiser innen programvaretesting og tilpasses våre prosjektbehov.

---

### Hvorfor Mocking Brukes i Klienttester

1. **Isolasjon av Komponentlogikk**:
   - Mocking isolerer komponentens logikk fra avhengigheter til backend.
   - Eksempel: Ved testing av en innloggingskomponent fokuserer vi på UI-opførsel og logikk (f.eks. validering av skjema) uten å avhenge av faktiske API-responser.

2. **Hastighet og Effektivitet**:
   - Mocking eliminerer behovet for reelle nettverkskall, noe som gjør testene raskere og mer stabile.
   - Eksempel: Hundrevis av frontend-tester kan kjøres raskere med mockede API-responser.

3. **Kontroll Over Testscenarioer**:
   - Mocking gir mulighet til å simulere en rekke API-responser (suksess, feil, edge cases) uten å endre backend-adferd.
   - Eksempel: Testing av hvordan appen håndterer en 404-feil eller et tregt nettverk blir enkelt med mockede API-kall.

4. **Reduserte Eksterne Avhengigheter**:
   - Tester er ikke avhengige av backendens tilgjengelighet eller stabilitet.
   - Eksempel: Frontend-utvikling og testing kan fortsette selv om backend er under vedlikehold.

5. **Fokus på Realisme i Backend-testing**:
   - Realistiske backend-tester sikrer at API-er fungerer som forventet, noe som reduserer behovet for å validere backend-adferd i klienttester.

---

### Hvorfor Vi Tester Backend Uten Mocking

1. **Realisme**:
   - Testing uten mocking sikrer at backend-API-er fungerer korrekt i et realistisk miljø, inkludert interaksjon med databasen.
   - Eksempel: Henting av en artikkel basert på ID validerer at serveren returnerer korrekt data fra databasen.

2. **Helhetlig Validering**:
   - Testing av det faktiske API-et sikrer at integrasjonen mellom backend-logikk og databasen er robust.

3. **Feilhåndtering**:
   - Ved å unngå mocking tester vi hvordan backend håndterer ugyldige forespørsler, edge cases og serverfeil.

4. **Trygghet i API-stabilitet**:
   - Omfattende servertester sikrer at API-adferden er pålitelig, noe som reduserer behovet for å teste dette på klientsiden.

---

### Samsvar med Beste Praksis

Denne strategien samsvarer med beste praksis ved å:

1. **Skille mellom Unit-, Integrasjons- og E2E-tester**:
   - Unit- og komponenttester på klientsiden bruker mocking for hastighet og fokus.
   - Servertester bruker reelle data for realistisk validering.
   - End-to-end (E2E)-tester kan legges til for å validere hele flyten, fra frontend til backend.

2. **Effektiv Ressursbruk**:
   - Mocking i frontend-tester reduserer kompleksitet og ressursbruk.
   - Realistiske servertester sikrer høy tillit til API-ene uten unødvendig dobbeltarbeid.

3. **Fleksibilitet**:
   - Mocking gir utviklere mulighet til å teste komponenter uavhengig av backend-progresjon eller tilgjengelighet.

---

### Når Justeringer Kan Være Nødvendige

Selv om denne tilnærmingen er robust, kan justeringer være nødvendig i visse tilfeller:
- **Komplekse Frontend-Backend-Interaksjoner**: Flere integrasjonstester kan være nødvendige for å validere kommunikasjon mellom lagene.
- **Uavhengige Team**: Ekstra mocking på backend kan være nyttig dersom frontend- og backend-utvikling skjer separat.
- **Kritiske Brukerflyter**: Flere E2E-tester kan implementeres for essensielle prosesser (f.eks. autentisering eller betalingsprosesser).

---

### Konklusjon

Ved å kombinere mocking i klienttester med reelle data i servertester oppnår vi en balanse mellom hastighet og realisme. Denne strategien gjør det mulig å raskt utvikle og teste frontend-komponenter samtidig som vi sikrer at backend er robust og pålitelig. For kritiske ende-til-ende-arbeidsflyter kan E2E-tester legges til for full systemvalidering.

## This test strategy was summarized by chatGPT based on promts and test-files. 

### Noen biblioteker, Quill, css, images, osv, fører til problemer ved testing i Jest. Disse modelene er lagt til som unntak i package.json, slik: 

  "jest": {
    "testEnvironment": "jsdom",
    "snapshotSerializers": [
      "enzyme-to-json/serializer"
    ],
    "collectCoverage": true,
    "moduleNameMapper": {
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/test/fileMock.js",
      "\\.(css|less|scss)$": "identity-obj-proxy", 
      "^quill$": "<rootDir>/test/fileMock.js"
    }
  },

# KILDER CLIENT-TESTS: 

https://testing-library.com/docs/queries/byplaceholdertext/
https://www.freecodecamp.org/news/how-to-write-unit-tests-in-react/
https://www.freecodecamp.org/news/how-to-write-unit-tests-in-react/
https://jestjs.io/docs/jest-object
https://jestjs.io/docs/tutorial-async
https://jestjs.io/docs/asynchronous
https://reactrouter.com/en/main/router-components/memory-router
https://testing-library.com/docs/react-testing-library/intro/
https://angulardive.com/blog/the-ultimate-guide-to-frontend-testing-tips-tools-and-best-practices/
https://dev.to/radubrehar/the-best-testing-strategies-for-frontends-14k2
https://testsigma.com/blog/front-end-testing/
https://stackoverflow.com/questions/65725591/react-testing-library-how-to-use-waitfor
https://stackoverflow.com/questions/61482418/screen-vs-render-queries
https://medium.com/@navnit0707/component-vs-instance-vs-element-in-react-1f806cef1215
https://enzymejs.github.io/enzyme/docs/api/ShallowWrapper/dive.html
https://enzymejs.github.io/enzyme/docs/api/ReactWrapper/update.html
https://chatgpt.com/
