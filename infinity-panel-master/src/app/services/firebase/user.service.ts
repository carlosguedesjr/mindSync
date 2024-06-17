import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { User } from 'src/app/models/user';
import { FirebaseAbstract } from './abstract';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends FirebaseAbstract<User> {

  static collectionName = 'users';

  constructor(
    private _api: ApiService,
    protected db: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    super(db, UserService.collectionName);
  }

  async add(data: User): Promise<string> {
    return this._api.post('users', data).then(res => res.user.id);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    return this._api.put(`users/${id}`, data).then(_ => null);
  }

  uploadImage(id: string, file: Blob | File): Promise<string> {
    return new Promise(resolve => {
      const url = `${UserService.collectionName}/${id}.png`;
      this.afStorage.ref(url).put(file).then(async (res) => {
        const imageUrl = await res.ref.getDownloadURL();
        await this.update(id, {image: imageUrl});
        resolve(imageUrl);
      });
    });
  }

  deleteImage(id: string): Promise<boolean> {
    return new Promise(resolve => {
      const url = `${UserService.collectionName}/${id}.png`;
      this.afStorage.ref(url).delete().subscribe(async _ => {
        await this.update(id, {image: null});
        resolve(true);
      });
    });
  }
}
