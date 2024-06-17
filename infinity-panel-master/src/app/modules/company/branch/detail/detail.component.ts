import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Branch } from 'src/app/models/company';
import { CompanyService } from 'src/app/services/firebase/company/company.service';

@Component({
  selector: 'app-company-branch-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class CompanyBranchDetailComponent implements OnInit {

  constructor(
    private _company: CompanyService,
    @Inject(MAT_DIALOG_DATA) public object: Branch,
    private dialogRef: MatDialogRef<CompanyBranchDetailComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    this.object._company = await this._company.getById(this.object.companyId);
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
