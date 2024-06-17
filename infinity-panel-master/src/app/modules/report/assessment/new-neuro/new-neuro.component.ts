import { Component, OnInit } from '@angular/core';
import $ from 'jquery';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { intervalToDuration } from 'date-fns';

import { Access } from 'src/app/models/access';
import { Student } from 'src/app/models/student';
import { Answer, Application } from 'src/app/models/application';
import { Assessment, Group, Question } from 'src/app/models/assessment';

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
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';



@Component({
  selector: 'app-new-neuro',
  templateUrl: './new-neuro.component.html',
  styleUrls: ['./new-neuro.component.scss']
})
export class NewNeuroComponent implements OnInit {
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
    private _area: CompanyAreaService,
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

  getResultByStudent(application: Application, question: Question) {
    return application.answers.find(answ => answ.question.id === question.id)?.getResultNeuro;
  }

  getPercent(group: Group, application: Application) {
    const questions = group.questions;

    const converge = application.answers.filter(
      answer => questions.find(question => question === answer.question.id) && answer.resultIsConverge
    );
    const diverge = application.answers.filter(
      answer => questions.find(question => question === answer.question.id) && !answer.resultIsConverge
    );

    const imc = application.answers.filter(
      answer => questions.find(question => question === answer.question.id) && answer.resultIsIMC
    );
    const imd = application.answers.filter(
      answer => questions.find(question => question === answer.question.id) && answer.resultIsIMD
    );

    return {
      imc: imc.length / questions.length * 100,
      imd: imd.length / questions.length * 100,
      converge: converge.length / questions.length * 100,
      diverge: diverge.length / questions.length * 100
    };
  }

  getAllConvergeDiverge(application: Application, assessment: Assessment) {
    const converge = application.answers.filter(answer => answer.resultIsConverge);
    const diverge = application.answers.filter(answer => !answer.resultIsConverge);
    return {
      converge: converge.length / assessment._questions.length * 100,
      diverge: diverge.length / assessment._questions.length * 100
    };
  }

