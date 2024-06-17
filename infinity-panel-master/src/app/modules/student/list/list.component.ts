import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

import { saveAs } from 'file-saver';
import * as ld from 'lodash';
import { differenceInYears } from 'date-fns';

import { Student } from 'src/app/models/student';
import { Page, PageRole } from 'src/app/models/permission';

import { StudentDetailComponent } from '../detail/detail.component';

import { UtilService } from 'src/app/services/util.service';
import { PermissionService } from 'src/app/services/permission.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyPostService } from 'src/app/services/firebase/company/post.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class StudentListComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  filter: string;
  loading = true;
  loadingExp = true;
  dataSource: MatTableDataSource<Student>;
  displayedColumns: string[] = [
    'name', 'email', 'company._department.name', 'company._area.name', 'company._post.name', 'deletedAt', 'image', 'actions'];

  canAdd = this._permission.check(Page.StudentPage, PageRole.CanAdd);
  canView = this._permission.check(Page.StudentPage, PageRole.CanView);
  canUpdate = this._permission.check(Page.StudentPage, PageRole.CanUpdate);
  canDelete = this._permission.check(Page.StudentPage, PageRole.CanDelete);

  constructor(
    private _util: UtilService,
    private _student: StudentService,
    private _company: CompanyService,
    private _area: CompanyAreaService,
    private _post: CompanyPostService,
    public _permission: PermissionService,
    private _branch: CompanyBranchService,
    private _department: CompanyDepartmentService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const items = await this._student.getAll();
    this.dataSource = new MatTableDataSource<Student>(items);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'company._area.name': return item.company?._area?.name;
        case 'company._post.name': return item.company?._post?.name;
        case 'company._branch.name': return item.company?._branch?.name;
        case 'company._company.name': return item.company?._company?.name;
        case 'company._department.name': return item.company?._department?.name;
        default: return item[property];
      }
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loading = false;
    this.loadingExp = false;
  }

  openExpModal(): void {
    const dialogRef = this.dialog.open(DialogContentExportComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  openDetail(object?: Student): void {
    if (this.canView) this._util.detail(StudentDetailComponent, object);
  }

  async delete(object: Student): Promise<void> {
    if (object.image) await this._student.deleteImage(object.id);
    await this._student.softDelete(object.id, !object.deletedAt);
    this._util.message(`Aluno ${object.deletedAt ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    this.ngOnInit();
  }

  confirmDelete(object: Student): void {
    this._util.delete(object.deletedAt ? 'enable' : 'disable').then(async _ => {
      this.delete(object);
    }).catch(_ => { });
  }
}


@Component({
  selector: 'app-student-list',
  templateUrl: './dialog-content-export.html',
})
export class DialogContentExportComponent {

  loadingExp = true;
  stFields: FormGroup;
  constructor(
    private _student: StudentService,
    private fb: FormBuilder,
  ) {
    this.stFields = fb.group({
      name: false,
      email: false,
      phone: false,
      genre: false,
      dateBirth: false,
      childrens: false,
      cityBirth: false,
      stateBirth: false,
      scholarity: false,
      rg: false,
      cpf: false,
      motherName: false,
      spouseName: false,
      company: false,
      setenio: false,
      generation: false,
      code: false,
    });
    this.loadingExp = false;
  }

  async exportar(): Promise<void> {
    /*
    GERAÇÕES

    1943 A 1960 - BABY BOOMER (BB)
    1961 A 1981 - GERAÇÃO X (GX)
    1982 A 2004 - GERAÇÃO Y (GY)
    2005 A 2022 - GERAÇÃO Z (GZ)

    TABULAÇÃO SETÊNIOS
    0 A 7 ANOS - 1º SETÊNIO
    8 A 14 ANOS - 2º SETÊNIO
    15 A 21 ANOS - 3º SETÊNIO
    22 A 28 ANOS - 4º SETÊNIO
    29 A 35 ANOS - 5º SETÊNIO
    36 A 42 ANOS - 6º SETÊNIO
    43 A 49 ANOS - 7º SETÊNIO
    50 A 56 ANOS - 8º SETÊNIO
    57 A 63 ANOS - 9º SETÊNIO
    64 A 70 ANOS - 10º SETÊNIO
    71 A 77 ANOS - 11º SETÊNIO
    78 A 84 ANOS - 12º SETÊNIO
    85 A 91 ANOS - 13º SETÊNIO
    92 A 98 ANOS - 14º SETÊNIO
    */
    this.loadingExp = true;
    const stfLst = [];

    stfLst.push({ name: this.stFields.value['name'] });
    stfLst.push({ email: this.stFields.value['email'] });
    stfLst.push({ phone: this.stFields.value['phone'] });
    stfLst.push({ genre: this.stFields.value['genre'] });
    stfLst.push({ dateBirth: this.stFields.value['dateBirth'] });
    stfLst.push({ childrens: this.stFields.value['childrens'] });
    stfLst.push({ cityBirth: this.stFields.value['cityBirth'] });
    stfLst.push({ stateBirth: this.stFields.value['stateBirth'] });
    stfLst.push({ scholarity: this.stFields.value['scholarity'] });
    stfLst.push({ rg: this.stFields.value['rg'] });
    stfLst.push({ cpf: this.stFields.value['cpf'] });
    stfLst.push({ motherName: this.stFields.value['motherName'] });
    stfLst.push({ spouseName: this.stFields.value['spouseName'] });
    stfLst.push({ company: this.stFields.value['company'] });
    stfLst.push({ setenio: this.stFields.value['setenio'] });
    stfLst.push({ generation: this.stFields.value['generation'] });

    const sf = [];
    let selComp = false;
    let selSet = false;
    let selGen = false;
    stfLst.forEach(e => {
      const val = Object.keys(e)[0];
      if (e[val] === true)
        sf.push(val);
      if (e[val] === true && val === 'company')
        selComp = true;
      if (e[val] === true && val === 'setenio')
        selSet = true;
      if (e[val] === true && val === 'generation')
        selGen = true;
    });

    let it = null;
    const nIt = [];
    if (sf.length > 0) {
      it = await this._student.getAll();
      it.forEach(function(st?: Student) {
        if (selComp)
          if (typeof (st.company) !== 'undefined' && st.company.companyId !== '') {
            const n = st.company._company.name;
            delete st.company;
            Object.assign(st, { company: n });
          } else {
            delete st.company;
            Object.assign(st, { company: '' });
          }

        if (selSet) {
          const age = differenceInYears(new Date(), new Date(st.dateBirth)) || 0;
          let seven = 1;
          for (let i = 0; i <= 120; i += 7)
            if (age >= i && age < i + 8) break;
            else seven += 1;
          Object.assign(st, { setenio: seven });
        }
        if (selGen) {
          let g = '';
          if (st.dateBirth) {
            const year = new Date(st.dateBirth).getFullYear();
            if (year >= 1943 && year <= 1960) g = 'BB';
            else if (year >= 1961 && year <= 1981) g = 'GX';
            else if (year >= 1982 && year <= 2004) g = 'GY';
            else if (year >= 2005 && year <= 2022) g = 'GZ';
          }
          Object.assign(st, { generation: g });
        }
        const nSt = ld.pick(st, sf);
        nIt.push(nSt);
      });
    } else {
      it = await this._student.getAll();
      it.forEach(function(st?: Student) {
        const { address, authType, childrens, company, course, social, ...nSt } = st;
        nIt.push(nSt);
      });
    }

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(nIt[0]);
    const csv = nIt.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    saveAs(blob, 'students.csv');
    this.loadingExp = false;
  }
}
