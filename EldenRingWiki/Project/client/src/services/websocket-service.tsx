// This file is the basis for the web-socket functionality. 

//The websocket allows many users to edit the same article at the same time (such as a community project)

import { DataMessage } from '../pages/EditArticle';

export class Subscription {
  onopen: () => void = () => {};
  onmessage: (message: DataMessage) => void = () => {};
  onclose: (code: number, reason: string) => void = () => {};
  onerror: (error: Error) => void = () => {};
}

class WebsocketService {
  private connection: WebSocket;
  private subscriptions = new Set<Subscription>();

  constructor() {
    this.connection = new WebSocket('ws://localhost:3000/api/v2/editarticle');

    this.connection.onopen = () => {
      this.subscriptions.forEach((subscription) => subscription.onopen());
    };

    this.connection.onmessage = (event) => {
      const data: DataMessage = JSON.parse(event.data);
      this.subscriptions.forEach((subscription) => subscription.onmessage(data));
    };

    this.connection.onclose = (event) => {
      this.subscriptions.forEach((subscription) => subscription.onclose(event.code, event.reason));
    };

    this.connection.onerror = () => {
      const error = new Error('WebSocket connection error.');
      console.log('onerror triggered:', error); // Legg til logging for feilsøking
      this.subscriptions.forEach((subscription) => {
        if (subscription.onerror) {
          subscription.onerror(error); // Sørg for at callback kalles med feil
        }
      });
    };
  }

  subscribe(): Subscription {
    const subscription = new Subscription();
    this.subscriptions.add(subscription);

    if (this.connection.readyState === WebSocket.OPEN) {
      setTimeout(() => subscription.onopen(), 0);
    }

    return subscription;
  }

  unsubscribe(subscription: Subscription) {
    this.subscriptions.delete(subscription);
  }

  send(message: DataMessage) {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Message not sent:', message);
    }
  }
}

const websocketService = new WebsocketService();
export default websocketService;

//This code was developed by the lectures in DCST2002
//OpenAI was used to help isolate editing many articles at the same time since no other info about 
//this was found.
