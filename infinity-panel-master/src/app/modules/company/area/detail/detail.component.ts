import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Area } from 'src/app/models/company';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-company-area-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class CompanyAreaDetailComponent implements OnInit {

  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public object: Area,
    private _company: CompanyService,
    private _branch: CompanyBranchService,
    private _department: CompanyDepartmentService,
    private dialogRef: MatDialogRef<CompanyAreaDetailComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    this.object._department = await this._department.getById(this.object.departmentId);
    this.object._department._branch = await this._branch.getById(this.object._department.branchId);
    this.object._department._branch._company = await this._company.getById(this.object._department._branch.companyId);
    this.loading = false;
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
