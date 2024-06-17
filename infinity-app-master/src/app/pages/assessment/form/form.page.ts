import { ActivatedRoute } from '@angular/router';
import { IonSlides, NavController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { intervalToDuration, addMinutes, Duration } from 'date-fns';

import { Application, Answer } from 'src/app/models/application';
import { Assessment, Question } from 'src/app/models/assessment';

import { RandomPipe } from 'src/app/pipes/random.pipe';

import { UtilService } from 'src/app/services/util.service';
import { ApplicationService } from 'src/app/services/firebase/application.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';
import { AssessmentGroupService } from 'src/app/services/firebase/assessment/group.service';
import { AssessmentQuestionService } from 'src/app/services/firebase/assessment/question.service';
import { AssessmentInstructionService } from 'src/app/services/firebase/assessment/instruction.service';

@Component({
  selector: 'app-assessment-form',
  templateUrl: 'form.page.html',
  styleUrls: ['form.page.scss']
})
export class AssessmentFormPage implements OnInit {

  @ViewChild('slides') ionSlides: IonSlides;

  isEnd = false;
  isBeginning = true;
  showProfile = false;
  showSuccess = false;
  showingQuestion = false;

  slideOpts = {
    autoHeight: true,
    allowTouchMove: false
  };

  percentage = 0;
  activeIndex = 0;
  formGroup: FormGroup;
  assessment: Assessment;
  data = new Application();

  timer: Duration;
  resultProfile: {
    lion: number;
    dog: number;
    monkey: number;
    peacock: number;
    type: 'dog' | 'lion' | 'monkey' | 'peacock';
  };

  constructor(
    private _util: UtilService,
    private randomPipe: RandomPipe,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private _group: AssessmentGroupService,
    private _assessment: AssessmentService,
    private activatedRoute: ActivatedRoute,
    private _application: ApplicationService,
    private _question: AssessmentQuestionService,
    private _instruction: AssessmentInstructionService,
  ) { }

  async ngOnInit() {
    const loader = await this._util.loading();

    await this.getAssessment();
    await this.checkStarted();

    loader.dismiss();
  }

  get controls() {
    return this.formGroup?.controls;
  }

  async getAssessment() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const accessId = this.activatedRoute.snapshot.paramMap.get('accessId');

    await this._assessment.getById(id).then(async assessment => {
      this.assessment = assessment;
      this.data.assessment = {
        accessId,
        id: assessment.id,
        name: assessment.name
      };
      await this.getInstructions();
      await this.getQuestions();
    }).catch(err => {
      this._util.message('Assessment não encontrado!');
      this.goToBack();
    });
  }

  async getInstructions() {
    this.assessment._instructions = [];
    for (const instructionId of this.assessment.instructions) {
      const instruction = await this._instruction.getById(instructionId);
      this.assessment._instructions.push(instruction);
    }
  }

  async getQuestions() {
    this.assessment._groups = [];
    this.assessment._questions = [];
    for (const groupId of this.assessment.groups) {
      const group = await this._group.getById(groupId);
      group._questions = [];

      for (const questionId of group.questions) {
        const question = await this._question.getById(questionId);
        this.assessment._questions.push(question);
        group._questions.push(question);
      }

      this.assessment._groups.push(group);
    }

    this.assessment._questions = this.randomPipe.transform(this.assessment._questions);
  }

  getFormGroup(type: 'neuro' | 'profile' | 'objective') {
    if (type === 'neuro')
      return this.formBuilder.group({
        questionId: ['', Validators.required],
        neuro: this.formBuilder.group({
          intensity: ['', Validators.required],
          satisfaction: ['', Validators.required]
        })
      });
    else
      return this.formBuilder.group({
        questionId: ['', Validators.required],
        alternative: ['', Validators.required]
      });
  }

  async checkStarted() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const accessId = this.activatedRoute.snapshot.paramMap.get('accessId');
    const app = await this._application.getByAssessmentIdByAccessId(id, accessId).catch(_ => {});

    if (app && !app.end) {
      const end = addMinutes(new Date(app.init), this.assessment.duration);
      const inProgress = new Date() < end;

      let message = 'Infelizmente o tempo máximo para realizar esse Assessment expirou.<br><br>Deseja fazer novamente?';
      if (inProgress) message = 'Você ainda não terminou esse Assessment.<br><br>Deseja continuar?';

      this._util.alertConfirm('Atenção!', message, 'sim', 'não').then(async _ => {
        if (inProgress) {
          const dones: Question[] = [];
          const notDones: Question[] = [];

          this.data = app;

          this.assessment._questions.forEach(question => {
            if (app.answers.find(answer => answer.question.id === question.id)) dones.push(question);
            else notDones.push(question);
          });

          this.assessment._questions = [...dones, ...this.randomPipe.transform(notDones)];
          const index = this.assessment.instructions.length + dones.length;
          this.ionSlides.slideTo(index);
          this.isEnd = await this.ionSlides.isEnd();
          this.isBeginning = await this.ionSlides.isBeginning();
          this.updatePercent();
        } else await this._application.delete(app.id, true);
      }).catch(_ => this.goToBack());
    }
  }

  async slideChanged() {
    this.activeIndex = await this.ionSlides.getActiveIndex();
    if (this.activeIndex + 1 > this.assessment._instructions.length) {
      const index = this.activeIndex - this.assessment._instructions.length;
      this.showingQuestion = true;
      const question = this.assessment._questions[index];
      this.formGroup = this.getFormGroup(question.type);

      const answer = this.data.answers.find(ans => ans.question.id === question.id);
      if (answer) this.formGroup.patchValue(answer);

      this.controls.questionId.setValue(question.id);
    } else {
      this.formGroup = null;
      this.showingQuestion = false;
    }
  }

  async prev() {
    this.ionSlides.slidePrev();
    this.isEnd = await this.ionSlides.isEnd();
    this.isBeginning = await this.ionSlides.isBeginning();
  }

  async next() {
    try {
      if (this.isEnd) {
        const loader = await this._util.loading('Salvando...');
        this.data.end = new Date();
        await this.onSubmit().catch(error => this._util.message(error));
        loader.dismiss();
      } else {
        if (this.showingQuestion) await this.onSubmit();
        else if (this.activeIndex + 1 === this.assessment.instructions.length && !this.data.id) await this.createApplication();

        this.ionSlides.slideNext();
        this.isEnd = await this.ionSlides.isEnd();
        this.isBeginning = await this.ionSlides.isBeginning();
      }
    } catch (error) {
      if (error) this._util.message(error);
    }
  }

  updatePercent() {
    this.percentage = this.data.answers.length / this.assessment._questions.length;
  }

  async createApplication() {
    await this._util.alertConfirm(
      'Atenção!',
      `Você tem ${this.assessment.duration} minutos, a partir de agora para concluir.<h4>Boa sorte!</h4>`,
      'Iniciar', 'cancelar'
    ).then(async _ => {
      const loader = await this._util.loading('Iniciando...');
      await this._application.save(this.data).then(id => {
        if (id) this.data.id = id;
      });
      loader.dismiss();
    });
  }

  getResultProfile() {
    let dog = 0;
    let lion = 0;
    let monkey = 0;
    let peacock = 0;
    const total = this.data.answers.length;

    for (const answer of this.data.answers)
      if (answer.alternative === 'dog') dog += 1;
      else if (answer.alternative === 'lion') lion += 1;
      else if (answer.alternative === 'monkey') monkey += 1;
      else if (answer.alternative === 'peacock') peacock += 1;

    dog = (dog / total) * 100;
    lion = (lion / total) * 100;
    monkey = (monkey / total) * 100;
    peacock = (peacock / total) * 100;

    const type = [
      { type: 'dog', value: dog },
      { type: 'lion', value: lion },
      { type: 'monkey', value: monkey },
      { type: 'peacock', value: peacock }
    ].sort((a, b) => b.value - a.value)[0].type as 'dog' | 'lion' | 'monkey' | 'peacock';

    this.resultProfile = {
      type,
      dog,
      lion,
      monkey,
      peacock
    };
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      const value = this.formGroup.value;
      value.question = this.assessment._questions.find(question => question.id === value.questionId);
      delete value.questionId;
      const answer = Object.assign(new Answer(), value) as Answer;

      const index = this.data.answers.findIndex(ans => ans.question.id === value.question.id);
      if (index >= 0) this.data.answers[index] = answer;
      else this.data.answers.push(answer);

      await this._application.update(this.data.id, this.data).then(_ => {
        if (this.isEnd) {
          this.timer = intervalToDuration({start: this.data.init, end: this.data.end});

          if (this.assessment.type === 'profile') this.getResultProfile();

          this.showSuccess = true;
        }
        this.updatePercent();
      });
    } else return Promise.reject('Preencha os dados corretamente antes de prosseguir!');
  }

  goToBack() {
    if (this.data.id && !this.data.end)
      this._util.alertConfirm('Atenção!', 'Deseja mesmo sair?', 'Sim', 'Não')
        .then(_ => this.navCtrl.navigateBack('/tabs/assessment'))
        .catch(_ => {});
    else this.navCtrl.back();
  }
}
