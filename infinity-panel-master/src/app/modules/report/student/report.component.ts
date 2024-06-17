import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Access } from 'src/app/models/access';
import { Student } from 'src/app/models/student';
import { Assessment } from 'src/app/models/assessment';
import { Application } from 'src/app/models/application';

import { UtilService } from 'src/app/services/util.service';
import { RemoveHtmlPipe } from 'src/app/pipes/remove-html.pipe';
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
  selector: 'app-report-student',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportStudentComponent implements OnInit {

  loading = true;
  formGroup: FormGroup;
  result: {
    assessment: Assessment;
    applications: Application[];
  };
  accessList: Access[];
  assessments: Assessment[];

  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _student: StudentService,
    private _post: CompanyPostService,
    private _removeHtml: RemoveHtmlPipe,
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
      accessId: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.getAccess();
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

      // ASSESSMENT
      const assessment = this.assessments.find(assess => assess.id === value.assessmentId);

      // APPLICATION
      const applications = await this._application.getByAssementIdByAccessId(assessment.id, value.accessId);
      for (const application of applications) {
        application._student = Object.assign(new Student(), await this._student.getById(application.student.id));
        application._student['profiles'] = await this.getProfile(application.student.id, value.accessId);

        if (application._student.company)
          if (application._student.company.departmentId)
            application._student.company._department = await this._department.getById(application._student.company.departmentId);
      }

      applications.sort((a, b) => a.student.name.localeCompare(b.student.name));

      if (!applications.length) this._util.message('Nenhuma aplicação encontrada!', 'warn');
      else this.result = {assessment, applications};

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');
  }
}
