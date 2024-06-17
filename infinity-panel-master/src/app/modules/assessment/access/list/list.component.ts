import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Access } from 'src/app/models/access';
import { Page, PageRole } from 'src/app/models/permission';

import { AccessFormComponent } from '../form/form.component';
import { AccessDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { AccessService } from 'src/app/services/firebase/access.service';

@Component({
  selector: 'app-access-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AccessListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Access>;
  displayedColumns: string[] = ['code', 'quantity', 'used', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.AccessPage, PageRole.CanAdd);
  canView = this._permission.check(Page.AccessPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.AccessPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.AccessPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private _permission: PermissionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._access.getAll();
    this.dataSource = new MatTableDataSource<Access>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Access): void {
    if (this.canView) this._util.detail(AccessDetailComponent, object);
  }

  openForm(object?: Access): void {
    this._util.form(AccessFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Access): Promise<void> {
    await this._access.softDelete(object.id, !object.deletedAt);
    this._util.message(`Cupom ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Access): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
