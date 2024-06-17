import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Assessment } from 'src/app/models/assessment';
import { AssessmentGroupService } from 'src/app/services/firebase/assessment/group.service';
import { AssessmentInstructionService } from 'src/app/services/firebase/assessment/instruction.service';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class AssessmentDetailComponent implements OnInit {

  constructor(
    private _group: AssessmentGroupService,
    private _instruction: AssessmentInstructionService,
    @Inject(MAT_DIALOG_DATA) public object: Assessment,
    private dialogRef: MatDialogRef<AssessmentDetailComponent>
  ) { }

  async ngOnInit(): Promise<void> {
    for (const groupId of this.object.groups) {
      this.object._groups = [];
      const question = await this._group.getById(groupId);
      this.object._groups.push(question);
    }

    for (const instructionId of this.object.instructions) {
      this.object._instructions = [];
      const instruction = await this._instruction.getById(instructionId);
      this.object._instructions.push(instruction);
    }
  }

  getStudentRequiredName(id: string) {
    return Assessment.getStudentRequiredName(id);
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
