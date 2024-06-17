import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-report-assessment-neuro',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportAssessmentStudentNeuroComponent implements OnInit {

  loading = true;
  formGroup: FormGroup;
  result: {
    student: Student;
    assessment: Assessment;
    application: Application;
  };
  students: Student[];
  accessList: Access[];
  assessments: Assessment[];

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

  getPercent(group: Group) {
    const questions = group.questions;
    const application = this.result.application;

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
    const subscription = await this._subscription.getByAccessIdByStudentId(accessId, studentId).catch(_ => {});
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
      const student = Object.assign(new Student(), this.students.find(stud => stud.id === value.studentId));

      // ASSESSMENT
      const assessment = this.assessments.find(assess => assess.id === value.assessmentId);
      assessment._groups = [];
      assessment._questions = [];
      for (const groupId of assessment.groups) {
        const group = await this._group.getById(groupId);
        group._questions = [];
        for (const questionId of group.questions) {
          const question = await this._question.getById(questionId);
          group._questions.push(question);
          assessment._questions.push(question);
        }
        assessment._groups.push(group);
      }

      // APPLICATION
      const applications = await this._application.getByAssementIdByStudentIdByAccessId(assessment.id, student.id, value.accessId);
      const application = applications[0];
      if (application) {
        application.answers = application.answers.map(answer => Object.assign(new Answer(), answer));
        student['profiles'] = await this.getProfile(application.student.id, value.accessId);

        // DURATION
        if (application.end) {
          const duration = intervalToDuration({start: application.init, end: application.end});
          application._duration = '';
          if (duration.days) application._duration += `${duration.days}d`;
          if (duration.hours) application._duration += `${duration.hours}h`;
          application._duration += `${duration.minutes}min`;
        }

        if (student.company.companyId)
          student.company._company = await this._company.getById(student.company.companyId);
        if (student.company.branchId)
          student.company._branch = await this._branch.getById(student.company.branchId);
        if (student.company.departmentId)
          student.company._department = await this._department.getById(student.company.departmentId);
        if (student.company.postId)
          student.company._post = await this._post.getById(student.company.postId);

        this.result = {assessment, student, application};
      } else this._util.message('Nenhuma aplicação encontrada!', 'warn');

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');
  }
}
