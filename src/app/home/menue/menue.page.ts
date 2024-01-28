import { Component, OnInit } from '@angular/core';
import {getAuth, signOut} from 'firebase/auth';
import {Router} from "@angular/router";
import {LocalStorageService} from "../../services/local-storage.service";
import {IUser} from "../../interfaces/i-user";
import {UserService} from "../../services/user-service.service";


@Component({
  selector: 'app-menue',
  templateUrl: './menue.page.html',
  styleUrls: ['./menue.page.scss'],
})
export class MenuePage implements OnInit {

  user: IUser
  constructor(private router: Router, private storageService: LocalStorageService, private userService: UserService) {
    this.storageService.getUser().then((user) => this.user = user);
  }

  ngOnInit() {
  }

  signOut() {
    return signOut(getAuth());
  }

  navigate(page: string) {
    this.router.navigate([this.router.url + page]);
  }

  removeAcc() {
    this.userService.remove(this.user.id);
    this.signOut()
  }
}
