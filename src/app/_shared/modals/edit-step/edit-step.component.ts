import {Component, Input, OnInit} from '@angular/core';
import {AlertController, ModalController, ToastController} from "@ionic/angular";
import {StepConstants} from "../../../constants/stepConstants";
import {FilePicker} from "@capawesome/capacitor-file-picker";
import {Directory} from "@capacitor/filesystem";
import {Http, HttpDownloadFileResult} from "@capacitor-community/http";
import {FileOpener} from "@capacitor-community/file-opener";

@Component({
  selector: 'app-edit-step',
  templateUrl: './edit-step.component.html',
  styleUrls: ['./edit-step.component.scss'],
})
export class EditStepComponent implements OnInit {

  @Input() type: string;
  @Input() title: string;
  @Input() description: string;
  @Input() alreadyFilePaths: string[];
  pdfFileName: string[] = [];
  pdfFilePath: string[] = [];

  @Input() text: string;

  @Input() steps: { question: string, isRightAnswer: boolean }[] = [{
    question: '',
    isRightAnswer: false
  }];

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController, private toastCtrl: ToastController) {
  }

  ngOnInit() {
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

  async save() {
    const alert = await this.alertCtrl.create({message: 'Bitte fülle alle Felder aus!'});
    let noRightAnswers = true;

    if (this.title) {

      if (this.type === StepConstants.STEP_TYPE_MULTIPLE_CHOICE) {
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
          order: this.steps.length + 1,
          text: this.text
        });
      } else if (this.type === StepConstants.STEP_TYPE_VIDEO) {
        this.modalCtrl.dismiss({
          type: this.type,
          title: this.title,
          pdfFilePath: this.pdfFilePath,
          text: this.text
        });
      } else if (this.type === StepConstants.STEP_TYPE_ADD_TRAINING) {
        this.modalCtrl.dismiss({
          type: this.type,
          title: this.title,
          description: this.description
        });
      } else if(this.type === StepConstants.STEP_TYPE_TEXT) {
        this.modalCtrl.dismiss({
          type: this.type,
          title: this.title,
          text: this.text
        });
      }
    } else {
      return alert.present()
    }
  }

  chooseFile() {
    FilePicker.pickFiles({
      types: ['application/pdf']
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

  async downloadPDF(name: any, URL: any) {
    const toast = await this.toastCtrl.create({
      message: "PDF wird heruntergeladen"
    });

    const options = { url: URL, filePath: `startYourFuture/${name}-${Date.now()}.pdf`, fileDirectory: Directory.Documents, method: 'GET', };
    const response: HttpDownloadFileResult = await Http.downloadFile(options);

    toast.dismiss();

    FileOpener.open({
      filePath: response.path!
    });
  }

  removeAlreadyPath(i: number) {
    this.alreadyFilePaths.splice(i, 1);
  }
}
