import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Branch } from 'src/app/models/company';
import { Page, PageRole } from 'src/app/models/permission';

import { CompanyBranchFormComponent } from '../form/form.component';
import { CompanyBranchDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';

@Component({
  selector: 'app-company-branch-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompanyBranchListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Branch>;
  displayedColumns: string[] = ['name', '_company', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.CompanyPage, PageRole.CanAdd);
  canView = this._permission.check(Page.CompanyPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.CompanyPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.CompanyPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _company: CompanyService,
    private _branch: CompanyBranchService,
    private _permission: PermissionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._branch.getAll();
    for (const item of items) item._company = await this._company.getById(item.companyId);
    this.dataSource = new MatTableDataSource<Branch>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Branch): void {
    if (this.canView) this._util.detail(CompanyBranchDetailComponent, object);
  }

  openForm(object?: Branch): void {
    this._util.form(CompanyBranchFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Branch): Promise<void> {
    await this._branch.softDelete(object.id, !object.deletedAt);
    this._util.message(`Unidade ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Branch): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
