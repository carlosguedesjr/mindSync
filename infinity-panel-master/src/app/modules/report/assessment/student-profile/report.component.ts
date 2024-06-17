import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { intervalToDuration } from 'date-fns';
import { saveAs } from 'file-saver';

import { Access } from 'src/app/models/access';
import { Student } from 'src/app/models/student';
import { Answer, Application } from 'src/app/models/application';
import { Assessment, Group, Question } from 'src/app/models/assessment';

import { UtilService } from 'src/app/services/util.service';
import { AccessService } from 'src/app/services/firebase/access.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { ApplicationService } from 'src/app/services/firebase/application.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';
import { AssessmentGroupService } from 'src/app/services/firebase/assessment/group.service';

@Component({
  selector: 'app-report-assessment-profile',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportAssessmentStudentProfileComponent implements OnInit {

  loading = true;
  formGroup: FormGroup;
  result: {
    groups: Group[];
    student: Student;
    application: Application;
  };
  students: Student[];
  accessList: Access[];
  assessments: Assessment[];

  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private formBuilder: FormBuilder,
    private _student: StudentService,
    private _group: AssessmentGroupService,
    private _assessment: AssessmentService,
    private _application: ApplicationService,
    public dialog: MatDialog,
  ) {
    this.formGroup = this.formBuilder.group({
      assessmentId: new FormControl('', Validators.required),
      studentId: new FormControl('', Validators.required),
      accessId: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.getAccess();
    await this.getStudents();
    await this.getAssessments();
    this.loading = false;
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getAssessments() {
    this.assessments = await this._assessment.getWhere('type', '==', 'profile');
  }

  async getAccess() {
    this.accessList = await this._access.getAll('code');
  }

  async getStudents() {
    const students = await this._student.getAll();
    this.students = students.map(student => {
      student['nameEmail'] = `${student.name} - ${student.email}`;
      return student;
    });
  }

  getResultByStudent(application: Application, question: Question) {
    return application.answers.find(answ => answ.question.id === question.id)?.getResultNeuro;
  }

  openExpModal(): void {
    const dialogRef = this.dialog.open(DialogContentExportReportComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getProfile(answers: Answer[]) {
    let dog = 0;
    let lion = 0;
    let monkey = 0;
    let peacock = 0;
    const total = answers.length;

    for (const answer of answers)
      if (answer.alternative === 'dog') dog += 1;
      else if (answer.alternative === 'lion') lion += 1;
      else if (answer.alternative === 'monkey') monkey += 1;
      else if (answer.alternative === 'peacock') peacock += 1;

    return [
      { type: 'dog', value: ((dog / total) * 100 || 0) },
      { type: 'lion', value: ((lion / total) * 100 || 0) },
      { type: 'monkey', value: ((monkey / total) * 100 || 0) },
      { type: 'peacock', value: ((peacock / total) * 100 || 0) }
    ];
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      this.loading = true;
      this.result = null;
      const value = this.formGroup.value;

      // STUDENTS
      const student = this.students.find(stud => stud.id === value.studentId);

      // ASSESSMENT
      const assessment = this.assessments.find(assess => assess.id === value.assessmentId);

      // APPLICATION
      const groups = [];
      const applications = await this._application.getByAssementIdByStudentIdByAccessId(assessment.id, student.id, value.accessId);
      const application = applications[0];
      if (application) {
        application.answers = application.answers.map(answer => Object.assign(new Answer(), answer));
        const profiles = this.getProfile(application.answers);
        student['profiles'] = profiles.sort((a, b) => b.value - a.value);

        // DURATION
        if (application.end) {
          const duration = intervalToDuration({ start: application.init, end: application.end });
          application._duration = '';
          if (duration.days) application._duration += `${duration.days}d`;
          if (duration.hours) application._duration += `${duration.hours}h`;
          application._duration += `${duration.minutes}min`;
        }

        // GROUP
        for (const groupId of assessment.groups) {
          const group = await this._group.getById(groupId);
          const answers = application.answers.filter(answ => group.questions.includes(answ.question.id));

          group['result'] = this.getProfile(answers);
          groups.push(group);
        }

        this.result = { groups, student, application };
      } else this._util.message('Nenhuma aplicação encontrada!', 'warn');

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');
  }
}


@Component({
  selector: 'app-report-assessment-profile',
  templateUrl: './dialog-content-export.html',
})
export class DialogContentExportReportComponent implements OnInit {

  loadingExp = true;
  accessListDiag: Access[];
  assessmentsDiag: Assessment[];
  formGroupDiag: FormGroup;
  constructor(
    private _accessDiag: AccessService,
    private _assessmentDiag: AssessmentService,
    private _studentDiag: StudentService,
    private _applicationDiag: ApplicationService,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
  ) {
    this.formGroupDiag = this.formBuilder.group({
      assessmentIdDiag: new FormControl('', Validators.required),
      accessIdDiag: new FormControl('', Validators.required),
    });

    this.loadingExp = false;
  }

  async ngOnInit(): Promise<void> {
    this.loadingExp = true;
    await this.getAccess();
    await this.getAssessments();
    this.loadingExp = false;
  }

  get controlsDiag() {
    return this.formGroupDiag.controls;
  }

  async getAssessments() {
    this.assessmentsDiag = await this._assessmentDiag.getWhere('type', '==', 'profile');
  }

  async getAccess() {
    this.accessListDiag = await this._accessDiag.getAll('code');
  }

  getProfile(answers: Answer[]) {
    let dog = 0;
    let lion = 0;
    let monkey = 0;
    let peacock = 0;
    const total = answers.length;

    for (const answer of answers)
      if (answer.alternative === 'dog') dog += 1;
      else if (answer.alternative === 'lion') lion += 1;
      else if (answer.alternative === 'monkey') monkey += 1;
      else if (answer.alternative === 'peacock') peacock += 1;

    return [
      { type: 'dog', value: ((dog / total) * 100 || 0) },
      { type: 'lion', value: ((lion / total) * 100 || 0) },
      { type: 'monkey', value: ((monkey / total) * 100 || 0) },
      { type: 'peacock', value: ((peacock / total) * 100 || 0) }
    ];
  }

  async exportCSV() {
    this.loadingExp = true;
    const val = this.formGroupDiag.value;

    const nIt = [];

    // STUDENT
    const students = await this._studentDiag.getAll();
    const cc = await this._accessDiag.getById(val.accessIdDiag);

    // ASSESSMENT
    const assessment = this.assessmentsDiag.find(assess => assess.id === val.assessmentIdDiag);

    // APPLICATION
    const groups = [];
    students.forEach(async s => {
      const applications = await this._applicationDiag.getByAssementIdByStudentIdByAccessId(assessment.id, s.id, val.accessIdDiag);
      const application = applications[0];
      if (application) {
        application.answers = application.answers.map(answer => Object.assign(new Answer(), answer));
        const profiles = this.getProfile(application.answers);
        if (profiles)
          (s as any).prs = profiles.sort((a, b) => b.value - a.value)[0].type;
        else
          (s as any).prs = '';
        if (cc)
          (s as any).code = cc.code;
      }
      nIt.push({ name: s.name, profile: (s as any).prs, code: (s as any).code });
    });

    setTimeout(() => {
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
      saveAs(blob, 'students_profile.csv');
      this.loadingExp = false;

    }, 3000);
  }
}
