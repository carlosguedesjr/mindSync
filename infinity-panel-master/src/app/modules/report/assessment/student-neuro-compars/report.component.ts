import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { intervalToDuration } from 'date-fns';

import { Access } from 'src/app/models/access';
import { Student } from 'src/app/models/student';
import { Answer, Application } from 'src/app/models/application';
import { Assessment, Group, Question } from 'src/app/models/assessment';

import { UtilService } from 'src/app/services/util.service';
import { AccessService } from 'src/app/services/firebase/access.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { ApplicationService } from 'src/app/services/firebase/application.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyPostService } from 'src/app/services/firebase/company/post.service';
import { SubscriptionService } from 'src/app/services/firebase/subscription.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';
import { AssessmentGroupService } from 'src/app/services/firebase/assessment/group.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';
import { AssessmentQuestionService } from 'src/app/services/firebase/assessment/question.service';

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs, fs } from 'file-saver';


function loadFile(url: any, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}

@Component({
  selector: 'app-report-assessment-neuro',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportAssessmentStudentComparisonNeuroCompleteComponent implements OnInit {

  loading = true;
  loadingExpPdf = false;
  formGroup: FormGroup;
  result: {
    studentOne: Student;
    studentTwo: Student;
    assessmentOne: Assessment;
    assessmentTwo: Assessment;
    applicationOne: Application;
    applicationTwo: Application;
  };
  students: Student[];
  accessList: Access[];
  assessments: Assessment[];

  studentNameOne: string;
  studentNameTwo: string;


  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _student: StudentService,
    private _post: CompanyPostService,
    private _branch: CompanyBranchService,
    private _group: AssessmentGroupService,
    private _assessment: AssessmentService,
    private _application: ApplicationService,
    private _subscription: SubscriptionService,
    private _question: AssessmentQuestionService,
    private _department: CompanyDepartmentService,
  ) {
    this.formGroup = this.formBuilder.group({
      assessmentId: new FormControl('', Validators.required),
      studentId_1: new FormControl('', Validators.required),
      studentId_2: new FormControl('', Validators.required),
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
    this.assessments = await this._assessment.getWhere('type', '==', 'neuro');
  }

  async getAccess() {
    this.accessList = await this._access.getAll();
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

  getPercent(group: Group, app: Application) {
    const questions = group.questions;
    const application = app;

    const converge = application.answers.filter(
      answer => questions.find(question => question === answer.question.id) && answer.resultIsConverge
    );
    const diverge = application.answers.filter(
      answer => questions.find(question => question === answer.question.id) && !answer.resultIsConverge
    );

    return {
      converge: converge.length / questions.length * 100,
      diverge: diverge.length / questions.length * 100
    };
  }

  async getProfile(studentId: string, accessId: string) {
    const subscription = await this._subscription.getByAccessIdByStudentId(accessId, studentId).catch(_ => { });
    if (!subscription) return null;
    let assessment: Assessment = null;
    for (const assessmentId of subscription.assessmentIds) {
      const assess = await this._assessment.getById(assessmentId);
      if (assess.type === 'profile') assessment = assess;
    }
    if (!assessment) return null;
    const application = (await this._application.getByAssementIdByStudentIdByAccessId(assessment.id, studentId, accessId))[0];
    if (!application) return null;

    let dog = 0;
    let lion = 0;
    let monkey = 0;
    let peacock = 0;
    const total = application.answers.length;

    for (const answer of application.answers)
      if (answer.alternative === 'dog') dog += 1;
      else if (answer.alternative === 'lion') lion += 1;
      else if (answer.alternative === 'monkey') monkey += 1;
      else if (answer.alternative === 'peacock') peacock += 1;

    const result = [
      { type: 'dog', value: (dog / total) * 100 },
      { type: 'lion', value: (lion / total) * 100 },
      { type: 'monkey', value: (monkey / total) * 100 },
      { type: 'peacock', value: (peacock / total) * 100 }
    ];
    return result.sort((a, b) => b.value - a.value);
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      this.loading = true;
      this.result = null;
      const value = this.formGroup.value;

      // STUDENT
      const studentOne = Object.assign(new Student(), this.students.find(stud => stud.id === value.studentId_1));
      const studentTwo = Object.assign(new Student(), this.students.find(stud => stud.id === value.studentId_2));
      this.studentNameOne = studentOne.name;
      this.studentNameTwo = studentTwo.name;

      // ASSESSMENT
      const assessmentOne = this.assessments.find(assess => assess.id === value.assessmentId);
      assessmentOne._groups = [];
      assessmentOne._questions = [];
      for (const groupId of assessmentOne.groups) {
        const group = await this._group.getById(groupId);
        group._questions = [];
        for (const questionId of group.questions) {
          const question = await this._question.getById(questionId);
          group._questions.push(question);
          assessmentOne._questions.push(question);
        }
        assessmentOne._groups.push(group);
      }

      const assessmentTwo = this.assessments.find(assess => assess.id === value.assessmentId);
      assessmentTwo._groups = [];
      assessmentTwo._questions = [];
      for (const groupId of assessmentTwo.groups) {
        const group = await this._group.getById(groupId);
        group._questions = [];
        for (const questionId of group.questions) {
          const question = await this._question.getById(questionId);
          group._questions.push(question);
          assessmentTwo._questions.push(question);
        }
        assessmentTwo._groups.push(group);
      }

      // APPLICATION - studentOne
      const applicationsOne = await this._application.getByAssementIdByStudentIdByAccessId(assessmentOne.id, studentOne.id, value.accessId);
      const applicationOne = applicationsOne[0];
      if (applicationOne) {
        applicationOne.answers = applicationOne.answers.map(answer => Object.assign(new Answer(), answer));
        studentOne['profiles'] = await this.getProfile(applicationOne.student.id, value.accessId);

        // DURATION
        if (applicationOne.end) {
          const duration = intervalToDuration({ start: applicationOne.init, end: applicationOne.end });
          applicationOne._duration = '';
          if (duration.days) applicationOne._duration += `${duration.days}d`;
          if (duration.hours) applicationOne._duration += `${duration.hours}h`;
          applicationOne._duration += `${duration.minutes}min`;
        }

        if (studentOne.company.companyId)
          studentOne.company._company = await this._company.getById(studentOne.company.companyId);
        if (studentOne.company.branchId)
          studentOne.company._branch = await this._branch.getById(studentOne.company.branchId);
        if (studentOne.company.departmentId)
          studentOne.company._department = await this._department.getById(studentOne.company.departmentId);
        if (studentOne.company.postId)
          studentOne.company._post = await this._post.getById(studentOne.company.postId);

        // this.result = { assessment, studentOne, studentTwo, applicationOne };
      } else this._util.message('Nenhuma aplicação encontrada para estudante 1!', 'warn');


      // APPLICATION - studentOne
      const applicationsTwo = await this._application.getByAssementIdByStudentIdByAccessId(assessmentTwo.id, studentTwo.id, value.accessId);
      const applicationTwo = applicationsTwo[0];
      if (applicationTwo) {
        applicationTwo.answers = applicationTwo.answers.map(answer => Object.assign(new Answer(), answer));
        studentOne['profiles'] = await this.getProfile(applicationTwo.student.id, value.accessId);

        // DURATION
        if (applicationTwo.end) {
          const duration = intervalToDuration({ start: applicationTwo.init, end: applicationTwo.end });
          applicationTwo._duration = '';
          if (duration.days) applicationTwo._duration += `${duration.days}d`;
          if (duration.hours) applicationTwo._duration += `${duration.hours}h`;
          applicationTwo._duration += `${duration.minutes}min`;
        }

        if (studentTwo.company.companyId)
          studentTwo.company._company = await this._company.getById(studentTwo.company.companyId);
        if (studentTwo.company.branchId)
          studentTwo.company._branch = await this._branch.getById(studentTwo.company.branchId);
        if (studentTwo.company.departmentId)
          studentTwo.company._department = await this._department.getById(studentTwo.company.departmentId);
        if (studentTwo.company.postId)
          studentTwo.company._post = await this._post.getById(studentTwo.company.postId);

        this.result = { assessmentOne, assessmentTwo, studentOne, studentTwo, applicationOne, applicationTwo };
      } else this._util.message('Nenhuma aplicação encontrada para estudante 2!', 'warn');

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');

  }
}
