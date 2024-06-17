import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Department } from 'src/app/models/company';
import { FirebaseAbstract, FirebaseWhere } from '../abstract';

@Injectable({
  providedIn: 'root'
})
export class CompanyDepartmentService extends FirebaseAbstract<Department> {

  static collectionName = 'company-departments';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, CompanyDepartmentService.collectionName);
  }

  getByBranchId(branchId: string) {
    const where = [
      new FirebaseWhere('deletedAt', '==', null),
      new FirebaseWhere('branchId', '==', branchId),
    ];
    return this.getWhereMany(where);
  }
}
