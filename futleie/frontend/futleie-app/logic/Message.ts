

export class Message {
    private senderEmail: string;
    private receiverEmail: string;
    private text: string;
    private messageTimestamp: Date;

    constructor (senderEmail: string, receiverEmail: string, text: string, messageTimestamp: Date) {
        this.senderEmail = senderEmail;
        this.receiverEmail = receiverEmail;
        this.text = text;
        if (messageTimestamp == null) {
            this.messageTimestamp = new Date();
        }
        else {
            this.messageTimestamp = messageTimestamp;
        }
    }
    getSenderEmail(): string {
        return this.senderEmail;
    }
    getReceiverEmail(): string {
        return this.receiverEmail;
    }
    getText(): string {
        return this.text;
    }
    getMessageTimestamp(): Date {
        return this.messageTimestamp;
    }
}