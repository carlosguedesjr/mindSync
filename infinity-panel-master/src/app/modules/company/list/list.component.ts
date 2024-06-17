import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Company } from 'src/app/models/company';
import { Page, PageRole } from 'src/app/models/permission';

import { CompanyFormComponent } from '../form/form.component';
import { CompanyDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';

@Component({
  selector: 'app-company-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class CompanyListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Company>;
  displayedColumns: string[] = ['name', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.CompanyPage, PageRole.CanAdd);
  canView = this._permission.check(Page.CompanyPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.CompanyPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.CompanyPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _company: CompanyService,
    private _permission: PermissionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._company.getAll();
    this.dataSource = new MatTableDataSource<Company>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Company): void {
    if (this.canView) this._util.detail(CompanyDetailComponent, object);
  }

  openForm(object?: Company): void {
    this._util.form(CompanyFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Company): Promise<void> {
    await this._company.softDelete(object.id, !object.deletedAt);
    this._util.message(`Empresa ${object.deletedAt ? 'ativada' : 'desativada'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Company): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
