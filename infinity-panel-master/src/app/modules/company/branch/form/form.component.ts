import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { FileUpload } from 'src/app/interfaces/base';
import { Company, Branch } from 'src/app/models/company';

import { UtilService } from 'src/app/services/util.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';

@Component({
  selector: 'app-company-branch-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class CompanyBranchFormComponent implements OnInit {

  saving = false;
  image: FileUpload;
  companies: Company[];
  formGroup: FormGroup;

  constructor(
    private _util: UtilService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _branch: CompanyBranchService,
    @Inject(MAT_DIALOG_DATA) public data: Branch = new Branch(),
    private dialogRef: MatDialogRef<CompanyBranchFormComponent>
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      companyId: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getCompanies();
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getCompanies() {
    this.companies = await this._company.getAllActive();
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);
      await this._branch.save(this.data);

      this.saving = false;
      this._util.message('Unidade salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
