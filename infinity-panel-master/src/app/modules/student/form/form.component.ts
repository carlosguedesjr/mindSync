import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';

import { NgxDropzoneChangeEvent } from 'ngx-dropzone';

import { Student } from 'src/app/models/student';
import { City } from 'src/app/models/default/city';
import { State } from 'src/app/models/default/state';
import { Genre } from 'src/app/models/default/genre';
import { FileUpload } from 'src/app/interfaces/base';
import { CivilStatus } from 'src/app/models/default/civil-status';
import { Company, Branch, Department, Area, Post } from 'src/app/models/company';

import { UtilService } from 'src/app/services/util.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { ZipcodeService } from 'src/app/services/api/zipcode.service';
import { StudentService } from 'src/app/services/firebase/student.service';
import { CompanyService } from 'src/app/services/firebase/company/company.service';
import { CompanyPostService } from 'src/app/services/firebase/company/post.service';
import { CompanyAreaService } from 'src/app/services/firebase/company/area.service';
import { CompanyBranchService } from 'src/app/services/firebase/company/branch.service';
import { CompanyDepartmentService } from 'src/app/services/firebase/company/department.service';

@Component({
  selector: 'app-student-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class StudentFormComponent implements OnInit {

  saving = false;
  loading = true;
  image: FileUpload;
  togglePass = true;
  genres = Genre.all;
  formGroup: FormGroup;
  civilStatus = CivilStatus.all;
  data: Student = new Student();
  scholarities = Student.getScholarities;

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

  constructor(
    private _util: UtilService,
    private location: Location,
    private _student: StudentService,
    private formBuilder: FormBuilder,
    private _zipcode: ZipcodeService,
    private _company: CompanyService,
    private _post: CompanyPostService,
    private _area: CompanyAreaService,
    private _validator: ValidatorService,
    private _branch: CompanyBranchService,
    private activatedRoute: ActivatedRoute,
    private _department: CompanyDepartmentService,
  ) {
    this.formGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      genre: new FormControl(''),
      dateBirth: new FormControl(''),
      childrens: new FormControl(''),
      stateBirth: new FormControl(''),
      scholarity: new FormControl(''),
      civilStatus: new FormControl(''),
      phone: new FormControl('', [Validators.minLength(11)]),
      cityBirth: new FormControl({value: '', disabled: true}),

      cpf: new FormControl('', this._validator.validatorCPF),
      rg: new FormControl(''),
      rgEmitter: new FormControl(''),

      motherName: new FormControl(''),
      spouseName: new FormControl(''),

      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl(''),
      confirmPass: new FormControl(''),

      address: this.formBuilder.group({
        street: new FormControl(''),
        number: new FormControl(''),
        district: new FormControl(''),
        city: new FormControl({value: '', disabled: true}),
        state: new FormControl(''),
        zipcode: new FormControl(''),
        complement: new FormControl(''),
      }),

      company: this.formBuilder.group({
        companyId: new FormControl(''),
        branchId: new FormControl({value: '', disabled: true}),
        departmentId: new FormControl({value: '', disabled: true}),
        areaId: new FormControl({value: '', disabled: true}),
        postId: new FormControl({value: '', disabled: true}),
      }),

      course: this.formBuilder.group({
        name: new FormControl(''),
        institute: new FormControl(''),
        city: new FormControl({value: '', disabled: true}),
        state: new FormControl(''),
        conclusion: new FormControl(''),
      }),

      social: this.formBuilder.group({
        linkedin: new FormControl(''),
        facebook: new FormControl(''),
        instagram: new FormControl(''),
      }),
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.getCompanies();
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) await this.setData(id);
    else {
      this.formGroup.setValidators(this.validatorPassword);
      this.controls.password.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/[0-9]/),
        Validators.pattern(/[a-zA-Z]/)
      ]);
      this.controls.confirmPass.setValidators(Validators.required);
      this.controls.password.updateValueAndValidity();
      this.controls.confirmPass.updateValueAndValidity();
    }
    this.loading = false;
  }

  async setData(id: string): Promise<void> {
    this.data = await this._student.getById(id);
    if (this.data.image) this.image = {path: this.data.image, new: false};
    this.formGroup.patchValue(this.data);

    if (this.data.stateBirth) this.birthStateChange();
    if (this.data.course && this.data.course.state) this.courseStateChange();
    if (this.data.address && this.data.address.state) this.addressStateChange();

    if (this.data.company && this.data.company.companyId) await this.companyChange();
    if (this.data.company && this.data.company.branchId) await this.branchChange();
    if (this.data.company && this.data.company.departmentId) await this.departmentChange();
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

  validatorPassword(group: FormGroup): ValidatorFn {
    const password = group.get('password').value;
    const confirmControl = group.get('confirmPass');
    let result: {
      required?: boolean;
      passNotSame?: boolean;
      minlength?: {actualLength: number; requiredLength: number};
    } = null;

    if (confirmControl.hasError('required')) result = {required: true};
    else if (password !== confirmControl.value) result = {passNotSame: true};

    confirmControl.setErrors(result);
    return null;
  }

  zipcodeChange() {
    const value: string = this.addressControls.zipcode.value;
    if (value.length === 8)
      this._zipcode.get(value).then(res => {
        this.addressControls.street.setValue(res.logradouro);
        this.addressControls.district.setValue(res.bairro);
        this.addressControls.city.setValue(res.localidade);
        this.addressControls.state.setValue(res.uf);
        if (res.complemento) this.addressControls.complement.setValue(res.complemento);
      }).catch(_ => {});
  }

  birthStateChange() {
    this.birthCities = new City().getByState(this.controls.stateBirth.value);
    if (this.birthCities.length) this.controls.cityBirth.enable();
    else this.controls.cityBirth.disable();
  }

  addressStateChange() {
    this.addressCities = new City().getByState(this.addressControls.state.value);
    if (this.addressCities.length) this.addressControls.city.enable();
    else this.addressControls.city.disable();
  }

  courseStateChange() {
    this.courseCities = new City().getByState(this.courseControls.state.value);
    if (this.courseCities.length) this.courseControls.city.enable();
    else this.courseControls.city.disable();
  }

  async companyChange() {
    const companyId = this.companyControls.companyId.value;
    this.branches = await this._branch.getByCompanyId(companyId);
    if (this.branches.length) this.companyControls.branchId.enable();
    else this.companyControls.branchId.disable();
  }

  async branchChange() {
    const branchId = this.companyControls.branchId.value;
    this.departments = await this._department.getByBranchId(branchId);
    if (this.departments.length) this.companyControls.departmentId.enable();
    else this.companyControls.departmentId.disable();
  }

  async departmentChange() {
    const departmentId = this.companyControls.departmentId.value;
    this.areas = await this._area.getByDepartmentId(departmentId);
    if (this.areas.length) this.companyControls.areaId.enable();
    else this.companyControls.areaId.disable();
  }

  async areaChange() {
    const areaId = this.companyControls.areaId.value;
    this.posts = await this._post.getByAreaId(areaId);
    if (this.posts.length) this.companyControls.postId.enable();
    else this.companyControls.postId.disable();
  }

  async takeImage(event: NgxDropzoneChangeEvent): Promise<void> {
    const loader = this._util.loading('Comprimindo imagem...');
    const image = await this._util.uploadImage(event.addedFiles[0]);
    const compress = await this._util.uploadCompress(image.path);
    this.image = {path: compress.base64, file: compress.file, new: true};
    loader.componentInstance.msg = 'Imagem comprimida!';
    loader.componentInstance.done();
  }

  async deleteImage(): Promise<void> {
    if (!this.image.new)
      this._util.delete('delete').then(async _ => {
        await this._student.deleteImage(this.data.id);
        this.image = null;
      }).catch(_ => {});
    else this.image = null;
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      this.saving = true;
      const value = this.formGroup.value;
      Object.assign(this.data, value);

      delete this.data['confirmPass'];

      await this._student.save(this.data).then(async id => {
        if (id) this.data.id = id;
        if (this.image && this.image.new && this.image.file) await this._student.uploadImage(this.data.id, this.image.file);
      });

      this.saving = false;
      this._util.message('Aluno salvo com sucesso!', 'success');
      this.goToBack();
    } else this._util.message('Verifique os dados antes de salvar!', 'warn');
  }

  goToBack() {
    this.location.back();
  }
}
