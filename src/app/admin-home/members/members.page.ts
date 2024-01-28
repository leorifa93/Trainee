import {Component, OnInit} from '@angular/core';
import {UserConstants} from "../../constants/userConstants";
import {UserService} from "../../services/user-service.service";
import {ActionSheetController, ToastController} from "@ionic/angular";
import {IUser} from "../../interfaces/i-user";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
})
export class MembersPage implements OnInit {
  users: IUser[] = [];
  clonedUsers: IUser[] = [];
  loaded: boolean = false;
  currentUser: IUser;

  constructor(private userService: UserService, private toastCtrl: ToastController, private localStorage: LocalStorageService,
              private actionSheetController: ActionSheetController) {
  }

  ngOnInit() {
    this.localStorage.getUser().then((user) => {
      this.currentUser = user;
      this.getUsers();
    });
  }


  getUsers(event?: any) {
    this.userService.getAll([
      {key: 'status', opr: '==', value: UserConstants.STATUS_ACTIVE},
      {key: 'tpNumber', opr: '!=', value: this.currentUser.tpNumber},
      //{key: 'userRole', opr: '==', value: UserConstants.USER_ROLE_USER}
    ]).then((users) => {
      this.users = users;
      this.clonedUsers = Object.assign([], this.users);

      if (event) {
        event.target.complete();
      }

      this.loaded = true;
    })
  }

  async showActions(userId: string, index: number) {
    const actions = await this.actionSheetController.create({
      buttons: [
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            this.users.splice(index, 1);
            return this.userService.remove(userId);
          }
        }
      ]
    });

    actions.present();
  }

  searchUsers(event: any) {
    this.clonedUsers = [];
    const value = event.detail.value.toLowerCase();

    if (value) {
      for (let user of this.users) {
        if (user.fullName.toLowerCase().includes(value) || user.tpNumber.toString().includes(value)) {
          this.clonedUsers.push(user);
        }
      }
    } else {
      this.clonedUsers = Object.assign([], this.users);
    }
  }
}
