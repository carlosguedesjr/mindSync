import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Branch } from 'src/app/models/company';
import { FirebaseAbstract, FirebaseWhere } from '../abstract';

@Injectable({
  providedIn: 'root'
})
export class CompanyBranchService extends FirebaseAbstract<Branch> {

  static collectionName = 'company-branches';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, CompanyBranchService.collectionName);
  }

  getByCompanyId(companyId: string) {
    const where = [
      new FirebaseWhere('deletedAt', '==', null),
      new FirebaseWhere('companyId', '==', companyId)
    ];
    return this.getWhereMany(where);
  }
}
