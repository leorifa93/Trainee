import {Component} from '@angular/core';
import {getAuth, signOut} from 'firebase/auth';
import {UserService} from "./services/user-service.service";
import {IUser} from "./interfaces/i-user";
import {Router} from "@angular/router";
import {UserConstants} from "./constants/userConstants";
import {AlertController, ModalController, Platform} from "@ionic/angular";
import {
  RegistrationPendingScreenComponent
} from "./_shared/registration-pending-screen/registration-pending-screen.component";
import {LocalStorageService} from "./services/local-storage.service";
import {SplashScreen} from "@capacitor/splash-screen";
import {register} from 'swiper/element/bundle';
import {Device} from '@capacitor/device';
import {FCM} from "@capacitor-community/fcm";
import {PushNotifications} from "@capacitor/push-notifications";
import firebase from "firebase/compat";
import User = firebase.User;
import {Capacitor} from "@capacitor/core";

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public userService: UserService, public router: Router, public modalCtrl: ModalController, public localStorage: LocalStorageService,
              private alertCtrl: AlertController, private platform: Platform) {
    SplashScreen.show();

    this.platform.ready().then(() => {
      document.body.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');

      this.initializeApp();
    })

  }

  initializeApp() {

    getAuth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const user: IUser = await this.userService.get(firebaseUser.uid);
        await this.localStorage.setUser(user);

        Device.getId().then((deviceId) => {
          user.currentDeviceId = deviceId.identifier;

          return this.userService.set(user.id, user);
        }).then(() => this.localStorage.setUser(user));


        if (Capacitor.isNativePlatform()) {
          PushNotifications.requestPermissions().then((status) => {
            if (status.receive === "granted") {
              FCM.subscribeTo({topic: "general"})
                .then((r) => console.log(`subscribed to topic`))
                .catch((err) => console.log(err));

              if (user.userRole === UserConstants.USER_ROLE_ADMIN) {
                FCM.subscribeTo({topic: "admin"})
                  .then((r) => console.log(`subscribed to topic`))
                  .catch((err) => console.log(err));
              }

              FCM.getToken()
                .then((r) => {
                  user.pushDeviceId = r.token;
                  this.userService.set(user.id, user);
                })
                .catch((err) => console.log(err));
            }
          });

          await PushNotifications.register();
        }

        this.userService.startObserver(user.id, async (doc: IUser) => {
          await this.localStorage.setUser(doc);

          if ((doc.currentDeviceId && user.currentDeviceId) && doc.currentDeviceId !== user.currentDeviceId) {
            signOut(getAuth()).then(async () => {
              const alert = await this.alertCtrl.create({message: 'Sie haben sich auf einem anderen Gerät angemeldet.'});
              this.userService.stopObserver();

              return alert.present();
            });
          }

          if (user.status === UserConstants.STATUS_PENDING && doc.status === UserConstants.STATUS_ACTIVE) {
            this.modalCtrl.dismiss();
          }
        });

        if (user) {
          this.navigateByRole(user.userRole).then(() => SplashScreen.hide());

          if (user.status === UserConstants.STATUS_PENDING && user.userRole !== UserConstants.USER_ROLE_ADMIN) {
            this.modalCtrl.create({
              component: RegistrationPendingScreenComponent
            }).then((modalEl) => {
              modalEl.present();
            });
          }
        }
      } else {

        FCM.unsubscribeFrom({topic: "general"})
          .then((r) => console.log(`subscribed to topic`))
          .catch((err) => console.log(err));

        FCM.unsubscribeFrom({topic: "admin"})
          .then((r) => console.log(`subscribed to topic`))
          .catch((err) => console.log(err));

        this.router.navigate(['/login']).then(() => SplashScreen.hide());
      }
    });
  }

  private navigateByRole(userRole: string) {
    switch (userRole) {
      case UserConstants.USER_ROLE_USER:
        return this.router.navigate(['/home']);
      case UserConstants.USER_ROLE_ADMIN:
        return this.router.navigate(['/admin-home'], {replaceUrl: true});
      default:
        return this.router.navigate(['/home']);
    }
  }

}
