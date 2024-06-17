import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Access } from 'src/app/models/access';
import { Company } from 'src/app/models/company';
import { Assessment } from 'src/app/models/assessment';

import { UtilService } from 'src/app/services/util.service';
import { AccessService } from 'src/app/services/firebase/access.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';

@Component({
  selector: 'app-access-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class AccessFormComponent implements OnInit {

  saving = false;
  companies: Company[];
  formGroup: FormGroup;
  assessments: Assessment[];

  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private _company: CompanyService,
    private formBuilder: FormBuilder,
    private _assessment: AssessmentService,
    private dialogRef: MatDialogRef<AccessFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Access = new Access()
  ) {
    this.formGroup = this.formBuilder.group({
      code: new FormControl('', Validators.required),
      validity: new FormControl('', Validators.required),
      quantity: new FormControl(0, [Validators.required, Validators.min(0)]),
      companyId: new FormControl('', Validators.required),
      assessmentIds: new FormControl([], Validators.required)
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getCompanies();
    await this.getAssessments();
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getAssessments() {
    this.assessments = await this._assessment.getAllActive('name');
  }

  async getCompanies() {
    this.companies = await this._company.getAllActive('name');
  }

  uppercase() {
    const value = this._util.removeAccent(this.controls.code.value);
    this.controls.code.setValue(value.toUpperCase());
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);
      this.data.validity.setHours(23, 59, 59);

      await this._access.save(this.data);

      this.saving = false;
      this._util.message('Accesso ao conteúdo salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
