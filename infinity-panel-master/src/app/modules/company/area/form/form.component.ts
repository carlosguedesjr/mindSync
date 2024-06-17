import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { FileUpload } from 'src/app/interfaces/base';
import { Area, Department } from 'src/app/models/company';

import { UtilService } from 'src/app/services/util.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-company-area-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class CompanyAreaFormComponent implements OnInit {

  saving = false;
  image: FileUpload;
  formGroup: FormGroup;
  departments: Department[];

  constructor(
    private _util: UtilService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _area: CompanyAreaService,
    private _branch: CompanyBranchService,
    private _department: CompanyDepartmentService,
    private dialogRef: MatDialogRef<CompanyAreaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Area = new Area()
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      departmentId: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getDepartments();
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getDepartments() {
    this.departments = await this._department.getAllActive();
    for (const department of this.departments) {
      const branch = await this._branch.getById(department.branchId);
      const company = await this._company.getById(branch.companyId);
      department.name = `${company.name} - ${branch.name} - ${department.name}`;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);
      await this._area.save(this.data);

      this.saving = false;
      this._util.message('Entidade salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
