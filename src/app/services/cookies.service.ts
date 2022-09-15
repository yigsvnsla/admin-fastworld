import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class CookiesService {
  constructor(private cookieService: CookieService) {}

  public check(id: string) {
    return this.cookieService.check(id);
  }

  //  To set an item, use set(key, value):
  public set(id: string, value: any) {
    try {
      if (!this.cookieService.check(id)) {
        this.cookieService.set(id, JSON.stringify(value));
      } else {
        this.update(id,value);
      }
    } catch (error) {
      console.warn(error.message);
    }
  }
  //To get the item back, use get(name):
  public get(id: string) {
    return this.cookieService.check(id) ? JSON.parse(this.cookieService.get(id)) : null;
  }
  //To get all keys stored
  public getAll() {
    this.cookieService.deleteAll();
  }
  // to update element insert
  public update(id: string, value: any) {
    if (this.cookieService.check(id)) {      
      this.cookieService.set(id, JSON.stringify(value));
    }
  }

  //To remove an item
  public remove(id: string) {
    this.cookieService.delete(id);
  }

  //To clear all items:
  public clear() {
    this.cookieService.deleteAll();
  }
}
