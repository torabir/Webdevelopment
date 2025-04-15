import { auth } from "config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const register_user = async (email: string, password: string) => {
    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        return userCredentials.user;
    } catch (err) {
        throw err;
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        return userCredentials.user;
    } catch (err) {
        throw err;
    }
};

export const signingOut = async () => {
    try {
        await signOut(auth);
        return 
    }
    catch(err) {
        console.error(err);
    }
}
