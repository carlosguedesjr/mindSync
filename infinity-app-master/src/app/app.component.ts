import { SwUpdate } from '@angular/service-worker';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { Component, QueryList, ViewChildren } from '@angular/core';

import { BnNgIdleService } from 'bn-ng-idle';

import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { UtilService } from './services/util.service';
import { AuthService } from './services/firebase/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  private lastTimeBackPress = 0;
  private timePeriodToExit = 2000;

  constructor(
    private platform: Platform,
    private swUpdate: SwUpdate,
    private _util: UtilService,
    private _auth: AuthService,
    private statusBar: StatusBar,
    private bnIdle: BnNgIdleService,
    private alertCtrl: AlertController,
    private splashScreen: SplashScreen,
    private screenOrientation: ScreenOrientation
  ) {
    this.swUpdate.available.subscribe(event => {
      this.alertCtrl.create({
        backdropDismiss: false,
        header: 'Nova Atualização!',
        message: 'Nova atualização disponível, clique no botão abaixo <b>Atualizar</b>, para carregar as novas atualizações!',
        buttons: [{
          text: 'Atualizar',
          handler: () => window.location.reload()
        }]
      }).then(alert => alert.present());
    });
    this.initializeApp();
  }

  private initializeApp() {
    this.platform.ready().then(_ => {
      this.idle();
      if (this.platform.is('cordova')) {
        this.splashScreen.hide();
        this.statusBar.styleLightContent();
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        this.backDevice();
      }
    });
  }

  private idle() {
    this.bnIdle.startWatching(900).subscribe(res => {
      if (res) this._auth.signOut();
    });
  }

  private backDevice() {
    this.platform.backButton.subscribe(() => {
      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        if (outlet.canGoBack()) outlet.pop();
        else {
          const time = new Date().getTime() - this.lastTimeBackPress;
          if (time < this.timePeriodToExit) (navigator as any).app.exitApp();
          else {
            this._util.message('Aperte voltar novamente para sair!', 2000);
            this.lastTimeBackPress = new Date().getTime();
          }
        }
      });
    });
  }
}
