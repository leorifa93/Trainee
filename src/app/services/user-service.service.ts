import {Injectable} from '@angular/core';
import {CollectionService} from "./collection-service";
import {doc, onSnapshot} from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class UserService extends CollectionService {

  observer: any;

  constructor() {
    super();

    this.collectionName = "Users";
  }

  startObserver(userId: string, callback: (user: any) => void) {
    this.observer = onSnapshot(doc(this.db, this.collectionName, userId), (doc) => {
      callback(doc.data());
    });
  }

  stopObserver() {
    if (this.observer) {
      this.observer();
    }
  }

  iTPNumberExists(tpNumber: number) {

  }
}
