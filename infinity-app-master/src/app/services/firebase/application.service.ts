import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { StorageService } from '../storage.service';
import { Application } from 'src/app/models/application';
import { FirebaseAbstract, FirebaseWhere } from './abstract';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService extends FirebaseAbstract<Application> {

  static collectionName = 'applications';

  constructor(
    protected db: AngularFirestore,
    private _storage: StorageService
  ) {
    super(db, ApplicationService.collectionName);
  }

  add(data: Application) {
    const student = this._storage.getUser;
    data.student.id = student.id;
    data.student.name = student.name;
    return super.add(data);
  }

  save(data: Application) {
    const student = this._storage.getUser;
    data.student.id = student.id;
    data.student.name = student.name;
    return super.save(data);
  }

  async getByAssessmentIdByAccessId(id: string, accessId: string) {
    const where = [
      new FirebaseWhere('assessment.id', '==', id),
      new FirebaseWhere('assessment.accessId', '==', accessId),
      new FirebaseWhere('student.id', '==', this._storage.getUser.id)
    ];
    return this.getWhereMany(where, null, null, 1).then(docs => docs.length ? docs[0] : Promise.reject());
  }
}
