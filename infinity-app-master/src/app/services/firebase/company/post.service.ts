import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Post } from 'src/app/models/company';
import { FirebaseAbstract, FirebaseWhere } from '../abstract';

@Injectable({
  providedIn: 'root'
})
export class CompanyPostService extends FirebaseAbstract<Post> {

  static collectionName = 'company-posts';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, CompanyPostService.collectionName);
  }

  getByAreaId(areaId: string) {
    const where = [
      new FirebaseWhere('areaId', '==', areaId),
      new FirebaseWhere('deletedAt', '==', null)
    ];
    return this.getWhereMany(where);
  }
}
