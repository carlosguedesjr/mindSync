import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Instruction } from 'src/app/models/assessment';
import { Page, PageRole } from 'src/app/models/permission';

import { AssessmentInstructionFormComponent } from '../form/form.component';
import { AssessmentInstructionDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { AssessmentInstructionService } from 'src/app/services/firebase/assessment/instruction.service';

@Component({
  selector: 'app-assessment-instruction-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AssessmentInstructionListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Instruction>;
  displayedColumns: string[] = ['title', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.AssessmentInstructionPage, PageRole.CanAdd);
  canView = this._permission.check(Page.AssessmentInstructionPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.AssessmentInstructionPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.AssessmentInstructionPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _permission: PermissionService,
    private _instruction: AssessmentInstructionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._instruction.getAll();
    this.dataSource = new MatTableDataSource<Instruction>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Instruction): void {
    if (this.canView) this._util.detail(AssessmentInstructionDetailComponent, object);
  }

  openForm(object?: Instruction): void {
    this._util.form(AssessmentInstructionFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Instruction): Promise<void> {
    await this._instruction.softDelete(object.id, !object.deletedAt);
    await this._instruction.deleteAllImages();
    this._util.message('Instrução excluída com sucesso!', 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Instruction): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
