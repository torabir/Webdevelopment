import { Advert } from "./Advert";

export class User {
    private username: string;
    private firstName: string;
    private surName: string;
    private tlf: number;
    private email: string;
    private address: string;
    private myAdvertIds: string[] = [];
  
    constructor(
      username: string,
      firstName: string,
      surName: string,
      tlf: number,
      email: string,
      address: string
    ) {
      if (username == null || firstName == null || surName == null || tlf == null || email == null || address == null) {
        throw new Error("Input in user cant be null")
      }
      this.username = username;
      this.firstName = firstName;
      this.surName = surName;
      this.tlf = tlf;
      this.email = email;
      this.address = address;
    }
  
    addAdvertId(advertId: string): void {
      if (!advertId) {
        throw new Error("Kan ikke legge til null som annonse-ID");
      }
      this.myAdvertIds.push(advertId);
    }
  
    removeAdvertId(advertId: string): void {
      if (!advertId) {
        throw new Error("Annonse-ID er null i removeAdvertId");
      }
      const index = this.myAdvertIds.indexOf(advertId);
      if (index === -1) {
        throw new Error("Annonse-ID som skal slettes finnes ikke i listen");
      }
      this.myAdvertIds.splice(index, 1);
    }
  
    getFirstName(): string {
      return this.firstName;
    }
  
    getSurName(): string {
      return this.surName;
    }
  
    getUsername(): string {
      return this.username;
    }
  
    getTlf(): number {
      return this.tlf;
    }
  
    getEmail(): string {
      return this.email;
    }
  
    getAddress(): string {
      return this.address;
    }
  
    getMyAdvertIds(): string[] {
      return [...this.myAdvertIds];
    }
  
    setUsername(username: string): void {
      this.username = username;
    }
  
    setTlf(tlf: number): void {
      this.tlf = tlf;
    }
  
    setEmail(email: string): void {
      this.email = email;
    }
  
    setAddress(address: string): void {
      this.address = address;
    }
  
    setFirstName(firstName: string): void {
      this.firstName = firstName;
    }
  
    setSurName(surName: string): void {
      this.surName = surName;
    }
  }