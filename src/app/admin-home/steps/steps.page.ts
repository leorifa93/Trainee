import {Component, OnInit} from '@angular/core';
import {StepService} from "../../services/step.service";
import {IStep} from "../../interfaces/i-step";
import {ActionSheetController, ItemReorderEventDetail, ModalController, ToastController} from "@ionic/angular";
import {AddStepComponent} from "../../_shared/modals/add-step/add-step.component";
import {StepConstants} from "../../constants/stepConstants";
import {Encoding, Filesystem} from '@capacitor/filesystem';
import {UploadService} from "../../services/upload.service";
import {EditStepComponent} from "../../_shared/modals/edit-step/edit-step.component";
import {TrainingPage} from "../../_shared/pages/training/training.page";
import {LocalStorageService} from "../../services/local-storage.service";
import {IUser} from "../../interfaces/i-user";
import {ITraining} from "../../interfaces/i-training";

@Component({
  selector: 'app-steps',
  templateUrl: './steps.page.html',
  styleUrls: ['./steps.page.scss'],
})
export class StepsPage implements OnInit {

  steps: IStep[] = [];
  loaded: boolean = false;
  user: IUser;
  trainings: ITraining[] = [];

  constructor(private stepService: StepService, private modalCtrl: ModalController, private uploadService: UploadService,
              private toastCtrl: ToastController, private actionSheetCtrl: ActionSheetController, private storageService: LocalStorageService) {
    this.storageService.getUser().then((user) => this.user = user);
  }

  ngOnInit() {
    this.getAllSteps().then((steps) => {
      //this.steps = steps;
      this.loaded = true;
    });
  }

  getAllSteps(event?: any) {
    return this.stepService.getAll(undefined, undefined, 'Training').then((trainings) => {
      this.trainings = trainings;

      for (let training of trainings) {
        training.steps = [];

        this.stepService.getAll([{
          key: 'trainingId',
          opr: '==',
          value: training.id
        }], 'order').then((steps) => {
          training.steps = steps
        });
      }

      if (event) {
        event.target.complete();
      }

      //return steps;
    });
  }

  addStep(type: string, trainingId: any, index: any) {
    this.modalCtrl.create({
      component: AddStepComponent,
      componentProps: {
        type: type
      }
    }).then((modalEl) => {
      modalEl.present();

      return modalEl.onDidDismiss().then(async (eventDatail) => {
        if (eventDatail.data) {
          let payload: any;
          const toast = await this.toastCtrl.create({message: 'Video wird hochgeladen'});
          toast.present();

          const data = eventDatail.data;

          if (data.type === StepConstants.STEP_TYPE_VIDEO) {
            toast.present();

            return new Promise((resolve) => {
              Filesystem.requestPermissions().then((permission) => {
                if (permission.publicStorage === 'granted') {
                  Filesystem.readFile({
                    path: data.videoUrl,
                  }).then((result) => {
                    this.uploadService.uploadFile('data:video/mp4;base64,' + result.data, data.title).then((downloadUrl) => {
                      Filesystem.deleteFile({
                        path: data.videoUrl
                      });

                      const step: IStep = {
                        type: data.type,
                        title: data.title,
                        videoUrl: downloadUrl,
                        createdAt: Date.now(),
                        active: true,
                        order: this.trainings[index].steps ? this.trainings[index].steps?.length! + 1 : 1,
                        trainingId: trainingId,
                        text: data.text ? data.text : ''
                      };

                      this.stepService.add(step).then((doc) => {
                        step.id = doc.id;

                        if (this.trainings[index]?.steps) {
                          this.trainings[index].steps?.push(step);
                        }

                        if (data.pdfFilePath) {
                          var i = 0;

                          for (let path of data.pdfFilePath) {
                            Filesystem.readFile({
                              path: path
                            }).then((result) => {
                              i++;

                              console.log('pdfName: ', data.title + i + '_pdf');

                              this.uploadService.uploadFile('data:application/pdf;base64,' + result.data, data.title + i + '_pdf').then((url) => {
                                if (!step.pdfFileUrl) {
                                  step.pdfFileUrl = [];
                                }

                                step.pdfFileUrl.push(url);

                                return this.stepService.set(step.id, step);
                              })
                            })
                          }
                        }
                        toast.dismiss().then(() => {
                          this.toastCtrl.create({
                            message: 'Video erfolgreich hochgeladen!',
                            duration: 1500
                          }).then((newToast) => newToast.present());
                        });

                        resolve(step);
                      });

                    }).catch((err) => alert(err.message));
                  }).catch((err) => alert(err.message));
                }
              }).catch((err) => alert(JSON.stringify(err)));
            });
          } else if (data.type === StepConstants.STEP_TYPE_MULTIPLE_CHOICE) {
            toast.message = 'Multiple Choice wird erstellt!'
            toast.present()

            payload = {
              type: data.type,
              title: data.title,
              order: this.trainings[index].steps ? this.trainings[index].steps?.length! + 1 : 1,
              active: true,
              createdAt: Date.now(),
              questions: data.steps,
              trainingId: trainingId
            }

            this.trainings[index].steps?.push(payload);

            return this.stepService.add(payload).then(() => toast.dismiss());
          } else if (data.type === StepConstants.STEP_TYPE_TEXT) {
            toast.message = 'Text wird erstellt!'
            toast.present();

            payload = {
              type: data.type,
              title: data.title,
              order: this.trainings[index].steps ? this.trainings[index].steps?.length! + 1 : 1,
              active: true,
              createdAt: Date.now(),
              text: data.text,
              trainingId: trainingId
            };

            this.trainings[index].steps?.push(payload);

            return this.stepService.add(payload).then(() => toast.dismiss());
          } else if (data.type === StepConstants.STEP_TYPE_ADD_TRAINING) {
            toast.message = 'Training wird erstellt!'
            toast.present();

            payload = {
              title: data.title,
              description: data.text,
              stepsLength: 0
            };

            this.stepService.add(payload, 'Training').then(() => toast.dismiss());
          }
        }

        return;
      })
    });
  }

