import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Department } from 'src/app/models/company';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';

@Component({
  selector: 'app-company-department-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class CompanyDepartmentDetailComponent implements OnInit {

  loading = true;

  constructor(
    private _company: CompanyService,
    private _branch: CompanyBranchService,
    @Inject(MAT_DIALOG_DATA) public object: Department,
    private dialogRef: MatDialogRef<CompanyDepartmentDetailComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    this.object._branch = await this._branch.getById(this.object.branchId);
    this.object._branch._company = await this._company.getById(this.object._branch.companyId);
    this.loading = false;
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
