import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Instruction } from 'src/app/models/assessment';

@Component({
  selector: 'app-assessment-instruction-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class AssessmentInstructionDetailComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public object: Instruction,
    private dialogRef: MatDialogRef<AssessmentInstructionDetailComponent>
  ) { }

  ngOnInit(): void { }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
