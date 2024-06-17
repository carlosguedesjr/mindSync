import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component, AfterContentInit } from '@angular/core';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Student } from 'src/app/models/student';
import { City } from 'src/app/models/default/city';
import { State } from 'src/app/models/default/state';
import { Genre } from 'src/app/models/default/genre';
import { CivilStatus } from 'src/app/models/default/civil-status';
import { Company, Branch, Department, Area, Post } from 'src/app/models/company';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { UserService } from 'src/app/services/firebase/user.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyPostService } from 'src/app/services/firebase/company/post.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage implements AfterContentInit {

  data: Student;
  loading = true;
  genres = Genre.all;
  isCordova: boolean;
  formGroup: FormGroup;
  imageRequired = false;
  socialRequired = false;
  civilStatus = CivilStatus.all;
  currentDate = new Date().toISOString();
  scholarities = Student.getScholarities;
  segment: 'default' | 'address' | 'company' | 'course' | 'social' = 'default';

  birthStates = State.all;
  courseStates = State.all;
  addressStates = State.all;
  birthCities: City[] = [];
  courseCities: City[] = [];
  addressCities: City[] = [];

  posts: Post[] = [];
  areas: Area[] = [];
  branches: Branch[] = [];
  companies: Company[] = [];
  departments: Department[] = [];

  private camOptions: CameraOptions = {
    quality: 90,
    correctOrientation: true,
    mediaType: this.camera.MediaType.PICTURE,
    encodingType: this.camera.EncodingType.JPEG,
    destinationType: this.camera.DestinationType.FILE_URI,
  };

  constructor(
    private camera: Camera,
    private webview: WebView,
    private platform: Platform,
    private _util: UtilService,
    private _user: UserService,
    private _auth: AuthService,
    private cd: ChangeDetectorRef,
    private navCtrl: NavController,
    private _student: StudentService,
    private _storage: StorageService,
    private formBuilder: FormBuilder,
    private _company: CompanyService,
    private _post: CompanyPostService,
    private _area: CompanyAreaService,
    private _branch: CompanyBranchService,
    private activatedRoute: ActivatedRoute,
    private _department: CompanyDepartmentService,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.isCordova = this.platform.is('cordova');
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required, this.validatorName]],
      phone: ['', [Validators.required, Validators.minLength(14)]],
      email: ['', [Validators.required, Validators.email]],
      genre: [''],
      dateBirth: [''],
      childrens: [''],
      stateBirth: [''],
      scholarity: [''],
      civilStatus: [''],
      cityBirth: [{value: '', disabled: true}],

      cpf: ['', ValidatorService.validatorCPF],
      rg: [''],
      rgEmitter: [''],

      motherName: [''],
      spouseName: [''],

      address: this.formBuilder.group({
        street: [''],
        number: [''],
        district: [''],
        city: [{value: '', disabled: true}],
        state: [''],
        zipcode: [''],
        complement: [''],
      }),

      company: this.formBuilder.group({
        companyId: [''],
        branchId: [{value: '', disabled: true}],
        departmentId: [{value: '', disabled: true}],
        areaId: [{value: '', disabled: true}],
        postId: [{value: '', disabled: true}],
      }),

      course: this.formBuilder.group({
        name: [''],
        institute: [''],
        city: [{value: '', disabled: true}],
        state: [''],
        conclusion: [''],
      }),

      social: this.formBuilder.group({
        linkedin: [''],
        facebook: [''],
        instagram: [''],
      }),
    });
  }

  async ngAfterContentInit() {
    const loader = await this._util.loading();
    await this.getCompanies();
    const requireds = this.activatedRoute.snapshot.paramMap.get('requireds');
    if (requireds) this.setValidators(requireds.split(','));
    await this.setData();
    loader.dismiss();
    this.loading = false;
    this.cd.detectChanges();
  }

  get controls() {
    return this.formGroup.controls;
  }

  get addressControls() {
    return (this.controls.address as FormGroup).controls;
  }

  get companyControls() {
    return (this.controls.company as FormGroup).controls;
  }

  get courseControls() {
    return (this.controls.course as FormGroup).controls;
  }

  get socialControls() {
    return (this.controls.social as FormGroup).controls;
  }

  async getCompanies() {
    this.companies = await this._company.getAllActive();
  }

  async setData() {
    this.data = this._storage.getUser;
    this.formGroup.patchValue(this.data);

    if (this.data.stateBirth) {
      this.birthStateChange();
      setTimeout(() => this.controls.cityBirth.setValue(this.data.cityBirth));
    }
    if (this.data.course && this.data.course.state) this.courseStateChange(false);
    if (this.data.address && this.data.address.state) this.addressStateChange(false);

    if (this.data.company && this.data.company.companyId) await this.companyChange(false);
    if (this.data.company && this.data.company.branchId) await this.branchChange(false);
    if (this.data.company && this.data.company.departmentId) await this.departmentChange(false);
    if (this.data.company && this.data.company.areaId) await this.areaChange(false);
  }

  setValidators(requireds: string[]) {
    this.formGroup.clearValidators();
    for (const required of requireds) {
      this.imageRequired = required === 'image';
      this.socialRequired = required === 'social';
      if (required === 'genre') this.controls.genre.setValidators(Validators.required);
      if (required === 'childrens') this.controls.childrens.setValidators(Validators.required);
      if (required === 'cpf') this.controls.cpf.setValidators(Validators.required);
      if (required === 'scholarity') this.controls.scholarity.setValidators(Validators.required);
      if (required === 'civilStatus') this.controls.civilStatus.setValidators(Validators.required);
      if (required === 'dateBirth') this.controls.dateBirth.setValidators(Validators.required);
      if (required === 'motherName') this.controls.motherName.setValidators(Validators.required);
      if (required === 'spouseName') this.controls.spouseName.setValidators(Validators.required);
      if (required === 'rg') {
        this.controls.rg.setValidators(Validators.required);
        this.controls.rgEmitter.setValidators(Validators.required);
      }
      if (required === 'placeBirth') {
        this.controls.stateBirth.setValidators(Validators.required);
        this.controls.cityBirth.setValidators(Validators.required);
      }
      if (required === 'address') {
        this.addressControls.street.setValidators(Validators.required);
        this.addressControls.number.setValidators(Validators.required);
        this.addressControls.district.setValidators(Validators.required);
        this.addressControls.city.setValidators(Validators.required);
        this.addressControls.state.setValidators(Validators.required);
        this.addressControls.zipcode.setValidators(Validators.required);
      }
      if (required === 'course') {
        this.courseControls.name.setValidators(Validators.required);
        this.courseControls.institute.setValidators(Validators.required);
        this.courseControls.city.setValidators(Validators.required);
        this.courseControls.state.setValidators(Validators.required);
      }
      if (required === 'company') {
        this.companyControls.companyId.setValidators(Validators.required);
        this.companyControls.branchId.setValidators(Validators.required);
        this.companyControls.departmentId.setValidators(Validators.required);
        this.companyControls.areaId.setValidators(Validators.required);
        this.companyControls.postId.setValidators(Validators.required);
      }
    }
    this.formGroup.markAllAsTouched();
    for (const key in this.controls)
      if ({}.hasOwnProperty.call(this.controls, key)) this.formGroup.get(key).updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  validatorName(control: AbstractControl) {
    let error: {invalid: boolean} = null;
    const value: string = control.value || '';
    const nameList = value.split(' ');
    if (nameList.length < 2 || !nameList[1]) error = {invalid: true};
    return error;
  }

  async validateCPF() {
    const value = this.controls.cpf.value;
    if (value && !this.controls.cpf.hasError('invalid')) {
      let students = await this._student.getWhere('cpf', '==', value);
      students = students.filter(student => student.id !== this.data.id);
      this.controls.cpf.setErrors(students.length ? {exist: true} : null);
    }
  }

  async validateEmail() {
    const value = this.controls.email.value;
    if (value && !this.controls.email.hasError('email')) {
      let users = await this._user.getWhere('email', '==', value);
      let students = await this._student.getWhere('email', '==', value);
      users = users.filter(user => user.id !== this.data.id);
      students = students.filter(student => student.id !== this.data.id);
      this.controls.email.setErrors(students.length || users.length ? {exist: true} : null);
    }
  }

  birthStateChange(reset = true) {
    if (reset) this.controls.cityBirth.reset();
    this.birthCities = new City().getByState(this.controls.stateBirth.value);
    if (this.birthCities.length) this.controls.cityBirth.enable();
    else this.controls.cityBirth.disable();
  }

  addressStateChange(reset = true) {
    if (reset) this.addressControls.city.reset();
    this.addressCities = new City().getByState(this.addressControls.state.value);
    if (this.addressCities.length) this.addressControls.city.enable();
    else this.addressControls.city.disable();
  }

  courseStateChange(reset = true) {
    if (reset) this.courseControls.city.reset();
    this.courseCities = new City().getByState(this.courseControls.state.value);
    if (this.courseCities.length) this.courseControls.city.enable();
    else this.courseControls.city.disable();
  }

  async companyChange(reset = true) {
    if (reset) {
      this.companyControls.branchId.reset();
      this.companyControls.departmentId.reset();
      this.companyControls.areaId.reset();
      this.companyControls.postId.reset();
    }
    const companyId = this.companyControls.companyId.value;
    this.branches = await this._branch.getByCompanyId(companyId);
    if (this.branches.length) this.companyControls.branchId.enable();
    else this.companyControls.branchId.disable();
  }

  async branchChange(reset = true) {
    if (reset) {
      this.companyControls.departmentId.reset();
      this.companyControls.areaId.reset();
      this.companyControls.postId.reset();
    }
    const branchId = this.companyControls.branchId.value;
    this.departments = await this._department.getByBranchId(branchId);
    if (this.departments.length) this.companyControls.departmentId.enable();
    else this.companyControls.departmentId.disable();
  }

  async departmentChange(reset = true) {
    if (reset) {
      this.companyControls.areaId.reset();
      this.companyControls.postId.reset();
    }
    const departmentId = this.companyControls.departmentId.value;
    this.areas = await this._area.getByDepartmentId(departmentId);
    if (this.areas.length) this.companyControls.areaId.enable();
    else this.companyControls.areaId.disable();
  }

  async areaChange(reset = true) {
    if (reset) this.companyControls.postId.reset();
    const areaId = this.companyControls.areaId.value;
    this.posts = await this._post.getByAreaId(areaId);
    if (this.posts.length) this.companyControls.postId.enable();
    else this.companyControls.postId.disable();
  }

  async choiceMedia() {
    return new Promise(async (resolve, reject) => {
      if (this.platform.is('cordova')) {
        const action = await this.actionSheetCtrl.create({
          header: 'Escolha uma da opções',
          buttons: [
            {
              text: 'Galeria',
              role: 'destructive',
              icon: 'images',
              handler: () => {
                this.camOptions.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
                resolve(true);
              }
            }, {
              text: 'Câmera',
              role: 'destructive',
              icon: 'camera',
              handler: () => {
                this.camOptions.sourceType = this.camera.PictureSourceType.CAMERA;
                resolve(true);
              }
            }
          ]
        });
        action.present();
      } else {
        reject();
        this._util.message('Plataforma não suportada!');
      }
    });
  }

  takePhoto() {
    this.choiceMedia().then(async _ => {
      const loader = await this._util.loading('Carregando imagem...');
      await this.camera.getPicture(this.camOptions).then(async (path) => {
        this.data.image = this.webview.convertFileSrc(path) || null;
        const image = await this._util.fileToBlob(path, 'image/png');
        await this._student.uploadImage(this.data.id, image.file);
      }).catch(() => {});
      loader.dismiss();
    }).catch(_ => {});
  }

  async uploadPWA(inputEvent: Event) {
    const loader = await this._util.loading('Carregando imagem...');
    const file: Blob = (inputEvent.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    reader.addEventListener('load', async event => {
      const base64 = event.target.result as string;
      this.data.image = base64;
      await this._student.uploadImage(this.data.id, file);
      loader.dismiss();
    });
    reader.readAsDataURL(file);
  }

  async onSubmit() {
    const values = this.formGroup.value;
    if (this.socialRequired && (!values.social.facebook && !values.social.instagram && !values.social.linkedin)) {
      this.segment = 'social';
      this._util.message('Preencha ao menos uma das redes sociais!');
    } else if (this.imageRequired && !this.data.image) this._util.message('Foto de perfil é obrigatório!');
    else if (this.formGroup.valid) {
      const loader = await this._util.loading('Salvando...');
      Object.assign(this.data, values);

      if (values.dateBirth) this.data.dateBirth = new Date(values.dateBirth);
      if (values.cpf) this.data.cpf = ValidatorService.cleanCPF(this.data.cpf);
      if (values.phone) this.data.phone = ValidatorService.cleanPhone(this.data.phone);
      if (values.address.zipcode) this.data.address.zipcode = ValidatorService.cleanZipCode(this.data.address.zipcode);

      await this._student.update(this.data.id, this.data).then(_ => {
        this.goToNext();
        this._util.message('Perfil salvo!');
      }).catch(err => this._util.message(err));

      loader.dismiss();
    } else this._util.message('Preencha os dados corretamente antes de prosseguir!');
  }

  logout() {
    this._auth.signOut();
  }

  goToNext() {
    const returnUrl = this.activatedRoute.snapshot.paramMap.get('returnUrl');
    if (returnUrl) this.navCtrl.navigateBack(returnUrl);
  }
}
