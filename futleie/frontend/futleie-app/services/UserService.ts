import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { User } from '../logic/User';
import { db } from '../config/firebase';

export class UserService {
    // Create
    static async createUser(user: User): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'users'), {
                username: user.getUsername(),
                firstName: user.getFirstName(),
                surName: user.getSurName(),
                tlf: user.getTlf(),
                email: user.getEmail(),
                address: user.getAddress(),
                myAdvertIds: user.getMyAdvertIds()
            });
            return docRef.id;
        } catch (error) {
            throw new Error(`Kunne ikke opprette bruker: ${error}`);
        }
    }

    // Read
    static async getUserById(id: string): Promise<User | null> {
        try {
            const docSnap = await getDoc(doc(db, 'users', id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                return new User(
                    data.username,
                    data.firstName,
                    data.surName,
                    data.tlf,
                    data.email,
                    data.address
                );
            }
            return null;
        } catch (error) {
            throw new Error(`Kunne ikke hente bruker: ${error}`);
        }
    }

    // Update
    static async updateUser(id: string, user: User): Promise<void> {
        try {
            await updateDoc(doc(db, 'users', id), {
                username: user.getUsername(),
                firstName: user.getFirstName(),
                surName: user.getSurName(),
                tlf: user.getTlf(),
                email: user.getEmail(),
                address: user.getAddress(),
                myAdvertIds: user.getMyAdvertIds()
            });
        } catch (error) {
            throw new Error(`Kunne ikke oppdatere bruker: ${error}`);
        }
    }

    // Update user by email (instead of ID)
    static async updateUserByEmail(email: string, updatedData: Record<string, any>): Promise<void> {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                throw new Error("Bruker ikke funnet.");
            }
            const userDoc = querySnapshot.docs[0];
            const userRef = doc(db, 'users', userDoc.id);
            await updateDoc(userRef, updatedData);
        } catch (error) {
            throw new Error(`Kunne ikke oppdatere bruker: ${error}`);
        }
    }
    


    // Delete
    static async deleteUser(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'users', id));
        } catch (error) {
            throw new Error(`Kunne ikke slette bruker: ${error}`);
        }
    }

    // Hent alle brukere
    static async getAllUsers(): Promise<User[]> {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return new User(
                    data.username,
                    data.firstName,
                    data.surName,
                    data.tlf,
                    data.email,
                    data.address
                );
            });
        } catch (error) {
            throw new Error(`Kunne ikke hente brukere: ${error}`);
        }
    }

    // Finn bruker med e-post
    static async getUserByEmail(email: string): Promise<User | null> {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
        
            
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                return new User(
                    data.username,
                    data.firstName,
                    data.surName,
                    data.tlf,
                    data.email,
                    data.address
                );
            }
            return null;
        } catch (error) {
            throw new Error(`Kunne ikke finne bruker med e-post: ${error}`);
        }
    }
    
} 