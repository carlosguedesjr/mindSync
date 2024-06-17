import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Student } from 'src/app/models/student';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyPostService } from 'src/app/services/firebase/company/post.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-student-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class StudentDetailComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public object: Student,
    private _company: CompanyService,
    private _area: CompanyAreaService,
    private _post: CompanyPostService,
    private _branch: CompanyBranchService,
    private _department: CompanyDepartmentService,
    private dialogRef: MatDialogRef<StudentDetailComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.object.company) {
      if (this.object.company.companyId)
        this.object.company._company = await this._company.getById(this.object.company.companyId);
      if (this.object.company.branchId)
        this.object.company._branch = await this._branch.getById(this.object.company.branchId);
      if (this.object.company.departmentId)
        this.object.company._department = await this._department.getById(this.object.company.departmentId);
      if (this.object.company.areaId)
        this.object.company._area = await this._area.getById(this.object.company.areaId);
      if (this.object.company.postId)
        this.object.company._post = await this._post.getById(this.object.company.postId);
    }
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
