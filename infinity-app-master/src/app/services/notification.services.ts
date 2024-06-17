import { Injectable } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AngularFireMessaging } from '@angular/fire/messaging';

import { FCM } from '@ionic-native/fcm/ngx';

import { UtilService } from './util.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    private fcm: FCM,
    private _util: UtilService,
    private platform: Platform,
    private navCtrl: NavController,
    private afMessaging: AngularFireMessaging
  ) { }

  async init() {
    if (this.platform.is('cordova'))
      this.fcm.onNotification().subscribe(payload => {
        const route = this.getRoute(payload);

        if (payload.wasTapped) this.navCtrl.navigateForward(route);
        else this._util.notification(payload.title, payload.body, route);
      });
    else {
      await this.afMessaging.usePublicVapidKey(environment.firebase.vapidKey);

      this.afMessaging.onMessage(payload => {
        const route = this.getRoute(payload.data);
        this._util.notification(payload.notification.title, payload.notification.body, route);
      });
    }
  }

  requestPermission() {
    if (this.platform.is('cordova')) return this.fcm.requestPushPermissionIOS();
    return this.afMessaging.requestPermission.toPromise();
  }

  private getRoute(data: any) {
    let route = '/mensagens';
    if (data.scheduleId) route = '/agendamentos';
    return route;
  }

  get getToken() {
    if (this.platform.is('cordova')) return this.fcm.getToken();
    return this.afMessaging.getToken.toPromise().catch(err => {
      console.error('Notify token:', err);
      return '';
    });
  }
}
