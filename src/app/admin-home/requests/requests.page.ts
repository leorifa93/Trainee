import { Component, OnInit } from '@angular/core';
import {IUser} from "../../interfaces/i-user";
import {UserService} from "../../services/user-service.service";
import {ToastController} from "@ionic/angular";
import {UserConstants} from "../../constants/userConstants";

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
})
export class RequestsPage implements OnInit {
  users: IUser[] = [];
  constructor(private userService: UserService, private toastCtrl: ToastController) { }

  loaded: boolean = false;
  ngOnInit() {
    this.getUsers();
  }


  setStatus(user: IUser, status: number, index: number) {
    user.status = status;
    this.users.splice(index, 1);

    this.userService.set(user.id, user).then(() => {
      this.toastCtrl.create({
        message: 'Der Teilnehmer wird über deine Entscheidung informiert.',
        duration: 2500
      }).then((toastEL) => {
        toastEL.present();
      });
    })
  }

  getUsers(event?: any) {
    this.userService.getAll([
      {key: 'status', opr: '==', value: UserConstants.STATUS_PENDING}
    ]).then((users) => {
      this.users = users;

      if (event) {
        event.target.complete();
      }

      this.loaded = true;
    })
  }
}
