import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Subscription } from 'src/app/models/subscription';
import { FirebaseAbstract, FirebaseWhere } from './abstract';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends FirebaseAbstract<Subscription> {

  static collectionName = 'subscriptions';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, SubscriptionService.collectionName);
  }

  async getByAccessIdByStudentId(accessId: string, studentId: string): Promise<Subscription> {
    const where = [
      new FirebaseWhere('access.id', '==', accessId),
      new FirebaseWhere('student.id', '==', studentId)
    ];
    return this.getWhereMany(where).then(res => res.length ? res[0] : Promise.reject('Not found!'));
  }

  async getByAccessIdByStudentIdByAssessmentId(
    accessId: string, studentId: string, assessmentId: string
  ): Promise<Subscription> {
    const where = [
      new FirebaseWhere('access.id', '==', accessId),
      new FirebaseWhere('student.id', '==', studentId),
      new FirebaseWhere('assessmentIds', 'array-contains', assessmentId)
    ];
    return this.getWhereMany(where).then(res => res.length ? res[0] : Promise.reject('Not found!'));
  }
}
