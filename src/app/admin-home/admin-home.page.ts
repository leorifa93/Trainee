import {Component, OnInit, ViewChild} from '@angular/core';
import {IonTabs} from "@ionic/angular";

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit {
  @ViewChild('adminTabs') tabRef: IonTabs
  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.tabRef.select('requests');
  }
}
