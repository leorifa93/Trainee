import { Injectable } from '@angular/core';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() { }

  uploadFile(base64: string, name: string) {
    const storageRef = ref(getStorage(), 'steps/' + name);

    return uploadString(storageRef, base64, 'data_url').then(() => {
      return getDownloadURL(storageRef);
    })
  }

  async getPublicLink(name: string) {
    const storageRef = ref(getStorage(), "gs://marius-fitline.appspot.com/StartYourFuture.apk");

    console.log(await getDownloadURL(storageRef));
  }
}
