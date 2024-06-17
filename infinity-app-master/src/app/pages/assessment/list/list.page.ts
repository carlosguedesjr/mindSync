import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { Assessment } from 'src/app/models/assessment';

import { UtilService } from 'src/app/services/util.service';
import { StorageService } from 'src/app/services/storage.service';
import { SubscriptionPage } from '../../subscription/subscription.page';
import { ApplicationService } from 'src/app/services/firebase/application.service';
import { AssessmentService } from 'src/app/services/firebase/assessment/assessment.service';

@Component({
  selector: 'app-assessment-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class AssessmentListPage {

  items: Assessment[];

  constructor(
    private _util: UtilService,
    private _storage: StorageService,
    private popoverCtrl: PopoverController,
    private _assessment: AssessmentService,
    private _applications: ApplicationService
  ) {}

  async ionViewDidEnter() {
    this.items = [];
    const subscriptions = this._storage.getSubscriptions.filter(sub => sub.assessmentIds.length);

    if (!subscriptions.length) this.openSubscription();

    const loader = await this._util.loading('Liberando acesso...');
    for (const subscription of subscriptions)
      await this.getAssessments(subscription.assessmentIds, subscription.access.id);

    loader.dismiss();
  }

  async getAssessments(assessmentIds: string[], accessId: string) {
    for (const assessmentId of assessmentIds) {
      const application = await this._applications.getByAssessmentIdByAccessId(assessmentId, accessId).catch(_ => {});
      if (!application || !application.end) {
        const assessment = await this._assessment.getById(assessmentId);
        assessment._accessId = accessId;
        if (!assessment.deletedAt && !this.items.find(item => item.id === assessment.id)) this.items.push(assessment);
      }
    }
  }

  async openSubscription() {
    const popover = await this.popoverCtrl.create({component: SubscriptionPage});
    await popover.present();
    const { data } = await popover.onDidDismiss();
    if (data) this.getAssessments(data.assessmentIds, data.accessId);
  }
}
