import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { FirebaseAbstract } from '../abstract';
import { Company } from 'src/app/models/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends FirebaseAbstract<Company> {

  static collectionName = 'companies';

  constructor(
    protected db: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    super(db, CompanyService.collectionName);
  }

  uploadImage(id: string, file: Blob | File): Promise<string> {
    return new Promise(resolve => {
      const url = `${CompanyService.collectionName}/${id}.png`;
      this.afStorage.ref(url).put(file).then(async (res) => {
        resolve(await res.ref.getDownloadURL());
      });
    });
  }

  deleteImage(id: string): Promise<boolean> {
    return new Promise(resolve => {
      const url = `${CompanyService.collectionName}/${id}.png`;
      this.afStorage.ref(url).delete().subscribe(async _ => {
        await this.update(id, {image: null});
        resolve(true);
      });
    });
  }
}
