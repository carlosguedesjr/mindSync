import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Area } from 'src/app/models/company';
import { FirebaseAbstract, FirebaseWhere } from '../abstract';

@Injectable({
  providedIn: 'root'
})
export class CompanyAreaService extends FirebaseAbstract<Area> {

  static collectionName = 'company-areas';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, CompanyAreaService.collectionName);
  }

  getByDepartmentId(departmentId: string) {
    const where = [
      new FirebaseWhere('deletedAt', '==', null),
      new FirebaseWhere('departmentId', '==', departmentId),
    ];
    return this.getWhereMany(where);
  }
}
