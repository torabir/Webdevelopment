import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Advert } from '../logic/Advert';
import { db } from '../config/firebase';
import { User } from '../logic/User';
import { uploadImageToCloudinary } from "./UploadService";


export class AdvertService {
    // Create
    static async createAdvert(advert: Advert): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'adverts'), {
                title: advert.getTitle(),
                tekstblokk: advert.getTekstblokk(),
                price: advert.getPrice(),
                username: advert.getUser().getUsername(),
                email: advert.getEmail(),
                tag: advert.getTag(),
                unavailableDates: Array.from(advert.getUnavailableDates()),
                imageUrl: advert.getImageUrl() || null,
                city: advert.getCity()
            });
    
            console.log("✅ Annonse opprettet i Firestore med ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("❌ Feil ved opprettelse av annonse i Firestore:", error);
            throw error;
        }
    }
    

    // Read
    static async getAdvertById(id: string): Promise<Advert | null> {
        try {
            const docSnap = await getDoc(doc(db, 'adverts', id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                const user = new User(data.username, "", "", 0, data.email, ""); // ✅ Bruk User-objekt
                return new Advert(
                    docSnap.id,
                    data.title,
                    data.tekstblokk,
                    data.price,
                    user, 
                    data.tag,
                    new Set(data.unavailableDates), 
                    data.email, 
                    data.imageUrl || null,
                    data.city
                );
            }
            return null;
        } catch (error) {
            throw new Error(`Kunne ikke hente annonse: ${error}`);
        }
    }

    // Update
    static async updateAdvert(id: string, advert: Advert): Promise<void> {
        try {
            await updateDoc(doc(db, 'adverts', id), {
                title: advert.getTitle(),
                tekstblokk: advert.getTekstblokk(),
                price: advert.getPrice(),
                username: advert.getUser().getUsername(),
                tag: advert.getTag(),
                unavailableDates: Array.from(advert.getUnavailableDates()),
                city: advert.getCity()
            });
        } catch (error) {
            throw new Error(`Kunne ikke oppdatere annonse: ${error}`);
        }
    }

    // Delete
    static async deleteAdvert(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'adverts', id));
        } catch (error) {
            throw new Error(`Kunne ikke slette annonse: ${error}`);
        }
    }

    // Hent alle annonser
    static async getAllAdverts(): Promise<Advert[]> {
        try {
            const querySnapshot = await getDocs(collection(db, 'adverts'));
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                const user = new User(data.username, "", "", 0, data.email, ""); // flyttet hit
                return new Advert(
                    doc.id,
                    data.title,
                    data.tekstblokk,
                    data.price,
                    user,
                    data.tag,
                    new Set(data.unavailableDates), 
                    data.email,
                    data.imageUrl || null,
                    data.city
                );
            });
        } catch (error) {
            throw new Error(`Kunne ikke hente annonser: ${error}`);
        }
    }

    //Filtrering av adverts
    static async searchAdvertsByTags(tags: string[]): Promise<Advert[]> {
        try {
            const allAdverts = await AdvertService.getAllAdverts(); 
    
            return allAdverts.filter(advert =>
                tags.some(tag => advert.getTag().includes(tag)) 
            );
    
        } catch (error) {
            throw new Error(`Kunne ikke søke i annonser: ${error}`);
        }
    }

    //Upload image
    static async uploadImage(advertId: string, file: File): Promise<string> {
        try {
            console.log(`🔄 Laster opp til Cloudinary for advertId: ${advertId}`);
            const imageUrl = await uploadImageToCloudinary(file);
            console.log("Cloudinary URL mottatt:", imageUrl);
            return imageUrl;
        } catch (error) {
            throw new Error(`Kunne ikke laste opp bilde til Cloudinary: ${error}`);
        }
    }
        
    
        // static async updateAdvertImage(advertId: string, imageUrl: string): Promise<void> {
        //     try {
        //       await updateDoc(doc(db, 'adverts', advertId), { imageUrl });
        //     } catch (error) {
        //       throw new Error(`Kunne ikke oppdatere bilde for annonse: ${error}`);
        //     }
        //   }

    static async updateAdvertImage(advertId: string, imageUrl: string): Promise<void> {
        try {
            console.log(`🔄 Oppdaterer imageUrl i Firestore for advertId: ${advertId}`);
            console.log(`📸 Ny imageUrl: ${imageUrl}`);
    
            await updateDoc(doc(db, 'adverts', advertId), { imageUrl });
    
            console.log("Firestore oppdatert med imageUrl!");
        } catch (error) {
            console.error("Feil ved oppdatering av imageUrl:", error);
        }
    }
        
            // Hent annonser basert på e-post
    static async getAdvertsByUserEmail(email: string): Promise<Advert[]> {
        try {
            const q = query(collection(db, 'adverts'), where("email", "==", email));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                const user = new User(data.username, "", "", 0, data.email, ""); 
                return new Advert(
                    doc.id,
                    data.title,
                    data.tekstblokk,
                    data.price,
                    user,
                    data.tag,
                    new Set(data.unavailableDates),
                    data.email,
                    data.imageUrl || null,
                    data.city
                );
            });
        } catch (error) {
            throw new Error(`Kunne ikke hente annonser for e-post ${email}: ${error}`);
        }
    }

    // Oppdater en annonse basert på ID
    static async updateAdvertById(advertId: string, updatedData: Partial<Advert>): Promise<void> {
        try {
            await updateDoc(doc(db, 'adverts', advertId), updatedData);
            console.log("Annonse oppdatert:", updatedData);
        } catch (error) {
            console.error("Feil ved oppdatering av annonse:", error);
            throw new Error(`Kunne ikke oppdatere annonse: ${error}`);
        }
    }

    // Slett en annonse basert på ID
    static async deleteAdvertById(advertId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'adverts', advertId));
            console.log("Annonse slettet:", advertId);
        } catch (error) {
            console.error("Feil ved sletting av annonse:", error);
            throw new Error(`Kunne ikke slette annonse: ${error}`);
        }
    }

    
    static async getAdvertsByCity(city: string): Promise<Advert[]> {
        try {
            const q = query(collection(db, 'adverts'), where("city", "==", city));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                const user = new User(data.username, "", "", 0, data.email, "");
                return new Advert(
                    doc.id,
                    data.title,
                    data.tekstblokk,
                    data.price,
                    user,
                    data.tag,
                    new Set(data.unavailableDates),
                    data.email,
                    data.imageUrl || null,
                    data.city || null
                );
            });
        } catch (error) {
            throw new Error(`Kunne ikke hente annonser for by ${city}: ${error}`);
        }
    }
}
