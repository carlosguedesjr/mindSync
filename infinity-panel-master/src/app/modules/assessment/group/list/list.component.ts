import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Group } from 'src/app/models/assessment';
import { Page, PageRole } from 'src/app/models/permission';

import { AssessmentGroupFormComponent } from '../form/form.component';
import { AssessmentGroupDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { AssessmentGroupService } from 'src/app/services/firebase/assessment/group.service';

@Component({
  selector: 'app-assessment-group-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AssessmentGroupListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Group>;
  displayedColumns: string[] = ['name', 'image', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.AssessmentGroupPage, PageRole.CanAdd);
  canView = this._permission.check(Page.AssessmentGroupPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.AssessmentGroupPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.AssessmentGroupPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _group: AssessmentGroupService,
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
    if (this.canView) this._util.detail(AssessmentGroupDetailComponent, object);
  }

  openForm(object?: Group): void {
    this._util.form(AssessmentGroupFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Group): Promise<void> {
    if (object.image) await this._group.deleteImage(object.id);
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
