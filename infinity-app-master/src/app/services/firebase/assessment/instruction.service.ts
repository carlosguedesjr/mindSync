import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { FirebaseAbstract } from '../abstract';
import { Instruction } from 'src/app/models/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentInstructionService extends FirebaseAbstract<Instruction> {

  static collectionName = 'assessment-instructions';

  constructor(
    protected db: AngularFirestore
  ) {
    super(db, AssessmentInstructionService.collectionName);
  }
}
