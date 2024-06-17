import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { UtilService } from '../services/util.service';
import { StorageService } from '../services/storage.service';
import { StudentService } from '../services/firebase/student.service';
import { ApplicationService } from '../services/firebase/application.service';
import { AssessmentService } from '../services/firebase/assessment/assessment.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {

  constructor(
    private _util: UtilService,
    private navCtrl: NavController,
    private _student: StudentService,
    private _storage: StorageService,
    private _assessment: AssessmentService,
    private _application: ApplicationService
  ){ }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise(async resolve => {
      const loader = await this._util.loading('Verificando acesso ao conteúdo...');
      const id = route.paramMap.get('id');
      const accessId = route.paramMap.get('accessId');
      const subscriptions = this._storage.getSubscriptions;

      if (route.data.assessment) {
        if (subscriptions.find(sub => sub.assessmentIds.includes(id) && sub.access.id === accessId)) {
          const application = await this._application.getByAssessmentIdByAccessId(id, accessId).catch(_ => {});
          if (!application || !application.end) {
            const requireds = await this.checkProfile(id);
            loader.dismiss();
            if (requireds.length) {
              this._util.message('Atualize seu perfil, preenchendo os campos em vermelho, antes de continuar!');
              this.navCtrl.navigateForward(['/tabs/perfil', {requireds, returnUrl: state.url}]);
              return resolve(false);
            }
            return resolve(true);
          }
        }
      } else if (route.data.mba) {}
      else if (route.data.course) {}

      loader.dismiss();
      this._util.message('Você não tem acesso a este conteúdo!');
      return resolve(false);
    });
  }

  async checkProfile(assessmentId: string) {
    const assessment = await this._assessment.getById(assessmentId);
    if (assessment.studentRequireds.length) {
      const student = await this._student.getById(this._storage.getUser.id);
      const requireds = assessment.studentRequireds.filter(required => (
          (required === 'name' && !student.name) ||
          (required === 'email' && !student.email) ||
          (required === 'image' && !student.image) ||
          (required === 'phone' && !student.phone) ||
          (required === 'genre' && !student.genre) ||
          (required === 'childrens' && !student.childrens) ||
          (required === 'rg' && (!student.rg || !student.rgEmitter)) ||
          (required === 'cpf' && !student.cpf) ||
          (required === 'scholarity' && !student.scholarity) ||
          (required === 'civilStatus' && !student.civilStatus) ||
          (required === 'dateBirth' && !student.dateBirth) ||
          (required === 'motherName' && !student.motherName) ||
          (required === 'spouseName' && !student.spouseName) ||
          (required === 'address' && (
            !student.address || !student.address.city || !student.address.state || !student.address.street ||
            !student.address.number || !student.address.zipcode || !student.address.district)
          ) ||
          (required === 'placeBirth' && (!student.cityBirth || !student.stateBirth)) ||
          (required === 'course' && (
            !student.course || !student.course.city || !student.course.state || !student.course.institute ||
            !student.course.name)
          ) ||
          (required === 'company' && (
            !student.company || !student.company.companyId || !student.company.branchId ||
            !student.company.departmentId || !student.company.areaId || !student.company.postId)
          ) ||
          (required === 'social' && (
            !student.social || (!student.social.facebook && !student.social.instagram && !student.social.linkedin)))
        )
      );
      if (requireds.length) return assessment.studentRequireds;
    }

    return [];
  }
}
