import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Assessment } from 'src/app/models/assessment';
import { Page, PageRole } from 'src/app/models/permission';

import { AssessmentFormComponent } from '../form/form.component';
import { AssessmentDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';

@Component({
  selector: 'app-assessment-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AssessmentListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Assessment>;
  displayedColumns: string[] = ['name', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.AssessmentPage, PageRole.CanAdd);
  canView = this._permission.check(Page.AssessmentPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.AssessmentPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.AssessmentPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _permission: PermissionService,
    private _assessment: AssessmentService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._assessment.getAll();
    this.dataSource = new MatTableDataSource<Assessment>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object: Assessment): void {
    if (this.canView) this._util.detail(AssessmentDetailComponent, Object.assign(new Assessment(), object));
  }

  openForm(object?: Assessment): void {
    this._util.form(AssessmentFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Assessment): Promise<void> {
    await this._assessment.softDelete(object.id, !object.deletedAt);
    this._util.message(`Assessment ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Assessment): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
