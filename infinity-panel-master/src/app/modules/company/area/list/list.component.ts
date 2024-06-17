import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Area } from 'src/app/models/company';
import { Page, PageRole } from 'src/app/models/permission';

import { CompanyAreaFormComponent } from '../form/form.component';
import { CompanyAreaDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-company-area-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompanyAreaListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Area>;
  displayedColumns: string[] = ['name', '_department', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.CompanyPage, PageRole.CanAdd);
  canView = this._permission.check(Page.CompanyPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.CompanyPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.CompanyPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _area: CompanyAreaService,
    private _permission: PermissionService,
    private _department: CompanyDepartmentService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._area.getAll();
    for (const item of items) item._department = await this._department.getById(item.departmentId);
    this.dataSource = new MatTableDataSource<Area>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Area): void {
    if (this.canView) this._util.detail(CompanyAreaDetailComponent, object);
  }

  openForm(object?: Area): void {
    this._util.form(CompanyAreaFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Area): Promise<void> {
    await this._area.softDelete(object.id, !object.deletedAt);
    this._util.message(`Entidade ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Area): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
