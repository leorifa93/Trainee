import { Injectable } from '@angular/core';
import {IUser} from "../interfaces/i-user";
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private _storage: Storage;
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }
  public setUser(user: IUser) {
    return this._storage.set('user', user);
  }

  public getUser() {
    return this._storage.get('user');
  }
}
