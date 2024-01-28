import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage.service";
import {IUser} from "../../interfaces/i-user";
import {StepService} from "../../services/step.service";
import {IStep} from "../../interfaces/i-step";
import {ModalController} from "@ionic/angular";
import {TrainingPage} from "../../_shared/pages/training/training.page";
import {ITraining} from "../../interfaces/i-training";
import {UploadService} from "../../services/upload.service";

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {


  user: IUser;
  steps: IStep[] = [];
  unsolvedSteps: IStep[] = [];
  trainings: ITraining[] = [];

  constructor(private storageService: LocalStorageService, private stepService: StepService,
              private modalCtrl: ModalController, private uploadService: UploadService) {
    this.storageService.getUser().then((user) => {
      this.user = user
    });
    this.getAllTrainings();
  }

  ngOnInit() {
    this.uploadService.getPublicLink('StartYourFuture');
  }

  getAllTrainings(event?: any) {
    return this.stepService.getAll(undefined, undefined, 'Training').then((trainings) => {
      this.trainings = trainings;

      for (let training of trainings) {
        training.steps = [];

        this.stepService.getAll([{
          key: 'trainingId',
          opr: '==',
          value: training.id
        }], 'order').then((steps) => training.steps = steps);
      }

      if (event) {
        event.target.complete();
      }

      //return steps;
    });
  }

  async openTraining(index: number) {
    this.user = await this.storageService.getUser();

    this.unsolvedSteps = this.trainings[index].steps!;

    const modal = await this.modalCtrl.create({
      component: TrainingPage,
      componentProps: {
        user: this.user,
        steps: this.unsolvedSteps,
        training: this.trainings[index]
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.training) {
        for (let training of this.trainings) {
          if (training.id === result.data.training.id) {
            training = result.data.training;
          }
        }
      }
    });

    return modal.present();
  }

  calculateProcess(training: ITraining): number {
    if (this.user.trainings) {
      for (let train of this.user.trainings!) {
        if (train.trainingId === training.id) {
          if (training.steps && train.absolvedSteps) {
            return parseInt((100 / training.steps.length * train.absolvedSteps.length).toFixed(2));
          }
        }
      }
    }

    return 0;
  }

  isPreventTrainingComplete(index: number) {
    if ((index - 1) >= 0 && this.user.trainings) {
      return this.user.trainings[index - 1] && this.user.trainings[index - 1].completed;
    }

    return false;
  }
}
