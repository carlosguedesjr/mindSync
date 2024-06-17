import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Question } from 'src/app/models/assessment';

@Component({
  selector: 'app-assessment-question-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class AssessmentQuestionDetailComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public object: Question,
    private dialogRef: MatDialogRef<AssessmentQuestionDetailComponent>
  ) { }

  ngOnInit(): void { }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
