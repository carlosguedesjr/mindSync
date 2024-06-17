import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Group } from 'src/app/models/assessment';
import { AssessmentQuestionService } from 'src/app/services/firebase/assessment/question.service';

@Component({
  selector: 'app-assessment-group-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class AssessmentGroupDetailComponent implements OnInit {

  constructor(
    private _question: AssessmentQuestionService,
    @Inject(MAT_DIALOG_DATA) public object: Group,
    private dialogRef: MatDialogRef<AssessmentGroupDetailComponent>
  ) { }

  async ngOnInit(): Promise<void> {
    for (const questionId of this.object.questions) {
      this.object._questions = [];
      const question = await this._question.getById(questionId);
      this.object._questions.push(question);
    }
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
