import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Department } from 'src/app/models/company';
import { Page, PageRole } from 'src/app/models/permission';

import { CompanyDepartmentFormComponent } from '../form/form.component';
import { CompanyDepartmentDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-company-department-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompanyDepartmentListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Department>;
  displayedColumns: string[] = ['name', '_branch', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.CompanyPage, PageRole.CanAdd);
  canView = this._permission.check(Page.CompanyPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.CompanyPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.CompanyPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _branch: CompanyBranchService,
    private _permission: PermissionService,
    private _department: CompanyDepartmentService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._department.getAll();
    for (const item of items) item._branch = await this._branch.getById(item.branchId);
    this.dataSource = new MatTableDataSource<Department>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Department): void {
    if (this.canView) this._util.detail(CompanyDepartmentDetailComponent, object);
  }

  openForm(object?: Department): void {
    this._util.form(CompanyDepartmentFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Department): Promise<void> {
    await this._department.softDelete(object.id, !object.deletedAt);
    this._util.message(`Entidade ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Department): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
