import { Injectable } from '@angular/core';

import { User } from 'src/app/models/user';
import { Group } from 'src/app/models/group';
import { Permission } from 'src/app/models/permission';
import { GroupService } from './firebase/group.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private _group: GroupService,
  ) { }

  // USER
  async setUser(data: User): Promise<void> {
    const groups = [];

    if (data.permissions) this.setPermissions = data.permissions;
    if (data.groups) {
      for (const groupId of data.groups) await this._group.getById(groupId).then(group => groups.push(group));
      this.setGroups = groups;
    }
    localStorage.setItem('user', JSON.stringify(data));
  }
  get getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }
  removeUser(): void {
    localStorage.removeItem('user');
  }

  // GROUP
  set setGroups(data: Group[]) {
    localStorage.setItem('groups', JSON.stringify(data));
  }
  get getGroups(): Group[] {
    return JSON.parse(localStorage.getItem('groups')) || [];
  }
  removeGroups(): void {
    localStorage.removeItem('groups');
  }

  // PERMISSIONS
  set setPermissions(data: Permission[]) {
    localStorage.setItem('permissions', JSON.stringify(data));
  }
  get getPermissions(): Permission[] {
    return JSON.parse(localStorage.getItem('permissions')) || [];
  }
  removePermissions(): void {
    localStorage.removeItem('permissions');
  }
}
