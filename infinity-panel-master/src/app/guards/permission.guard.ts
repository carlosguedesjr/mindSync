import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { Permission } from '../models/permission';

import { StorageService } from '../services/storage.service';
import { PermissionService } from 'src/app/services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private router: Router,
    private _storage: StorageService,
    private _permission: PermissionService,
  ){ }

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const user = this._storage.getUser;
    if (user) {
      const permissions = route.data.permissions as Permission[];
      if (permissions)
        for (const permission of route.data.permissions as Permission[])
          if (!this._permission.check(permission.page, permission.role)) {
            this.router.navigateByUrl('/erro/403');
            return false;
          }
    }
    return true;
  }
}
