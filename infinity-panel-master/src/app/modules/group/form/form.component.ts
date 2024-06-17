import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Group } from 'src/app/models/group';
import { Permission } from 'src/app/models/permission';

import { UtilService } from 'src/app/services/util.service';
import { GroupService } from 'src/app/services/firebase/group.service';

@Component({
  selector: 'app-group-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class GroupFormComponent implements OnInit {

  saving = false;
  formGroup: FormGroup;
  permissions: {id: string; name: string; pageId: string; roleId: string}[];

  constructor(
    private _util: UtilService,
    private _group: GroupService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<GroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Group = new Group()
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      permissions: new FormControl([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.getPermissions();
    if (this.data.id) this.setData();
  }

  setData(): void {
    const permissions = this.data.permissions.map(
      perm => this.permissions.findIndex(item => item.pageId === perm.page && item.roleId === perm.role).toString());
    this.formGroup.patchValue({...this.data, permissions});
  }

  get controls() {
    return this.formGroup.controls;
  }

  getPermissions() {
    this.permissions = [];
    let id = 0;
    for (const page of Permission.getPages)
      for (const role of Permission.getPageRoles) {
        this.permissions.push({id: id.toString(), name: `${page.name} - ${role.name}`, pageId: page.id, roleId: role.id});
        id += 1;
      }
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      const value = this.formGroup.value;
      Object.assign(this.data, value);
      this.data.permissions = value.permissions.map(index => {
        return {page: this.permissions[index].pageId, role: this.permissions[index].roleId};
      });
      await this._group.save(this.data);

      this.saving = false;
      this._util.message('Grupo salvo com sucesso!', 'success');
      this.dialogRef.close(true);
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }
}
