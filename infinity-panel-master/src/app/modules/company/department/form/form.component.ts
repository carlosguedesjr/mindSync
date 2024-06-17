import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { FileUpload } from 'src/app/interfaces/base';
import { Branch, Department } from 'src/app/models/company';

import { UtilService } from 'src/app/services/util.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-company-department-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class CompanyDepartmentFormComponent implements OnInit {

  saving = false;
  image: FileUpload;
  branches: Branch[];
  formGroup: FormGroup;

  constructor(
    private _util: UtilService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _branch: CompanyBranchService,
    private _department: CompanyDepartmentService,
    private dialogRef: MatDialogRef<CompanyDepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Department = new Department()
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      branchId: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getBranches();
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getBranches() {
    this.branches = await this._branch.getAllActive();
    for (const branch of this.branches) {
      const company = await this._company.getById(branch.companyId);
      branch.name = `${company.name} - ${branch.name}`;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);
      await this._department.save(this.data);

      this.saving = false;
      this._util.message('Entidade salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
