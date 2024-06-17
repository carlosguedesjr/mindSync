import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Instruction } from 'src/app/models/assessment';

import { UtilService } from 'src/app/services/util.service';
import { AssessmentInstructionService } from 'src/app/services/firebase/assessment/instruction.service';

@Component({
  selector: 'app-assessment-instruction-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class AssessmentInstructionFormComponent implements OnInit {

  saving = false;
  formGroup: FormGroup;

  constructor(
    private _util: UtilService,
    private formBuilder: FormBuilder,
    private _instruction: AssessmentInstructionService,
    private dialogRef: MatDialogRef<AssessmentInstructionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Instruction = new Instruction()
  ) {
    this.formGroup = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      text: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    if (this.data.id) this.setData();
  }

  setData(): void {
    this.formGroup.patchValue(this.data);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async uploadImages(images: string[]) {
    for (let i = 0; i < images.length; i++) {
      const base64 = images[i];
      if (base64) {
        const file = await this._util.uploadCompress(base64);
        const url = await this._instruction.uploadImage(`${this.data.id}/${i.toString()}`, file.file);
        this.data.images.push(url);
        this.data.text = this.data.text.replace(`src="${i.toString()}"`, `src="${url}"`);
        await this._instruction.update(this.data.id, this.data);
      }
    }
    const deleteImages = this.data.images.filter(url => this.data.text.indexOf(url) < 0);
    for (const imageUrl of deleteImages) {
      const index = this.data.images.findIndex(url => url === imageUrl);
      this.data.images.splice(index, 1);
      await this._instruction.deleteImageByURL(imageUrl);
      await this._instruction.update(this.data.id, this.data);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      const value = this.formGroup.value;

      Object.assign(this.data, value);

      const tagImgs: HTMLImageElement[] = [].slice.call(document.getElementsByClassName('ql-editor')[0].getElementsByTagName('img'));
      const images: string[] = [];
      if (tagImgs.length)
        for (let i = 0; i < tagImgs.length; i++) {
          const tag: HTMLImageElement = tagImgs[i];
          let base64 = null;
          const src: string = tag.src;
          if (src.indexOf('base64') >= 0) {
            this.data.text = this.data.text.replace(src, i.toString());
            base64 = src;
          } else this.data.text = this.data.text.replace(/&amp;/g, '&');
          images.push(base64);
        }

      await this._instruction.save(this.data).then(async id => {
        if (id) this.data.id = id;
        await this.uploadImages(images);
      });

      this.saving = false;
      this._util.message('Instrução salva com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
