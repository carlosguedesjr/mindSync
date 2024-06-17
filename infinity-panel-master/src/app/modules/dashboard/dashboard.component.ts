import { Component, OnInit } from '@angular/core';

import { Student } from 'src/app/models/student';
import { Company } from 'src/app/models/company';

import { StudentService } from 'src/app/services/firebase/student.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loading = true;
  students: Student[] = [];
  companies: Company[] = [];

  constructor(
    private _company: CompanyService,
    private _student: StudentService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.students = await this._student.getAllActive();
    this.companies = await this._company.getAllActive();
    this.loading = false;
  }
}
