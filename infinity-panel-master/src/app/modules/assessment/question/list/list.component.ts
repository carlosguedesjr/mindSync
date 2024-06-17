import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Question } from 'src/app/models/assessment';
import { Page, PageRole } from 'src/app/models/permission';

import { AssessmentQuestionFormComponent } from '../form/form.component';
import { AssessmentQuestionDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { AssessmentQuestionService } from 'src/app/services/firebase/assessment/question.service';

@Component({
  selector: 'app-assessment-question-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AssessmentQuestionListComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  filter: string;
  loading = true;
  dataSource: MatTableDataSource<Question>;
  displayedColumns: string[] = ['title', 'deletedAt', 'actions'];

  canAdd = this._permission.check(Page.AssessmentQuestionPage, PageRole.CanAdd);
  canView = this._permission.check(Page.AssessmentQuestionPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.AssessmentQuestionPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.AssessmentQuestionPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _permission: PermissionService,
    private _question: AssessmentQuestionService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._question.getAll();
    this.dataSource = new MatTableDataSource<Question>(items);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object: Question): void {
    if (this.canView) this._util.detail(AssessmentQuestionDetailComponent, Object.assign(new Question(), object));
  }

  openForm(object?: Question): void {
    this._util.form(AssessmentQuestionFormComponent, object).then(res => {
      if (res) this.ngOnInit();
    });
  }

  async delete(object: Question): Promise<void> {
    await this._question.softDelete(object.id, !object.deletedAt);
    await this._question.deleteAllImages();
    this._util.message('Questão excluída com sucesso!', 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Question): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => {});
  }
}
