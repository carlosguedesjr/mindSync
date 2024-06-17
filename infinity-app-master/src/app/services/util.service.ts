import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController, NavController } from '@ionic/angular';

import firebase from 'firebase/app';

import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private file: File,
    private date: DatePipe,
    private navCtrl: NavController,
    private toast: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {}

  static transformTimestampToDate(obj: any): any {
    if (null === obj || 'object' !== typeof obj) return obj;

    if (obj instanceof firebase.firestore.Timestamp) return obj.toDate();

    if (obj instanceof Array) {
      const copy = [];
      for (let i = 0, len = obj.length; i < len; i++) copy[i] = this.transformTimestampToDate(obj[i]);
      return copy;
    }

    if (obj instanceof Object) {
      const copy: any = {};
      for (const attr in obj) if (obj.hasOwnProperty(attr)) copy[attr] = this.transformTimestampToDate(obj[attr]);
      return copy;
    }

    throw new Error('The object could not be transformed! Type is not supported.');
  }

  message(message: string, duration = 4000, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    this.toast.create({
      message,
      duration,
      position
    }).then(toast => toast.present());
  }

  alertMessage(title: string, msg?: string, btns?: string[]) {
    this.alertCtrl.create({
      header: title,
      message: msg || 'Ocorreu algum erro. Tente novamente.',
      buttons: btns || ['Ok']
    }).then(alert => alert.present());
  }

  notification(title: string, text: string, url?: string) {
    const buttons = [];
    if (url)
      buttons.push({
        text: 'ver',
        side: 'end',
        handler: () => this.navCtrl.navigateForward(url)
      });

    this.toast.create({
      buttons,
      header: title,
      message: text,
      duration: 7000,
      position: 'bottom'
    }).then(toast => toast.present());
  }

  alertConfirm(title: string, msg: string, btnConfirm?: string, btnCancel?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.alertCtrl.create({
        header: title || 'Atenção',
        message: msg || 'Deseja realizar esta ação?',
        buttons: [
          {
            text: btnCancel || 'Não Aceitar',
            handler: () => reject(false)
          }, {
            text: btnConfirm || 'Aceitar',
            handler: () => resolve(true)
          }
        ]
      }).then(alert => alert.present());
    });
  }

  async loading(
    message: string = 'Carregando...',
    spinner: 'bubbles' | 'circles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small' = 'lines'
  ) {
    const loading = await this.loadingCtrl.create({
      message,
      spinner
    });
    await loading.present();
    return loading;
  }

  fileToBlob(_path: string, type: string): Promise<{file: Blob}> {
    return new Promise((resolve, reject) => {
      this.file
        .resolveLocalFilesystemUrl(_path)
        .then(fileEntry => {
          const { name, nativeURL } = fileEntry;

          // get the path..
          const path = nativeURL.substring(0, nativeURL.lastIndexOf('/'));

          // we are provided the name, so now read the file into
          // a buffer
          return this.file.readAsArrayBuffer(path, name);
        }).then(buffer => {
          // get the buffer and make a blob to be saved
          const imgBlob = new Blob([buffer], {type});
          resolve({file: imgBlob});
        }).catch(e => reject(e));
    });
  }

  formatDate(value: any, format: string, timezone?: string): string {
    return this.date.transform(value, format, timezone);
  }
}
