import { User } from './User';

export class Advert {
    private id: string;
    private title: string;
    private tekstblokk: string;
    private price: number;
    private user: User;
    private tag: string | null;
    private unavailableDates: Set<Date>;
    private email: string; 
    private imageUrl: string | null;
    private city: string | null;
  
    constructor(
      id: string,
      title: string,
      tekstblokk: string,
      price: number,
      user: User,
      tag: string | null = null,
      unavailableDates: Set<Date>, 
      email: string,
      imageUrl: string | null = null,
      city: string | null = null
    ) {
      this.id = id;
      this.title = title;
      this.tekstblokk = tekstblokk;
      this.price = price;
      this.user = user;
      this.tag = tag;
      this.unavailableDates = unavailableDates;
      this.email = email;
      this.imageUrl = imageUrl;
      this.city = city;
    }
  
    getId(): string {
      return this.id;
    }
  
    getTitle(): string {
      return this.title;
    }
  
    getTekstblokk(): string {
      return this.tekstblokk;
    }
  
    getPrice(): number {
      return this.price;
    }
  
    getUser(): User {
      return this.user;
    }
  
    getTag(): string {
      return this.tag || "";
    }

    getEmail(): string {
      return this.email;
    }
    
    getCity(): string{
      return this.city || "";
    }
  
    setTitle(title: string): void {
      this.title = title;
    }
  
    setTekstblokk(tekstblokk: string): void {
      this.tekstblokk = tekstblokk;
    }
  
    setPrice(price: number): void {
      this.price = price;
    }
  
    setUser(user: User): void {
      this.user = user;
    }
  
    setTag(tag: string): void {
      this.tag = tag;
    }

    setCity(city: string): void{
      this.city = city;
    }
  
    addUnavailableTime(date: Date): void {
      this.unavailableDates.add(date);
    }
  
    removeUnavailableTime(date: Date): void {
      this.unavailableDates.delete(date);
    }
  
    isDateAvailable(date: Date): boolean {
      return !this.unavailableDates.has(date);
    }
  
    getUnavailableDates(): Set<Date> {
      return this.unavailableDates;
    }

    getImageUrl(): string {
      return this.imageUrl || "";
  }
  
  }
  