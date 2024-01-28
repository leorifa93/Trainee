import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {UserService} from "../services/user-service.service";
import {UserConstants} from "../constants/userConstants";
import {user} from "@angular/fire/auth";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  screen: string = 'login';
  formData: FormGroup;
  formRegistrationData: FormGroup;
  isPasswordWrong: boolean = false;
  isLoggingIn: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService,
              private router: Router) {
    this.formData = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.formRegistrationData = this.fb.group({
      fullName: ['', [Validators.required]],
      tpNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
  }

  changeState(state: string) {
    this.screen = state;
  }

  async createUser(formData: any) {
    this.isLoggingIn = true;

    const users = await this.userService.getAll([{key: 'tpNumber', opr: '==', value: formData.value.tpNumber}]);

    if (users.length > 0) {
      alert("Die TP Nummer existiert bereits!");
      this.isLoggingIn = false;

      return;
    }

    createUserWithEmailAndPassword(getAuth(), formData.value.email, formData.value.password).then(async (userCredentials) => {
      formData.value.userRole = UserConstants.USER_ROLE_USER;
      formData.value.status = UserConstants.STATUS_PENDING;

      if (!formData.value.mobileNumber) {
        formData.value.mobileNumber = 0;
      }

      delete formData.value.password;

      this.userService.set(userCredentials.user.uid, formData.value);
      this.isLoggingIn = false;
    }).catch((err) => {
      alert(err.message);
      this.isLoggingIn = false;
    })
  }

  login(formData: any) {
    this.isLoggingIn = true;

    signInWithEmailAndPassword(getAuth(), formData.value.email, formData.value.password)
      .then((userCredentials) => {
        this.isLoggingIn = false;
      })
      .catch((err) => {
        this.isLoggingIn = false;
      this.isPasswordWrong = true;
    });
  }

  showPage(page: string) {
    this.router.navigate(['/' + page]);
  }
}
