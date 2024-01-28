import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {initializeApp} from "firebase/app";
import {environment} from "../environments/environment";
import {
  RegistrationPendingScreenComponent
} from "./_shared/registration-pending-screen/registration-pending-screen.component";
import {IonicStorageModule} from "@ionic/storage-angular";
import {initializeAuth, indexedDBLocalPersistence} from "firebase/auth";
import {Capacitor} from "@capacitor/core";
import {SplashScreenWeb} from "@capacitor/splash-screen/dist/esm/web";
import {VideoPlayer} from "@ionic-native/video-player/ngx";
import {LinkyModule} from "ngx-linky";
import {HttpClientModule} from "@angular/common/http";

const app = initializeApp(environment.firebase);

if (Capacitor.isNativePlatform()) {
  initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
  });
}

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, RegistrationPendingScreenComponent],
  imports: [BrowserModule, IonicModule.forRoot({
    mode: 'ios'
  }), AppRoutingModule, IonicStorageModule.forRoot(),
    LinkyModule,
    HttpClientModule
  ],
  providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy}, SplashScreenWeb, VideoPlayer],
  bootstrap: [AppComponent],
})
export class AppModule {
}
