import { Injectable } from '@angular/core';
import {CollectionService} from "./collection-service";

@Injectable({
  providedIn: 'root'
})
export class StepService extends CollectionService {

  constructor() {
    super();

    this.collectionName = 'Steps';
  }
}
