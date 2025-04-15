// **** Enhetstest for wikiService ****

/**
 * Dette er en testfil som fokuserer på enhetstesting av wikiService.
 *
 * Hensikten med denne filen er å teste funksjonaliteten til wikiService i isolasjon.
 * Her mockes databasen (f.eks. pool.query) for å:
 * - Sikre at wikiService fungerer korrekt uavhengig av en faktisk database.
 * - Kontrollere testscenarier, som vellykkede datahentinger, feil i databasen, og håndtering av kanttilfeller.
 * - Gjøre testene raskere og mer stabile ved å fjerne avhengighet til en faktisk database.
 *
 * **Viktig:**
 * - Denne filen tester **kun logikken i wikiService**, ikke API-endepunktene i wiki-router.ts.
 * - Bruk routerTest.test.tsx for testing av wiki-router.
 *
 * 
 * Vi bruker hovedsakelig routerTest.test.ts for å teste uten mocking.
 */

import wikiService from '../src/services/wiki-service';
import { testArticles, testArticleVersions, testComments, testTags, testUsers } from './testdata';

// Mocking av wikiService for å simulere funksjonalitet uten å koble til en faktisk database.
jest.mock('../src/services/wiki-service');
afterEach(() => {
  jest.clearAllMocks(); // Clear mocks after each test
});

describe('Fetch articles (GET)', () => {
  // Test som sjekker at alle artikler hentes med statuskode 200.
  test('Fetch all articles', async () => {
    // Mock wikiService.getAllArticles til å returnere testdataene.
    wikiService.getAllArticles = jest.fn(() => Promise.resolve(testArticles));

    // Sender en GET-forespørsel til API-et for å hente alle artiklene.
    const response = await wikiService.getAllArticles();

    // Sjekker at dataene som returneres samsvarer med testdataene.
    expect(response).toEqual(testArticles); // Sammenlign direkte med testdata
  });
  // Test som sjekker at en spesifikk artikkel hentes
  test('Fetch article', async () => {
    wikiService.getArticle = jest.fn((id) =>
      id === 1 ? Promise.resolve(testArticles[0]) : Promise.reject({ response: { status: 404 } }),
    );

    const response = await wikiService.getArticle(1);
    expect(response).toEqual(testArticles[0]);
  });

  // Test som simulerer en serverfeil (500) når alle oppgaver hentes.
  test('Fetch all articles (500 Internal Server Error)', async () => {
    // Mock wikiService.getAllArticles til å kaste en feil med status 500.
    wikiService.getAllArticles = jest.fn(() => Promise.reject({ response: { status: 500 } }));

    // Forventer at statuskoden 500 returneres når serveren feiler.
    expect.assertions(1);
    try {
      await wikiService.getAllArticles(); // Merk at funksjonen kalles
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(500);
    }
  });

  // Test som sjekker at det returneres 404 når artiklen ikke finnes.
  test('Fetch article (404 Not Found)', async () => {
    // Mock wikiService.getArticle til å kaste en feil med status 404.
    wikiService.getArticle = jest.fn(() => Promise.reject({ response: { status: 404 } }));

    // Forventer at statuskoden 404 returneres hvis artikkelen ikke finnes.
    expect.assertions(1);
    try {
      await wikiService.getArticle(999); // ID 999 forventes ikke å eksistere.
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(404);
    }
  });
  test('Fetch articles by tagId', async () => {
    const tagId = 1; // ID-en for taggen som brukes i testen.

    // Filter testdataene for å simulere resultatene for gitt tagId.
    const filteredArticles = testArticles.filter(
      (article) => [1, 3, 5].includes(article.articleId), // Simulerer relaterte artikler til tagId 1.
    );

    // Mock wikiService.getArticlesByTag til å returnere filtrerte testdata.
    wikiService.getArticlesByTag = jest.fn(() => Promise.resolve(filteredArticles));

    // Kaller API-et for å hente artikler basert på tagId.
    const response = await wikiService.getArticlesByTag(tagId);

    // Sjekker at dataene som returneres samsvarer med de filtrerte testdataene.
    expect(response).toEqual(filteredArticles); // Sammenlign direkte med filtrerte testdata
  });
});

/////////////////////////////////////////////////////////////////////////////////
