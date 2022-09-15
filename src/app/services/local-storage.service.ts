import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const Storage = Preferences

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(

  ) { }
    public async check(id:string){
    return (await this.getKeys()).keys.includes(id)
    }

    //  To set an item, use set(key, value):
    public async set(key:string,value:{}) {
      if (await this.get(key) == null) {
        await Storage.set({  key,  value:JSON.stringify(value)  });
      }// else { this element exist }
    }
      //To get the item back, use get(name):
    public async get(key: string) {
      let data = await Storage.get({ key: key });
      return JSON.parse(data.value);
    }
      // to update element insert
    public async update(key:string,value:{}){
      if (await this.get(key) != null) {
        await Storage.set({  key,  value:JSON.stringify(value)  });
      }else{
        await this.set(key, value);
      }
    }
      //To remove an item:
    public async remove(key: string) {
      await Storage.remove({key:key});
    }
       //To clear all items:
    public async clear() {
      await Storage.clear();
    }
       //To get all keys stored:
    public async getKeys() {
      return await Storage.keys()
    }
  }
