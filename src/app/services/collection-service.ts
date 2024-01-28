import {getFirestore, doc, setDoc, getDoc, where, collection, query, getDocs, addDoc, deleteDoc, orderBy} from "firebase/firestore";
import {Injectable} from "@angular/core";
import {IUser} from "../interfaces/i-user";
import {Firestore} from "@angular/fire/firestore";
import firebase from "firebase/compat";
import WhereFilterOp = firebase.firestore.WhereFilterOp;

@Injectable({
  providedIn: 'root'
})
export abstract class CollectionService {

  protected collectionName: string = '';
  protected db: Firestore

  constructor() {
    this.db = getFirestore();
  }

  public add(document: any, collectionName?: string) {
    return addDoc(collection(this.db, collectionName ? collectionName : this.collectionName), document);
  }
  public set(id: string, document: any, collectionName?: string) {
    return setDoc(doc(this.db, collectionName ? collectionName : this.collectionName, id), document);
  }

  public get(id: string): Promise<any> {
    return getDoc(doc(this.db, this.collectionName, id)).then((snapshot) => {
      const user = <any>snapshot.data();
      user.id = snapshot.id;

      return (user);
    })
  }

  public remove(id: string, collectionName?: string) {
    return deleteDoc(doc(this.db, collectionName ? collectionName : this.collectionName, id));
  }

  public getAll(filters?: {key: string, opr: WhereFilterOp, value: string | number}[], order?: string, collectionName?: string): Promise<any[]> {
    const ref = collection(this.db, collectionName ? collectionName : this.collectionName);
    let q = query(ref);
    let queryFilters = [];

    if (filters) {

      for (let filter of filters) {
        queryFilters.push(where(filter.key, filter.opr, filter.value))
      }

    }

    if (order) {

      queryFilters.push(orderBy(order));
    }

    q = query(ref, ...queryFilters);

    return getDocs(q).then((snapshot) => {
      let docs: any[] = [];

      snapshot.docChanges().forEach((doc) => {
        let docData = (<any>doc.doc.data());
        docData.id = doc.doc.id;

        docs.push(docData);
      });

      return docs;
    })
  }
}