  getAllConvergeDivergeLeader(application: Application, leader: Application, assessment: Assessment) {
    const converge = application.answers.filter(answer => {
      const leaderAnswer = leader.answers.find(answ => answ.question.id === answer.question.id);
      return leaderAnswer && Answer.isConverge(leaderAnswer.getResultNeuro, answer.getResultNeuro);
    });
    const diverge = application.answers.filter(answer => {
      const leaderAnswer = leader.answers.find(answ => answ.question.id === answer.question.id);
      return leaderAnswer && !Answer.isConverge(leaderAnswer.getResultNeuro, answer.getResultNeuro);
    });
    return {
      converge: converge.length / assessment._questions.length * 100,
      diverge: diverge.length / assessment._questions.length * 100
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

  downlCSV() {
    let data = '';
    const tableData = [];
    const rows = $('table tr');
    rows.each(function(_index: number, row: HTMLElement) {
      const rowData = [];
      $(row).find('th, td').each(function(_i: number, column: HTMLElement) {
        rowData.push(column.innerText);
      });
      tableData.push(rowData.join(','));
    });
    data += tableData.join('\n');

    this._util.downloadCSV(`assessment_neuro-${new Date().toJSON()}`, data);
  }

  downloadCSV() {
    let row = [];
    const csv = [];
    const separator = ';';

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push(app._student.name);
      row.push('');
      row.push('');
      row.push('');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Duração');
      row.push(app._duration || '---');
      row.push('Perfil Principal');
      if (app._student['profiles'])
        if (app._student['profiles'][0].type === 'lion') row.push('Leão');
        else if (app._student['profiles'][0].type === 'dog') row.push('Cachorro');
        else if (app._student['profiles'][0].type === 'monkey') row.push('Macaco');
        else if (app._student['profiles'][0].type === 'peacock') row.push('Pavão');
        else row.push('---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Gênero');
      row.push(app._student.genre || '---');
      row.push('Perfil Secundário');
      if (app._student['profiles'])
        if (app._student['profiles'][1].type === 'lion') row.push('Leão');
        else if (app._student['profiles'][1].type === 'dog') row.push('Cachorro');
        else if (app._student['profiles'][1].type === 'monkey') row.push('Macaco');
        else if (app._student['profiles'][1].type === 'peacock') row.push('Pavão');
        else row.push('---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Idade');
      row.push(app._student.getAge || '---');
      row.push('Geração');
      row.push(app._student.getGeneration || '---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Filhos');
      row.push(app._student.childrens || '---');
      row.push('Ranking Convergência');
      row.push(app._student['rankConverge'] || '---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Empresa');
      row.push(app._student.company._company.name || '---');
      row.push('Ranking Divergência');
      row.push(app._student['rankDiverge'] || '---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Entidade');
      row.push(app._student.company._department.name || '---');
      row.push('Convergência Líder');
      row.push(app._student['leaderConverge'] || '---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Cargo');
      row.push(app._student.company._post.name || '---');
      row.push('Divergência Líder');
      row.push(app._student['leaderDiverge'] || '---');
    }
    csv.push(row.join(separator));

    row = ['', '', ''];
    for (const app of this.result.applications) {
      row.push('');
      row.push('Setênio');
      row.push(app._student.getSeven || '---');
      row.push('Convergência Equipe');
      row.push(app._student['teamConverge'] || '---');
    }
    csv.push(row.join(separator));

    row = [`Questões ${this.result.assessment.name}`, '', '', 'Respostas Esperadas'];
    for (const app of this.result.applications) {
      row.push('Escolaridade');
      row.push(app._student.scholarity || '---');
      row.push('Divergência Equipe');
      row.push(app._student['teamDiverge'] || '---');
      row.push('');
    }
    csv.push(row.join(separator));

    for (const group of this.result.assessment._groups) {
      for (const [index, question] of group._questions.entries()) {
        row = [];
        row.push(index === 0 ? group.name : '');
        row.push(index + 1);
        row.push(this._removeHtml.transform(question.text));
        row.push(question.result);

        for (const app of this.result.applications) {
          row.push(this.getResultByStudent(app, question) || '--');
          row.push('');
          row.push('');
          row.push('');
          row.push('');
        }
        csv.push(row.join(separator));
      }

      row = ['', '', ''];
      for (const app of this.result.applications) {
        const percent = this.getPercent(group, app);
        row.push('');
        row.push('IMC');
        row.push(`${percent.imc}%`);
        row.push('IMD');
        row.push(`${percent.imd}%`);
      }
      csv.push(row.join(separator));

      row = ['', '', ''];
      for (const app of this.result.applications) {
        const percent = this.getPercent(group, app);
        row.push('');
        row.push('C');
        row.push(`${percent.converge}%`);
        row.push('D');
        row.push(`${percent.diverge}%`);
      }
      csv.push(row.join(separator));
    }
    const content = csv.join('\n');
    this._util.downloadCSV(`assessment_neuro-${new Date().toJSON()}`, content);
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      this.loading = true;
      this.result = null;
      const value = this.formGroup.value;

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
      let applications = await this._application.getByAssementIdByAccessId(assessment.id, value.accessId);
      for (const application of applications) {
        // DURATION
        if (application.end) {
          const duration = intervalToDuration({ start: application.init, end: application.end });
          application._duration = '';
          if (duration.days) application._duration += `${duration.days}d`;
          if (duration.hours) application._duration += `${duration.hours}h`;
          application._duration += `${duration.minutes}min`;
        }

        application.answers = application.answers.map(answer => Object.assign(new Answer(), answer));
        application._student = Object.assign(new Student(), await this._student.getById(application.student.id));
        application._student['profiles'] = await this.getProfile(application.student.id, value.accessId);

        const convergeDiverge = this.getAllConvergeDiverge(application, assessment);
        application._student['converge'] = convergeDiverge.converge.toFixed(2);
        application._student['diverge'] = convergeDiverge.diverge.toFixed(2);

        if (application._student.company) {
          if (application._student.company.companyId)
            application._student.company._company = await this._company.getById(application._student.company.companyId);
          if (application._student.company.branchId)
            application._student.company._branch = await this._branch.getById(application._student.company.branchId);
          if (application._student.company.departmentId)
            application._student.company._department = await this._department.getById(application._student.company.departmentId);
          if (application._student.company.areaId)
            application._student.company._area = await this._area.getById(application._student.company.areaId);
          if (application._student.company.postId) {
            application._student.company._post = await this._post.getById(application._student.company.postId);
            const leader = applications.find(x =>
              x._student && x._student.company && x._student.company._post &&
              x._student.company._post.level === application._student.company._post.level + 1
            );
            if (leader) {
              const convergeDivergeLeader = this.getAllConvergeDivergeLeader(application, leader, assessment);
              application._student['leaderConverge'] = convergeDivergeLeader.converge;
              application._student['leaderDiverge'] = convergeDivergeLeader.diverge;
            }
          }
        }
      }

      // RANKING
      const rankingConverge = applications.sort((a, b) => b._student['converge'] - a._student['converge']);
      const rankingDiverge = applications.sort((a, b) => b._student['diverge'] - a._student['diverge']);
      applications = applications.map(app => {
        const rankConverge = rankingConverge.findIndex(x => x.student.id === app.student.id) + 1;
        const rankDiverge = rankingDiverge.findIndex(x => x.student.id === app.student.id) + 1;
        app._student['rankConverge'] = `${rankConverge}º`;
        app._student['rankDiverge'] = `${rankDiverge}º`;
        return app;
      });

      // TEAM RANKING
      for (const application of applications) {
        const teams = applications.filter(app => app._student.company.areaId === application._student.company.areaId);
        const rankingTeamConverge = teams.sort((a, b) => b['converge'] - a['converge']);
        const rankingTeamDiverge = teams.sort((a, b) => b['diverge'] - a['diverge']);
        const rankConverge = rankingTeamConverge.findIndex(x => x.student.id === application.student.id) + 1;
        const rankDiverge = rankingTeamDiverge.findIndex(x => x.student.id === application.student.id) + 1;
        application._student['teamConverge'] = `${rankConverge}º`;
        application._student['teamDiverge'] = `${rankDiverge}º`;
      }

      applications.sort((a, b) => a.student.name.localeCompare(b.student.name));

      if (!applications.length) this._util.message('Nenhuma aplicação encontrada!', 'warn');
      else this.result = { assessment, applications };

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');
  }
}
