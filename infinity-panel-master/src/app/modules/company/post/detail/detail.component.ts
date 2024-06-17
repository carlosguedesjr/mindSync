import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Post } from 'src/app/models/company';

import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-company-post-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class CompanyPostDetailComponent implements OnInit {

  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public object: Post,
    private _company: CompanyService,
    private _area: CompanyAreaService,
    private _branch: CompanyBranchService,
    private _department: CompanyDepartmentService,
    private dialogRef: MatDialogRef<CompanyPostDetailComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    this.object._area = await this._area.getById(this.object.areaId);
    this.object._area._department = await this._department.getById(this.object._area.departmentId);
    this.object._area._department._branch = await this._branch.getById(this.object._area._department.branchId);
    this.object._area._department._branch._company = await this._company.getById(this.object._area._department._branch.companyId);
    this.loading = false;
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
