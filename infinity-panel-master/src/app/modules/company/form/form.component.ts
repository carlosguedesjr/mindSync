import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { NgxDropzoneChangeEvent } from 'ngx-dropzone';

import { Company } from 'src/app/models/company';
import { FileUpload } from 'src/app/interfaces/base';

import { UtilService } from 'src/app/services/util.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';

@Component({
  selector: 'app-company-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class CompanyFormComponent implements OnInit {

  saving = false;
  image: FileUpload;
  formGroup: FormGroup;

  constructor(
    private _util: UtilService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private dialogRef: MatDialogRef<CompanyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Company = new Company()
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required)
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async takeImage(event: NgxDropzoneChangeEvent): Promise<void> {
    const loader = this._util.loading('Comprimindo imagem...');
    const image = await this._util.uploadImage(event.addedFiles[0]);
    const compress = await this._util.uploadCompress(image.path);
    this.image = {path: compress.base64, file: compress.file, new: true};
    loader.componentInstance.msg = 'Imagem comprimida!';
    loader.componentInstance.done();
  }

  async deleteImage(): Promise<void> {
    if (!this.image.new)
      this._util.delete('delete').then(async _ => {
        await this._company.deleteImage(this.data.id);
        this.image = null;
      }).catch(_ => {});
    else this.image = null;
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      Object.assign(this.data, this.formGroup.value);
      await this._company.save(this.data);

      this.saving = false;
      this._util.message('Empresa salva com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
