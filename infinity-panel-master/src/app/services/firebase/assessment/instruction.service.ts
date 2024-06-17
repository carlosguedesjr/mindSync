import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { FirebaseAbstract } from '../abstract';
import { Instruction } from 'src/app/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentInstructionService extends FirebaseAbstract<Instruction> {

  static collectionName = 'assessment-instructions';

  constructor(
    protected db: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    super(db, AssessmentInstructionService.collectionName);
  }

  uploadImage(id: string, file: Blob | File): Promise<string> {
    return new Promise(resolve => {
      const url = `${this.collectionName}/${id}.png`;
      this.afStorage.ref(url).put(file).then(async (res) => {
        resolve(await res.ref.getDownloadURL());
      });
    });
  }

  deleteImage(id: string): Promise<boolean> {
    return new Promise(resolve => {
      const url = `${this.collectionName}/${id}.png`;
      this.afStorage.ref(url).delete().subscribe(async _ => {
        resolve(true);
      });
    });
  }

  deleteImageByURL(url: string): Promise<boolean> {
    return new Promise(resolve => {
      this.afStorage.refFromURL(url).delete().subscribe(async _ => {
        resolve(true);
      });
    });
  }

  deleteAllImages(): Promise<boolean> {
    return new Promise(resolve => {
      this.afStorage.ref(this.collectionName).listAll().toPromise().then(async files => {
        for (const file of files.items) await file.delete();
        resolve(true);
      });
    });
  }
}
