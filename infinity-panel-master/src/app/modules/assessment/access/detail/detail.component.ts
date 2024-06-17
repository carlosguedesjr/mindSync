import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Access } from 'src/app/models/access';

import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';

@Component({
  selector: 'app-access-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class AccessDetailComponent implements OnInit {

  loading = true;

  constructor(
    private _company: CompanyService,
    private _assessment: AssessmentService,
    @Inject(MAT_DIALOG_DATA) public object: Access,
    private dialogRef: MatDialogRef<AccessDetailComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    if (this.object.companyId) this.object._company = await this._company.getById(this.object.companyId);
    this.object._assessments = [];
    for (const assessmentId of this.object.assessmentIds) {
      const assessment = await this._assessment.getById(assessmentId);
      this.object._assessments.push(assessment);
    }
    this.loading = false;
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
