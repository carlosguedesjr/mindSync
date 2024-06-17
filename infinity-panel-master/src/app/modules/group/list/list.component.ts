import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Group } from 'src/app/models/group';
import { Page, PageRole } from 'src/app/models/permission';

import { GroupFormComponent } from '../form/form.component';
import { GroupDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { GroupService } from 'src/app/services/firebase/group.service';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class GroupListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Group>;
  displayedColumns: string[] = ['name', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.GroupPage, PageRole.CanAdd);
  canView = this._permission.check(Page.GroupPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.GroupPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.GroupPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _group: GroupService,
    private _permission: PermissionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._group.getAll();
    this.dataSource = new MatTableDataSource<Group>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Group): void {
    if (this.canView) this._util.detail(GroupDetailComponent, object);
  }

  openForm(object?: Group): void {
    this._util.form(GroupFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Group): Promise<void> {
    await this._group.softDelete(object.id, !object.deletedAt);
    this._util.message(`Grupo ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Group): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
