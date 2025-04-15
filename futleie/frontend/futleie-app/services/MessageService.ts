import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, or, and, Timestamp} from 'firebase/firestore';
import { db } from '../config/firebase';

import { Message } from '../logic/Message';


export class MessageService {
    static async createMessage(message: Message): Promise<void> {
        try {
            const docRef = await addDoc(collection(db, 'messages'), {
                senderMail: message.getSenderEmail(),
                receiverMail: message.getReceiverEmail(),
                text: message.getText(),
                timestamp: Timestamp.fromDate(message.getMessageTimestamp())
            });
        }
        catch (error) {
            throw new Error(`Could not create messages: ${error}`);
        }
    }

    static async getMessagesBetweenMails(email: string, email2: string): Promise<Message[]> {
        try {
            const q = query(collection(db, 'messages'), or(
                        and(where("senderMail", "==", email), 
                            where("receiverMail", "==", email2)),
                        and(where("senderMail", "==", email2), 
                            where("receiverMail", "==", email))
                )
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return new Message(data.senderMail, data.receiverMail, data.text, data.timestamp.toDate());
            });
        }
        catch (error) {
            throw new Error(`Could not fetch messages from the sender and receiver ${error}`);
        }
    }


    // Returns a set of all emails that the email in the input either has sent or received messages from
    static async getEmailsFromMessages(email: string): Promise<Set<string>> {
        try {
            const q = query(collection(db, 'messages'),
                or(where("senderMail", "==", email), 
                    where("receiverMail", "==", email)));
    
        const querySnapshot = await getDocs(q);
        const emails = new Set<string>();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            emails.add(data.senderMail);
            emails.add(data.receiverMail);
        })
        emails.delete(email);
        return emails;
        }
        catch (error) {
            throw new Error(`Could not fetch emails ${error}`);
        }
    }

    // static async deleteMessage(id: string): Promise<void> {

    // }
     
}