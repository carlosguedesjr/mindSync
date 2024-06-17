import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { StorageService } from '../storage.service';
import { Subscription } from 'src/app/models/subscription';
import { FirebaseAbstract, FirebaseWhere } from './abstract';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends FirebaseAbstract<Subscription> {

  static collectionName = 'subscriptions';

  constructor(
    protected db: AngularFirestore,
    private _storage: StorageService
  ) {
    super(db, SubscriptionService.collectionName);
  }

  async getByStudentId() {
    const studentId = this._storage.getUser.id;
    return this.getWhere('student.id', '==', studentId, 'createdAt', 'desc');
  }

  async getByStudentIdByAccessId(accessId: string): Promise<Subscription> {
    const studentId = this._storage.getUser.id;
    const where = [
      new FirebaseWhere('access.id', '==', accessId),
      new FirebaseWhere('student.id', '==', studentId),
    ];
    return this.getWhereMany(where, 'createdAt', 'desc', 1).then(res => res.length ? res[0] : Promise.reject('Not found!'));
  }
}
