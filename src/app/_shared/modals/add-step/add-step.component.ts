import {Component, Input, OnInit} from '@angular/core';
import {CameraPro} from "@deva-community/capacitor-camera-pro";
import {AlertController, ModalController, ToastController} from "@ionic/angular";
import { VideoEditor } from '@awesome-cordova-plugins/video-editor';
import {UploadService} from "../../../services/upload.service";
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Component({
  selector: 'app-add-step',
  templateUrl: './add-step.component.html',
  styleUrls: ['./add-step.component.scss'],
})
export class AddStepComponent implements OnInit {

  @Input() type: string;
  title: string;
  videoUrl: string;

  thumbNail: string;

  text: string;

  pdfFilePath: string[] = [];
  pdfFileName: string[] = [];
  steps: { question: string, isRightAnswer: boolean }[] = [{
    question: '',
    isRightAnswer: false
  }];

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController, private toastCtrl: ToastController, private uploadService: UploadService) {
  }

  ngOnInit() {

  }

  async chooseVideo() {
    CameraPro.requestPermissions().then((permission) => {
      if (permission.camera === 'granted') {
        CameraPro.getVideo({}).then((video) => {
          if (video.path) {
            this.videoUrl = video.path;
          }
        });
      }
    }).catch((err) => alert('path: ' + this.videoUrl));
  }

  async uploadVideo() {
    const toast = await this.toastCtrl.create({message: 'Video wird komprimiert!'});
    let data: any;

      toast.present();

      VideoEditor.transcodeVideo({
        fileUri: this.videoUrl,
        outputFileName: this.title + '_transcoded'
      }).then((transcodedFile) => {
        this.videoUrl = transcodedFile;

        toast.dismiss();

        return this.modalCtrl.dismiss(data);
      }).catch((err) => {
        toast.dismiss();

        return this.modalCtrl.dismiss(data);
      });

      data = {
        title: this.title,
        type: this.type,
        videoUrl: this.videoUrl,
        thumbnail: this.thumbNail,
        pdfFilePath: this.pdfFilePath,
        text: this.text
      }
  }

  close() {
    return this.modalCtrl.dismiss();
  }

  addAnswer() {
    this.steps.push({
      question: '',
      isRightAnswer: false
    })
  }

  removeAnswer(index: number) {
    this.steps.splice(index, 1);
  }

  onSetRightAnswer(index: number) {
    for (let i = 0; i < this.steps.length; i++) {
      if (i !== index) {
        this.steps[i].isRightAnswer = false;
      }
    }
  }

  async createMultipleChoice() {
    const alert = await this.alertCtrl.create({message: 'Bitte fülle alle Felder aus!'});
    let noRightAnswers = true;

    if (this.title) {
      for (let step of this.steps) {
        if (!step.question) {
          return alert.present();
        }

        if (step.isRightAnswer) {
          noRightAnswers = false;
        }
      }

      if (noRightAnswers) {
        alert.message = 'Eine Antwort muss richtig sein!';

        return alert.present();
      }

      this.modalCtrl.dismiss({
        type: this.type,
        title: this.title,
        steps: this.steps,
        order: this.steps.length + 1
      });
    } else {
      return alert.present()
    }
  }

  createText() {
    this.modalCtrl.dismiss({
      type: this.type,
      title: this.title,
      text: this.text
    });
  }

  chooseFile() {
    FilePicker.pickFiles({
      types: ['application/pdf'],
      multiple: true
    }).then((result) => {
      for (let file of result.files) {
        if (file.path) {
          this.pdfFilePath.push(file.path);
        }

        if (file.name) {
          this.pdfFileName.push(file.name);
        }
      }
    })
  }
}
