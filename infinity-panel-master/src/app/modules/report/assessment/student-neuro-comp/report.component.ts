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

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs, fs } from 'file-saver';
import { debug, log } from 'console';
import { FirebaseService } from 'src/app/services/api/firebase.service';
import { HttpClient } from '@angular/common/http';
import { DocxTemplaterService } from 'src/app/services/docxtemplater.service';
import { AddTreatLetters } from 'src/app/services/addTreatLetters.service';
import { SnackBarService } from 'src/app/services/barSnack.service';

function loadFile(url: any, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}

@Component({
  selector: 'app-report-assessment-neuro',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportAssessmentStudentNeuroCompleteComponent implements OnInit {

  loading = true;
  loadingExpPdf = false;
  formGroup: FormGroup;
  result: {
    student: Student;
    assessment: Assessment;
    application: Application;
  };
  students: Student[];
  accessList: Access[];
  assessments: Assessment[];
  studentMail: string = '';
  studentName: string;
  dataDocx: any;
  fileDOCX: any;

  constructor(
    private _util: UtilService,
    private _access: AccessService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _post: CompanyPostService,
    private _branch: CompanyBranchService,
    private _group: AssessmentGroupService,
    private _assessment: AssessmentService,
    private _studentService: StudentService,
    private _application: ApplicationService,
    private _subscription: SubscriptionService,
    private _question: AssessmentQuestionService,
    private _department: CompanyDepartmentService,
    private doxTemplServ: DocxTemplaterService,
    private addTreatLetter: AddTreatLetters,
    private _firebaseServ: FirebaseService,
    private snackBarServ: SnackBarService,
    private http: HttpClient
  ) {
    this.formGroup = this.formBuilder.group({
      assessmentId: new FormControl('', Validators.required),
      studentId: new FormControl('', Validators.required),
      accessId: new FormControl('', Validators.required),
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    console.log('Inicio getAccess');
    await this.getAccess();
    console.log('Inicio getStudents');
    await this.getStudents();
    console.log('Inicio getAssessments');
    await this.getAssessments();
    this.loading = false;
    console.log('students: ', this.students);
  }

  get controls() {
    return this.formGroup.controls;
  }

  async getAssessments() {
    this.assessments = await this._assessment.getWhere('type', '==', 'neuro');
    console.log('FIM getAssessments');
  }

  async getAccess() {
    this.accessList = await this._access.getAll();
    console.log('FIM getAccess');
    
  }

  async getStudents() {
    // const students = await this._studentService.getAll();
    //  this.students = students.map(student => {
    //   student['nameEmail'] = `${student.name} - ${student.email}`;
    //   return student;
    // });
    // console.log('FIM getStudents');

  
    this._firebaseServ.getAllIdNameEmail().subscribe({
      next:(res: any)=>{
        this.students = res.map(student => {
          if(student.image) console.log('Tem Foto:' , `${student.name}`);
          student['nameEmail'] = `${student.name} - ${student.email}`;
          return student;
        })
        console.log('students->: ', this.students);
      },error:(err)=>{
        console.log('students err->', err);
      },complete:()=>{}
    });
  }

  getResultByStudent(application: Application, question: Question) {
    return application.answers.find(answ => answ.question.id === question.id)?.getResultNeuro;
  }

  resultIsConverge(application: Application, question: Question) {
    return application.answers.find(answ => answ.question.id === question.id)?.resultIsConverge;
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
      const student = Object.assign(new Student(), this.students.find(stud => stud.id === value.studentId));
      this.studentName = student.name;      

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
          const duration = intervalToDuration({ start: application.init, end: application.end });
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

        this.result = { assessment, student, application };
      } else this._util.message('Nenhuma aplicação encontrada!', 'warn');

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');

  }

  async expToPdf() {
    console.log('start - expToPdf');
    
    // Consumir a Api do Students com os campos específicos e colocar na variável global this.students

    if (this.formGroup.valid) {
      this.loading = true;
      this.result = null;
      const data = document.getElementById('pdfDiv');
      const value = this.formGroup.value;

      // STUDENT
      const student = Object.assign(new Student(), this.students.find(stud => stud.id === value.studentId));
      this.studentName = student.name;
      this.studentMail = student.email;

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
          const duration = intervalToDuration({ start: application.init, end: application.end });
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

        this.result = { assessment, student, application };
        const ap = this.result.application;
        const dimens = {
          'COMUNICAÇÃO EFICAZ': {
            d: '',
            c: '',
            rec: ''
          },
          'PRINCÍPIOS DE LIDERANÇA': {
            d: '',
            c: '',
            rec: ''
          },
          'APRENDIZ/CONHECIM.': {
            d: '',
            c: '',
            rec: ''
          },
          'ESPÍRITO DE EQUIPE': {
            d: '',
            c: '',
            rec: ''
          },
          'FOCO NO RESULTADO': {
            d: '',
            c: '',
            rec: ''
          },
          'INOVAÇÃO/ MUDANÇA': {
            d: '',
            c: '',
            rec: ''
          },
          'COMPORT. ASSERTIVO': {
            d: '',
            c: '',
            rec: ''
          },
          'FIERGS': {
            d: '',
            c: '',
            rec: ''
          }
        };

        for (const group of this.result.assessment._groups)
          if (dimens[group.name]) {
            console.log('group.name -> ',dimens[group.name]);
            // debugger;
            dimens[group.name]['d'] = this.getPercent(group).diverge;
            dimens[group.name]['c'] = this.getPercent(group).converge;
            for (const question of group._questions) {
              const r = this.getResultByStudent(this.result.application, question);
              if (!this.resultIsConverge(this.result.application, question))
                if (question.recom)
                  dimens[group.name]['rec'] = dimens[group.name]['rec']  + '\u2022 ' + question.recom + '\n';
            }
          }

        const sGen = student.getGeneration;
        const gen = {
          GX: 'A época que nascemos exerce um influência muito grande na construção do nosso MINDSET, pois vivenciamos muitas mudanças, algumas delas econômicas, políticas, sociais, culturais e tecnológicas e que acabam servindo como referência na construção de nossos valores e da nossa forma de pensar e agir.\n\
            Aprendemos modelos e padrões sobre certo e errado, sobre o que é melhor ou pior e sobre o que mais ou menos arriscado para construção do nosso futuro.\n\
            Nos baseamos em tendências e modismos que aprendemos na época que nascemos e crescemos, tornando nossas decisões baseadas em nossas vivências e aprendizados dentro de cada geração.\n\
            Dessa forma, ao analisarmos a época em que você nasceu e as influências que recebeu, podemos dizer que você aprendeu o valor das coisas desde cedo.\n\
            Você vivenciou muitas crises econômicas na sua infância e adolescência, e aprendeu que receber presentes era algo muito especial, recebendo somente em ocasiões como natal, aniversário e dia das crianças, isso se estudasse e se comportasse durante o ano.\n\
            Os valores ensinados nessa época foram influenciados pelos programas de TV, pois junto com os desenhos animados, as brincadeiras na rua e os jogos de tabuleiro, você cresceu em um mundo analógico onde tudo era manual e a imaginação e a criatividade eram os principais elementos das brincadeiras.\n\
            Você aprendeu a fazer pesquisas escolares em enciclopédias e na biblioteca da escola, além de ter feito muitas provas impressas com o mimeógrafo. Talvez até ficasse cheirando o álcool na folha da prova.\n\
            Ter vivido nessa geração lhe ensinou a não ter frescuras, pois as crianças dessa época eram subprotegidas, ou seja, seus pais repreendiam os maus comportamentos, inclusive com palmadas, mas eram mais relapsos com cuidados pessoais e com a segurança, não por negligência, mas por praticidade.\n\
            Provavelmente você cresceu andando em carros sem cinto de segurança e até foi até algum lugar dentro do porta malas de um fusca ou de um fiat 147, a famosa "cachorreira". Você cresceu querendo aprender a dirigir e desejava ter um carro assim que fizesse 18 anos, bem como acreditava que fumar e beber eram elementos de autoafirmação para parecer adulto.\n\
            Você aprendeu a se preocupar mais se seus deveres estavam sendo cumpridos do que se estava tendo seus direitos respeitados, pois costumava ser repreendido e recebia castigos cada vez que falhava com suas obrigações ou faltava com o respeito com alguém.\n\
            Essa rigidez desenvolveu um grande senso de dever e ao mesmo deixou alguns um pouco mais rígidos e mais comprometidos com o trabalho, pois aprenderam a fazer o que precisava ser feito mesmo não gostando. Muitas mudanças como a popularização do divórcio, a entrada cedo no mercado de trabalho e assim como a sexualização precoce, fizeram essa geração questionar as instituições e suas regras quando se tornaram adultos, rompendo com muitos elementos da cultura dos seus pais em prol de maior liberdade.',
          GY: 'A época que nascemos exerce um influência muito grande na construção do nosso MINDSET, pois vivenciamos muitas mudanças, algumas delas econômicas, políticas, sociais, culturais e tecnológicas e que acabam servindo como referência na construção de nossos valores e da nossa forma de pensar e agir.\n\
            Aprendemos modelos e padrões sobre certo e errado, sobre o que é melhor ou pior e sobre o que mais ou menos arriscado para construção do nosso futuro.\n\
            Nos baseamos em tendências e modismos que aprendemos na época que nascemos e crescemos, tornando nossas decisões baseadas em nossas vivências e aprendizados dentro de cada geração.\n\
            Dessa forma, ao analisarmos a época em que você nasceu e as influências que recebeu, podemos dizer que você aprendeu a fazer o que deseja e a sonhar mais alto, devido a inflação controlada associada a liberdade econômica com a abertura do mercado e um certo controle da inflação.\n\
            Como você cresceu em um ambiente de muitas mudanças tecnológicas como o surgimento da internet e do celular, você adquiriu um senso de imediatismo muito intenso, pois os meios digitais geraram velocidade para pesquisas, comunicação, trabalho e estudo, tornando tarefas manuais muito demoradas e entediantes.\n\
            Ter crescido nessa geração lhe ensinou a ser mais preocupado com a consciência social, com os direitos humanos, com os direitos civis e das minorias, desenvolvendo a preocupação com a educação infantil e com a influência da tv sobre as crianças.\n\
            Desde cedo, desenvolveu também a preocupação com o meio ambiente, o consumo de carne, o efeito estufa e passou a rejeitar o tabagismo pois cresceu em uma geração superprotegida e muito mais informada, ou seja, seus pais, também mais informados, deixaram de punir os maus comportamentos com agressões físicas e passaram a usar mais o castigo e a conversa como apoio a uma educação mais consciente.\n\
            No entanto, a diminuição de situações de frustração, fez com que a maturidade e o senso de urgência profissional demorasse a se desenvolver, infantilizando muitos adultos.\n\
            Você cresceu querendo trabalhar com propósito e querendo descobrir uma carreira que pudesse ser feliz fazendo o que gosta e acredita.\n\
            A estabilidade da economia e uma condição financeira mais favorável, presente nas famílias dessa época, tirou a pressão financeira dos ombros dessa geração fazendo com que muitos postergassem a entrada no mercado de trabalho, suas decisões profissionais e a construção de suas famílias.\n\
            Já a saída da casa de seus pais passou a acontecer cada vez mais tarde, sendo comum ver adultos dessa geração cumprir essa etapa da vida mais próximo aos 30 anos de idade.\n\
            Com essa superproteção, você aprendeu a se preocupar mais se seus direitos estavam sendo respeitados do que se estava cumprindo seus deveres, pois acostumou a questionar seus superiores e a não trabalhar frustrado, principalmente por ainda ter respaldo de não ter que se sustentar e pela superproteção financeira e emocional de seus pais.\n\
            Ao mesmo tempo, desenvolveu uma grande capacidade de pensar e de desenvolver coisas novas pois cresceu não se importando com o status-quo e com o respeito às hierarquias e autoridades.Essa flexibilidade de pensamento, desenvolveu um grande senso de urgência para inovação e mudança, ao mesmo tempo deixou alguns, um pouco mais descompromissados com o trabalho e até sem rumo, pois sua insatisfação com o mundo e o apoio familiar, aliados a falta de responsabilidades financeiras, adiaram suas decisões  profissionais em busca de um mundo e de uma carreira ideal.\n\
            Muitas mudanças como o aprendizado desestruturado por meio da internet e a liberdade de pensamento, tornaram essa geração muito ágil para mudanças e com grande cede para mudar o mundo, porém a entrada tardia no mercado de trabalho e assim como a sexualização liberal, fizeram essa geração invalidar o poder das instituições estabelecidas e de suas regras.\n\
            Assim que cresceram e se tornaram adultos, romperam com os conceitos tradicionais e com as conquistas do passado, vivendo a sensação de que o mundo está começando com a sua presença,  e de que as conquistas anteriores serão substituídas pela inovação e tecnologia.',
          GZ: '',
          BB: ''
        };

        const sSetenio = student.getSeven;
        const setenio = {
          4: [
            'Emotiva',
            'Você está em uma fase da vida caracterizada pela instabilidade emocional, pois está em uma etapa de experimentação e tentativas sendo frequente o desejo por feedbacks constantes e orientação profissional em busca de estabilidade.\n\
            Seu crescimento mental está em pleno desenvolvimento, onde começa viver e experimentar a liberdade tão almejada nos anos anteriores.\n\
            Nesse momento você está buscando maior autonomia, escrevendo a própria história e desvinculando suas decisões de seus pais.\n\
            Tudo o que você aprendeu e viveu até agora, começa servir como base para a sua forma de pensar e decidir para que encontre seu lugar no mundo. Algumas vezes você se viu com dúvidas sobre o caminho a seguir e pode ter se sentido ansioso e até frustrado por isso, no entanto o desenvolvimento da maturidade e vivência de novas experiências tende a te ajudar a direcionar a sua carreira e eliminar as dúvidas.'
          ],
          5: [
            'Racional',
            'Você está em uma fase da vida marcada pela moderação, pois busca pensar mais antes de agir considerando mais sobre o que é justo e o que é correto em busca estabelecer sua forma de pensar e sua posição mundo.\n\
            É possível que você esteja conquistando o seu lugar no mercado de trabalho, porém está vivendo uma fase de muitas crises e dúvidas pois tem vivenciado o maior momento de cobrança de sua vida.\n\
            É possível que tenha a sensação de impotência e sinta sentimentos de frustração e angústia de forma constante, o que é normal. Você pode estar se questionando ou começando a se questionar se está no caminho certo, pois já percebe que não é mais tão jovem e sente que não pode perder tempo com más escolhas.\n\
            Ao mesmo tempo que já possui uma certa experiência de vida, ainda sente que precisa amadurecer mais, o que o torna mais suscetível a influências gerando transformação em sua forma de pensar e personalidade de forma a se enquadrar em um determinado lugar.\n\
            Esse momento de vida é onde mais aprendemos, onde começamos a ter uma maior noção sobre harmonia e começamos a analisar o passado e projetar o futuro.'
          ],
          6: [
            'Consciente',
            'Você está vivendo uma fase de questionamento dos seus próprios papeis na vida.\n\
            Provavelmente você está trabalhando de forma muito intensa e muito produtiva e sua carreira está avançando.\n\
            No entanto deve estar questionando se o que está fazendo está valendo a pena e se combina com a sua forma de ser, de pensar e com suas crenças e valores.\n\
            Você deve estar buscando intensamente sua autenticidade e devido a crescente maturidade e tem aumentando sua capacidade de julgamento.\n\
            Sua dedicação ao trabalho deve ter lhe colocado em uma situação financeira mais estável, ao mesmo tempo, pode estar se perguntando quais são os próximos passos? Quem sou eu? \n\
            Nesse momento onde suas decisões sobre casamento, família e carreira já devem estar encaminhadas, seu questionamento sobre a vida devem estar gerando maior interesse sobre sua espiritualidade o que o faz questionar tudo o que tem vivido até agora.\n\
            É provável que vocês esteja disposto a fazer rupturas e mudanças radicais em sua vida, pois a experiência e maturidade já te ajuda a saber o que não quer, porém ainda não responde exatamente o que quer para sua vida.'
          ],
          7: [
            'Imaginativa',
            'Você está vivendo uma fase em que está tentando viver de acordo com suas próprias convicções.\n\
            Sua consciência de vida já está mais desenvolvida e você já possui mais clareza do que gosta e do que é apenas obrigação na carreira.\n\
            Nesse momento você já superou muitas dificuldades em sua vida, mas seus questionamentos dos últimos anos, podem ter levado você a recomeçar em diversas áreas como casamento, profissão e carreira.\n\
            Provavelmente você passou por crises e questionamento nos últimos anos, que foram imprescindíveis para construir o seu MINDSET de hoje.\n\
            Sua vitalidade não é a mesma de quando tinha 20 anos, no entanto você está na fase mais produtiva da sua vida e sua maturidade é uma grande ferramenta para sua autoafirmação e para construção da sua autenticidade.\n\
            Você não quer mais perder tempo com nada que não valha a pena para sua vida e seu senso de urgência está com tudo.\n\
            Frequentemente você contrasta o que está vivendo com memórias saudosista de quando era adolescente, como forma de validar seus sonhos da juventude com a vida que escolheu para viver.'
          ],
          8: [
            'Inspirativa',
            'Você está vivendo uma fase em que está aprendendo a escutar os questionamentos dos outros, pois está mais aberto ao novo e já não se preocupa muito com a opinião dos outros.\n\
            Sua trajetória de vida, já tem lhe ajudado a entender e aceitar quem é e seus cabelos brancos já evidenciam a maturidade construídas nos últimos anos para enfrentar os problemas e para olhar pra vida de forma mais positiva.\n\
            A valorização de bens materiais ou conquistas financeiras perde força frente a valorização de questões como ética, moralidade e causas ligadas a humanidade.\n\
            Você começa a valorizar mais as pequenas coisas e o tempo de qualidade com as pessoas que ama. No trabalho você desenvolve o prazer em mentorar e apoiar os mais jovens e começa preocupar-se em deixar um legado tanto do seu trabalho quando de suas ideias.'
          ],
          9: [
            'Intuitiva',
            'Você está vivendo uma fase em que fazer o bem é o mais importante, pois seu questionamento sobre espiritualidade e sobre o propósito da vida, tem levado você a desenvolver uma grande sabedoria.\n\
            Sua capacidade de refletir sobre a vida e construir conclusões mais maduras e ponderadas, tem levado você a ser mais seletivo em suas amizades e até quanto ao gasto de tempo com a família, amigos e trabalho.\n\
            Sua vitalidade tem diminuído a cada ano e você nota que alguns sentimentos como tristeza e arrependimento tem surgido quando pensa nos episódios da vida. Ao mesmo tempo, você construiu memórias muito felizes com base em suas conquistas e se você está vivendo o que desejou, tem desfrutado de momentos de contemplação e felicidade.\n\
            Porém se ainda não atingiu ou desistiu de algumas buscas, pode estar brigando consigo mesmo e com algumas escolhas que fez. Nesse momento cabe buscar a renovação e um novo sentido para a pessoa que construiu, pois a vida não terminou e se você se permitir viver uma nova fase, tem chance de viver alguns dos momentos mais felizes da sua vida, pois grandes obras da humanidade foram criadas por pessoas acima dos 60 anos.'
          ]
        };

        const s = {
          peacock: [
            'Pavão',
            'Você é uma pessoa criativa, adora novidades e costuma trabalhar muito melhor sem supervisão. É automotivado, gosta de compartilhar suas ideias com os outros e toma decisões baseado em seus princípios.\n\
            Não costuma ter dificuldades para superar frustrações, mas seu nível de energia é alto e oscilante, por isso muitas vezes perde prazos e até desiste de concluir tarefas e atividades quando se sente mentalmente cansado ou desmotivado.\n\
            Costuma delegar tarefas desde que sigam suas ideias, mas sem fazer grandes mudanças na ideia original. Devido as características do seu perfil, tende a ser muito criativo, agindo muitas vezes de forma instável e egoísta.\n\
            Por ser reflexivo, tem dificuldade de terminar projetos e por não gostar de regras costumas fazer as tarefas no seu tempo e conforme a sua motivação no momento, tendo dificuldade de cumprir prazos e seguir o combinado, gerando frustração nas pessoas com quem se relaciona.\n\
            Tende a se desmotivar quando alguma tarefa é executada diferente do que foi combinado ou por acharem que a nova ideia é melhor do que a original.\n\
            Precisa tomar cuidado com seu comportamento, pois costuma ignorar a opinião e críticas dos outros sendo desrespeitoso e impulsivo.\n\
            Seu foco na mudança constante costuma gerar efeitos colaterais em sua vida pessoal e profissional pois tem dificuldade de terminar projetos, iniciando e desistindo de muitas iniciativas.\n\
            Possui dificuldade de admitir seus erros e tende a não pensar em como os outros se sentem quando suas ideias são contrariadas. É arrojado, imprudente e gosta de correr riscos, principalmente se estão atrelados ao reconhecimento.\n\
            Frequentemente se envolve em discussões, pois gosta de discutir princípios e de defender sua posição em busca de fazer a diferença, porém muitas vezes utiliza as palavras como armas em suas discussões devido a sua dificuldade de lidar com contrariedades e com a descrença em suas ideias.\n\
            Você quer ser valorizado por suas ideias e criações, não se importa em correr risco desde que seja possível ele gere destaque, porém tem dificuldade de planejar a longo prazo pois está sempre mudando de ideia.\n\
            Costuma ter facilidade em delegar, porém facilmente essa delegação se torna omissão pois não costuma acompanhar ou controlar, já que acredita que as pessoas sabem o que tem que ser feito.\n\
            É motivado por Inovação, liberdade sem supervisão, comunicação sem regras e por resultados projetados. No entanto, tende a se desmotivar quando tem que cumprir regras, seguir protocolos de horários ou é obrigado a fazer alguma coisa que não queira.\n\
            Também se desmotiva quando suas ideias não são aceitas ou quando tentam modificá-las. Tende a ter elevada autoestima, pois confia em sua capacidade e possui uma boa percepção de si mesmo e do mundo, fazendo com que tenha muito prazer em receber elogios pois sempre se acha merecedor, até mesmo quando os projetos ainda não estão acabados.'
          ],
          dog: [
            'Cachorro',
            'Você é uma pessoa bastante relacional, adora pessoas e costuma ter dificuldade em trabalhar sem supervisão.\n\
            Sua motivação depende de estar feliz e de bem com a vida. Gosta de conversar, construir relacionamentos e costuma tomar decisões sempre pensando em como elas afetam os outros.\n\
            Tem  dificuldade em lidar com frustrações e seu nível de energia é baixo e oscilante, por isso precisa estar emocionalmente bem para conseguir produzir com qualidade e dentro dos prazos.\n\
            Costuma delegar tarefas tendo por base o nível de confiança nas pessoas, pois utiliza critérios relacionais e emocionais como confiança e apreço pessoal, mais do que critérios técnicos.\n\
            É persuasivo, intuitivo e não vê problema em correr riscos se for para ajudar os outros.\n\
            Devido as características do seu perfil, tende a ser muito emotivo, agindo muitas vezes de forma manipuladora e pouco racional, tendo muita dificuldade de dizer não.\n\
            Por gostar muito de pessoas, acaba se preocupando mais em agradar os outros do que defender sua própria opinião, o que acaba gerando dificuldade de utilizar critérios racionais para priorizar tarefas.\n\
            Você precisa tomar cuidado com seu comportamento, pois costuma pensar mais nos outros do que si mesmo pois está sempre em busca de aprovação, o que o torna bastante influenciável e os favoritismos algo comum em sua forma de lidar com as pessoas.\n\
            Seu foco nos relacionamentos costumam gerar efeitos colaterais em sua vida pessoal e profissional pois possui dificuldade de posicionar o que pensa, gerando muita sobrecarga emocional.\n\
            Frequentemente foge de discussões, pois gosta de buscar a convergência e a harmonia entre as pessoas em busca de aumentar o engajamento e o trabalho em equipe.\n\
            Costuma conduzir as conversas de forma carinhosa e amável sempre buscando minimizar conflitos e gerar o bem para todos, evitando que as pessoas fiquem chateadas, mesmo que não concorde com elas.\n\
            Você quer ser valorizado por ser uma boa pessoa e um bom amigo, não gosta de correr risco, mas se dispõe a correr se for por alguém de que você goste e queira aprovação.\n\
            Você também tem dificuldade de planejar pois acha maçante e cansativo, mas tem facilidade em delegar, porém não se sente à vontade para controlar ou cobrar.\n\
            É motivado por ajudar os outros, por ter liberdade para executar processos e regras da sua forma, e aprecia muito uma comunicação respeitosa e amistosa, de preferência que envolvam histórias pessoais. No entanto, tende a se desmotivar quando se envolve em conflitos, quando não é valorizado ou é tratado de forma desespeitosa. Também se desmotiva quando tem que lidar com pessoas muito racionais ou que agem de forma muito objetiva e pouco empáticas\n\
            Tende a ter baixa autoestima, porém se sente muito bem quando é elogiado e aprovado pelas pessoas. Conforme os níveis de críticas e elogios que recebe, tende a ser bastante suscetível a influências de quem ele considera mais importante em sua vida. Tem grande prazer em celebrar conquistas e costuma ser otimista mesmo quando as coisas não acontecem como esperado, ao mesmo tempo tende a ser pessimista quando acumula vivências ruins.'
          ],
          lion: [
            'Leão',
            'Você é uma pessoa focada em resultados, adora desafios e costuma trabalhar muito bem sem supervisão. É automotivado, gosta de soluções práticas e toma decisões rapidamente. Não tem dificuldade alguma em lidar com frustrações e seu nível de energia é alto e constante, por isso tende a dormir pouco e está sempre envolvido muitas atividades, mesmo que necessite de ajustes depois de concluído.\n\
            Costuma ser centralizador e impaciente com os outros tendo dificuldade de delegar, porém quando delega fica controlando de perto pois é muito ágil e não gosta de perder tempo.\n\
            É arrojado, destemido e gosta de correr riscos. Devido as características do seu perfil, tende a ser muito objetivo, agindo muitas vezes de forma grosseira e pouco relacional.\n\
            Por ser dominante, tem dificuldade de aceitar ordens e por ter vontade de fazer tudo com rapidez, acaba não analisando os detalhes gerando precipitação e tarefas concluídas com erros, necessitando refazê-las ou ajustá-las.\n\
            Você precisa tomar cuidado com seu comportamento, pois muitas vezes costuma passar por cima das pessoas sendo desrespeitoso e egoísta. Seu foco no resultado costuma gerar efeitos colaterais em sua vida pessoal e profissional pois tem dificuldade de reconhecer seus erros e tende a não pensar como os outros se sentem.\n\
            Frequentemente se envolve em discussões, pois é insistente e teimoso para provar suas visão em busca dos resultados. Costuma machucar as pessoas com palavras pois mostra-se insensível quando as pessoas mostram que pensam diferente de você.\n\
            Você quer ser valorizado pelos seus resultados e não se importa em correr riscos desde que a possibilidade de ganhos seja alta. Ao mesmo tempo, apresenta dificuldade de planejar e analisar detalhes.\n\
            É motivado por desafios, gosta de ter liberdade para tomar decisões, prefere comunicação direta, competição e resultados tangíveis. No entanto tende a se desmotivar quando os outros agem com lentidão e quando se sente impedido de avançar devido à regras, protocolos ou processos. Também se desmotiva quando as pessoas não entendem o que você diz e quando não são proativas para executar tarefas e resolver problemas.\n\
            Tende a ter uma elevada autoestima, pois confia muito em sua capacidade de realização. Costuma ser vaidoso e muito competitivo, portanto trabalha com muito empenho e muito focado no resultado, fazendo com que tenha grande prazer em cada conquista e se sinta muito merecedor de cada elogio que recebe.'
          ],
          monkey: [
            'Macaco',
            'Você é uma pessoa metódica, adora organização e costuma trabalhar muito bem tanto com supervisão quanto sem.\n\
            Tende a ser automotivado devido ao seu senso de compromisso, não sendo necessário ser supervisionado ou receber ordens para saber o que fazer.\n\
            Gosta de ter controle, de cumpri regras e necessita de tempo para tomar decisões. Tem dificuldade em lidar com frustrações e seu nível de energia á baixo mas constante, por isso é bastante confiável para garantir tarefas concluídas dentro do prazo e da qualidade esperada.\n\
            Costuma delegar tarefas desde que sigam seus processos e regras, pois valoriza a ordem e o controle. É conservador, prudente e não gosta de correr riscos.\n\
            Devido as características do seu perfil, tende a ser muito detalhista, agindo muitas vezes de forma inflexível e muito crítica, tanto consigo, quanto com os outros.\n\
            Por ser analítico, tem dificuldade de aceitar a mudança e por ter vontade de fazer tudo perfeito, acaba realizando uma tarefa por vez e muitas vezes utilizando mais tempo do que normal. Em alguns casos prefere até não assumir compromissos se não puder entregar como gostaria.\n\
            Precisa tomar cuidado com seu comportamento, pois costuma tratar as pessoas que não seguem suas regras como “criminosas” sendo desrespeitoso e rígido. Seu foco na organização costuma gerar efeitos colaterais em sua vida pessoal e profissional pois é muito crítico com todos e principalmente consigo, não aceitando excessões e muitas vezes não se preocupando com os sentimentos das pessoas quando a julga erradas.\n\
            Frequentemente evita discussões, pois não vê lógica nisso, mas pode entrar em discussões para defender sua lógica e seu posicionamento, pois é focado em fatos, cifras e é incisivo no que acredita, ignorando manifestações emocionais devido a sua inflexibilidade com pessoas que pensam diferente de você.\n\
            Você quer ser valorizado pela organização e como não gosta de correr riscos, costuma se cercar de informações para tomar suas decisões. Tem facilidade de planejar e faz isso constantemente, além de ter facilidade para delegar tarefas, porém estabelece critérios detalhados para controlar e acompanhar.\n\
            É motivado por ordem, processos e regras, por comunicação passo-a-passo e resultados tangíveis. No entanto tende a se desmotivar quando as pessoas não cumprem o que combinam e querem que se abram excessões. Também se desmotiva quando existe desordem, quando não há planejamento ou quando não há preocupação com os detalhes para evitar que coisas dêem errado.\n\
            Tende a ter baixa autoestima, pois possui um elevado nível de exigência consigo e com os outros, tendo dificuldade de valorizar suas próprias conquistas pois sempre achar que poderia ter feito melhor e por muitas vezes é possível que não se sinta merecedor dos elogios que recebe.'
          ]
        };

        if (!dimens['COMUNICAÇÃO EFICAZ']['rec'])
          dimens['COMUNICAÇÃO EFICAZ']['rec'] = '\u2022  Você se encontra no caminho correto. Mantenha-se assim.';
        if (!dimens['PRINCÍPIOS DE LIDERANÇA']['rec'])
          dimens['PRINCÍPIOS DE LIDERANÇA']['rec'] = '\u2022 Você se encontra no caminho correto. Mantenha-se assim.';
        if (!dimens['APRENDIZ/CONHECIM.']['rec'])
          dimens['APRENDIZ/CONHECIM.']['rec'] = '\u2022 Você se encontra no caminho correto. Mantenha-se assim.';
        if (!dimens['ESPÍRITO DE EQUIPE']['rec'])
          dimens['ESPÍRITO DE EQUIPE']['rec'] = '\u2022 Você se encontra no caminho correto. Mantenha-se assim.';
        if (!dimens['FOCO NO RESULTADO']['rec'])
          dimens['FOCO NO RESULTADO']['rec'] = '\u2022 Você se encontra no caminho correto. Mantenha-se assim.';
        if (!dimens['INOVAÇÃO/ MUDANÇA']['rec'])
          dimens['INOVAÇÃO/ MUDANÇA']['rec'] = '\u2022 Você se encontra no caminho correto. Mantenha-se assim.';
        if (!dimens['COMPORT. ASSERTIVO']['rec'])
          dimens['COMPORT. ASSERTIVO']['rec'] = '\u2022 Você se encontra no caminho correto. Mantenha-se assim.';

        let p1 = '';
        let pdata1 = '';
        let p2 = '';
        let pdata2 = '';
        if (!student['profiles'])
          p1 = '';
        else {
          p1 = s[student['profiles'][0].type][0];
          pdata1 = s[student['profiles'][0].type][1];
          p2 = s[student['profiles'][1].type][0];
          pdata2 = s[student['profiles'][1].type][1];
        }

        const area = student.company?._area?.name === undefined ? '' : student.company?._area?.name;
        const post = student.company?._post?.name === undefined ? '' : student.company?._post?.name;
        console.log(dimens);

        this.dataDocx = {
          name: student.name,
          s_image: student.image ? student.image : 'assets/image/not-found-user.png',
          age: student.getAge,
          scholar: student.scholarity,
          post,
          area,
          duration: ap._duration,
          profile_1: p1,
          profile_1_data: pdata1,
          profile_2: p2,
          profile_2_data: pdata2,
          setenio_fase: setenio[sSetenio]?.[0],
          setenio_data: setenio[sSetenio]?.[1],
          gen_data: gen[sGen],
          gen: sGen,
          d_ce_rd: dimens['COMUNICAÇÃO EFICAZ']['d'],
          d_ce_rc: dimens['COMUNICAÇÃO EFICAZ']['c'],
          d_ce_r: dimens['COMUNICAÇÃO EFICAZ']['rec'],
          d_pl_rd: dimens['PRINCÍPIOS DE LIDERANÇA']['d'],
          d_pl_rc: dimens['PRINCÍPIOS DE LIDERANÇA']['c'],
          d_pl_r: dimens['PRINCÍPIOS DE LIDERANÇA']['rec'],
          d_ac_rd: dimens['APRENDIZ/CONHECIM.']['d'],
          d_ac_rc: dimens['APRENDIZ/CONHECIM.']['c'],
          d_ac_r: dimens['APRENDIZ/CONHECIM.']['rec'],
          d_ee_rd: dimens['ESPÍRITO DE EQUIPE']['d'],
          d_ee_rc: dimens['ESPÍRITO DE EQUIPE']['c'],
          d_ee_r: dimens['ESPÍRITO DE EQUIPE']['rec'],
          d_fr_rd: dimens['FOCO NO RESULTADO']['d'],
          d_fr_rc: dimens['FOCO NO RESULTADO']['c'],
          d_fr_r: dimens['FOCO NO RESULTADO']['rec'],
          d_im_rd: dimens['INOVAÇÃO/ MUDANÇA']['d'],
          d_im_rc: dimens['INOVAÇÃO/ MUDANÇA']['c'],
          d_im_r: dimens['INOVAÇÃO/ MUDANÇA']['rec'],
          d_ca_rd: dimens['COMPORT. ASSERTIVO']['d'],
          d_ca_rc: dimens['COMPORT. ASSERTIVO']['c'],
          d_ca_r: dimens['COMPORT. ASSERTIVO']['rec'],
          d_comp_d: dimens['FIERGS']['d'],
          d_comp_c: dimens['FIERGS']['c']
        }
        setTimeout(() => {
          this.processDocx();
        }, 10);
        this.loading = false;
      } else this._util.message('Nenhuma aplicação encontrada!', 'warn');

      this.loading = false;
    } else this._util.message('Verifique os dados antes de buscar!', 'warn');
  }

  processDocx() {
    this.http.get('./assets/template.docx', { responseType: 'arraybuffer' })
      .subscribe(templatex => {
        const blob = this.doxTemplServ.generateDocxFromTemplate(templatex, this.dataDocx);
        this.fileDOCX = blob;
        console.log('Doc', this.fileDOCX);
      });
  }

  downloadDocx() {
    saveAs(this.fileDOCX, this.studentName + '_report.docx');
  }
  
  sendMail() {
    console.log('SendMail : ', this.fileDOCX);
    this.snackBarServ.showSnackBar('Enviando . . .', 'Ok');
    let name = this.addTreatLetter.capitalizeFirstLetters(this.studentName);
    this._firebaseServ.saveDocxAndSendMail(name, this.studentMail, this.fileDOCX);
  }
}
