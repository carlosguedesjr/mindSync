import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { User } from 'src/app/models/user';

import { GroupService } from 'src/app/services/firebase/group.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  constructor(
    private _group: GroupService,
    @Inject(MAT_DIALOG_DATA) public object: User,
    private dialogRef: MatDialogRef<UserDetailComponent>
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.object.groups)
      for (const groupId of this.object.groups) {
        this.object._groups = [];
        const group = await this._group.getById(groupId);
        this.object._groups.push(group);
      }
  }

  goToBack(params?: any): void {
    this.dialogRef.close(params);
  }
}
