import { User } from '../logic/User';
import { Advert } from '../logic/Advert';
import { UserService } from '../services/UserService';
import { AdvertService } from '../services/AdvertService';

async function testDatabaseOperations() {
    try {
        // 1. Opprett en testbruker
        const testUser = new User(
            "testbruker1",
            "Test",
            "Testersen",
            12345678,
            "test@example.com",
            "Testveien 1"
        );
        
        console.log("Oppretter bruker...");
        const userId = await UserService.createUser(testUser);
        console.log("Bruker opprettet med ID:", userId);

        // 2. Hent brukeren for å verifisere
        const hentetBruker = await UserService.getUserByEmail("test@example.com");
        console.log("Hentet bruker:", hentetBruker?.getUsername());

        // 3. Opprett en annonse for brukeren
        const testAnnonse = new Advert(
            "Test Annonse",
            "Dette er en testannonse",
            1000,
            testUser,
            "bolig",
            new Set<Date>()
        );

        console.log("Oppretter annonse...");
        const annonseId = await AdvertService.createAdvert(testAnnonse);
        console.log("Annonse opprettet med ID:", annonseId);

        // 4. Hent alle annonser
        const alleAnnonser = await AdvertService.getAllAdverts();
        console.log("Antall annonser i databasen:", alleAnnonser.length);

        // 5. Oppdater annonsen
        testAnnonse.setPrice(1500);
        await AdvertService.updateAdvert(annonseId, testAnnonse);
        console.log("Annonse oppdatert");

        // 6. Slett test-dataene
        await AdvertService.deleteAdvert(annonseId);
        await UserService.deleteUser(userId);
        console.log("Test-data slettet");

    } catch (error) {
        console.error("Test feilet:", error);
    }
}

// Kjør testen
testDatabaseOperations().then(() => {
    console.log("Test fullført");
}).catch(error => {
    console.error("Test feilet:", error);
}); 