import {Component, ViewChild} from '@angular/core';
import {IonTabs} from "@ionic/angular";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('userTabs') tabRef: IonTabs
  constructor() {}

  ngAfterViewInit() {
    this.tabRef.select('start');
  }
}