  async editTraining(training: ITraining) {
    const modal = await this.modalCtrl.create({
      component: EditStepComponent,
      componentProps: {
        type: StepConstants.STEP_TYPE_ADD_TRAINING,
        title: training.title,
        description: training.description
      }
    });

    modal.present();

    modal.onDidDismiss().then((eventDetail) => {
      if (eventDetail.data) {
        const data = eventDetail.data;

        training.title = data.title;
        training.description = data.description;

        this.stepService.set(training.id!, training, 'Training');
      }
    });
  }

  removeTraining(trainingId: string, index: number) {
    this.trainings.splice(index, 1);
    return this.stepService.remove(trainingId);
  }

  async showActions(id: string | undefined, index: number, trainingIndex: number, type: string) {
    let step = this.trainings[trainingIndex].steps![index];

    const sheet = await this.actionSheetCtrl.create({
      buttons: [{
        text: 'Bearbeiten',
        handler: async () => {
          return this.edit(step, {
            steps: step.questions,
            title: step.title,
            type: type,
            text: step.text,
            alreadyFilePaths: step.pdfFileUrl
          });
        }
      }, {
        text: 'Löschen',
        role: 'destructive',
        handler: () => {
          this.trainings[trainingIndex].steps!.splice(index, 1);

          if (step.id) {
            this.stepService.remove(step.id).then(() => this.updateOrder(trainingIndex));
          }
        }
      }]
    });

    sheet.present();
  }

  async edit(step: IStep, props: any) {
    const modal = await this.modalCtrl.create({
      component: EditStepComponent,
      componentProps: props
    });

    modal.present();

    modal.onDidDismiss().then((eventDetail) => {
      if (eventDetail.data && step.id) {
        const data = eventDetail.data;

        step.title = data.title;

        if (data.type === StepConstants.STEP_TYPE_MULTIPLE_CHOICE) {
          step.questions = data.steps;
        }

        if (data.type === StepConstants.STEP_TYPE_TEXT) {
          step.text = data.text;
        }

        if (data.type === StepConstants.STEP_TYPE_VIDEO) {
          step.text = data.text;
          step.pdfFileUrl = data.alreadyFilePaths;
          if (data.pdfFilePath.length > 0) {

            var index = 0;

            for (let path of data.pdfFilePath) {
              Filesystem.readFile({
                path: path
              }).then((result) => {
                index++;

                this.uploadService.uploadFile('data:application/pdf;base64,' + result.data, data.title + index + '_pdf').then((url) => {
                  if (!step.pdfFileUrl) {
                    step.pdfFileUrl = [];
                  }

                  step.pdfFileUrl.push(url);

                  return this.stepService.set(step.id, step);
                })
              })
            }
          }
        }

        if (!step.pdfFileUrl) {
          delete step.pdfFileUrl;
        }

        this.stepService.set(step.id, step);
      }
    })
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>, index: number) {
    const move = (arr: any, old_index: number, new_index: number) => {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    };

    ev.detail.complete();

    move(this.trainings[index].steps!, ev.detail.from, ev.detail.to);
    this.updateOrder(index);
  }

  updateOrder(trainingIndex: number) {
    let order = 1;
    let promises = [];

    for (let step of this.trainings[trainingIndex].steps!) {
      step.order = order;
      order++;

      if (step.id) {
        promises.push(this.stepService.set(step.id, step));
      }
    }

    return Promise.all(promises);
  }

  async showPreview(index: number) {
    const modal = await this.modalCtrl.create({
      component: TrainingPage,
      componentProps: {
        isPreview: true,
        steps: this.trainings[index].steps,
        user: this.user,
        training: this.trainings[index]
      }
    });

    return modal.present();
  }
}
