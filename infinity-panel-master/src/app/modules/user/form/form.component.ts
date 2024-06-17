import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';

import { User } from 'src/app/models/user';
import { Group } from 'src/app/models/group';
import { FileUpload } from 'src/app/interfaces/base';
import { Permission } from 'src/app/models/permission';

import { UtilService } from 'src/app/services/util.service';
import { UserService } from 'src/app/services/firebase/user.service';
import { GroupService } from 'src/app/services/firebase/group.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class UserFormComponent implements OnInit {

  saving = false;
  groups: Group[];
  image: FileUpload;
  togglePass = true;
  formGroup: FormGroup;
  permissions: {id: string; name: string; pageId: string; roleId: string}[];

  constructor(
    private _util: UtilService,
    private _user: UserService,
    private _group: GroupService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User = new User()
    ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      groups: new FormControl([]),
      permissions: new FormControl([]),
      password: new FormControl(''),
      confirmPass: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.getGroups();
    this.getPermissions();
    if (this.data.id) this.setData();
    else {
      this.formGroup.setValidators(this.validatorPassword);
      this.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[0-9]/),
        Validators.pattern(/[a-zA-Z]/),
        Validators.pattern(/[!@#$%&*()_=+;:,.?><\-]/)
      ]);
      this.controls.confirmPass.setValidators(Validators.required);
      this.controls.password.updateValueAndValidity();
      this.controls.confirmPass.updateValueAndValidity();
    }
  }

  setData(): void {
    if (this.data.image) this.image = {path: this.data.image, new: false};
    const permissions = this.data.permissions.map(
      perm => this.permissions.findIndex(item => item.pageId === perm.page && item.roleId === perm.role).toString());
    this.formGroup.patchValue({...this.data, permissions});
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getGroups(): Promise<void> {
    this.groups = await this._group.getAllActive();
  }

  getPermissions(): void {
    this.permissions = [];
    let id = 0;
    for (const page of Permission.getPages)
      for (const role of Permission.getPageRoles) {
        this.permissions.push({id: id.toString(), name: `${page.name} - ${role.name}`, pageId: page.id, roleId: role.id});
        id += 1;
      }
  }

  validatorPassword(group: FormGroup): ValidatorFn {
    const password = group.get('password').value;
    const confirmControl = group.get('confirmPass');
    let result: {
      required?: boolean;
      passNotSame?: boolean;
      minlength?: {actualLength: number; requiredLength: number};
    } = null;

    if (confirmControl.hasError('required')) result = {required: true};
    else if (password !== confirmControl.value) result = {passNotSame: true};

    confirmControl.setErrors(result);
    return null;
  }

  async takeImage(event: any): Promise<void> {
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
        await this._user.deleteImage(this.data.id);
        this.image = null;
      }).catch(_ => {});
    else this.image = null;
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      const value = this.formGroup.value;
      delete value.confirmPass;
      Object.assign(this.data, value);
      this.data.permissions = value.permissions.map(index => {
        return {page: this.permissions[index].pageId, role: this.permissions[index].roleId};
      });

      await this._user.save(this.data).then(async id => {
        if (id) this.data.id = id;
        if (this.image && this.image.new && this.image.file) await this._user.uploadImage(this.data.id, this.image.file);
      });

      this.saving = false;
      this._util.message('Usuário salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
