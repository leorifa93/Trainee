import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {IUser} from "../../../interfaces/i-user";
import {IStep} from "../../../interfaces/i-step";
import {Plugins} from "@capacitor/core";
import {UserService} from "../../../services/user-service.service";
import {LocalStorageService} from "../../../services/local-storage.service";
import {ModalController, ToastController} from "@ionic/angular";
import {Http, HttpDownloadFileResult} from '@capacitor-community/http';
import {Filesystem, Directory} from '@capacitor/filesystem';
import {ITraining} from "../../../interfaces/i-training";
import {HttpClient, HttpEventType, HttpHeaders} from "@angular/common/http";
import {FileOpener} from "@capacitor-community/file-opener";
import {Capacitor} from "@capacitor/core";

const {CapacitorVideoPlayer} = Plugins;

@Component({
  selector: 'app-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
})
export class TrainingPage implements OnInit {
  @ViewChild('stepSlides') swiperRef: ElementRef;

  @Input() user: IUser;
  @Input() steps: IStep[];
  @Input() isPreview: boolean;
  @Input() training: ITraining;
  isCompleted: boolean = false;

  videoPlayer: any;
  currentIndex: number;

  constructor(private userService: UserService, private storageService: LocalStorageService,
              private modalCtrl: ModalController, private http: HttpClient, private toastCtrl: ToastController) {
    this.videoPlayer = CapacitorVideoPlayer;
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    if (!this.user.currentStep) {
      this.user.currentStep = (<any>{
        trainingName: this.training.title,
        step: this.steps[this.swiperRef.nativeElement.swiper.activeIndex].order
      });
    }

    this.userService.set(this.user.id, this.user);
    this.swiperRef.nativeElement.swiper.allowTouchMove = false;

    if (!this.isPreview) {
      this.slideTo();
    }
  }

  slideTo() {
    if (this.user.trainings) {
      for (let train of this.user.trainings!) {
        if (train.trainingId === this.training.id) {
          this.isCompleted = train.completed;

          if (!train.completed) {
            this.swiperRef.nativeElement.swiper.slideTo(train.absolvedSteps.length);
            this.currentIndex = this.swiperRef.nativeElement.swiper.activeIndex;
          }
        }
      }
    }
  }

  setStep(absolvedStep: string, isComplete?: boolean) {
    var isTrainingExists = false;

    if (!this.user.trainings) {
      this.user.trainings = [];
    }

    for (let training of this.user.trainings) {
      if (training.trainingId === this.training.id) {
        isTrainingExists = true;

        if (!training.absolvedSteps.includes(absolvedStep) && absolvedStep.length > 0) {
          training.absolvedSteps.push(absolvedStep);
        }

        if (isComplete) {
          training.completed = isComplete;
        }
      }
    }

    if (!isTrainingExists) {
      this.user.trainings.push({
        trainingId: this.training.id!,
        absolvedSteps: [absolvedStep],
        completed: false
      })
    }
  }

  startVideo(videoUrl: any, step: IStep, index: number) {
    this.videoPlayer.initPlayer({
      mode: 'fullscreen',
      url: videoUrl,
      exitOnEnd: true,
      playerId: 'previewPlayer',
      chromecast: false,
      showControls: false
    });

    this.videoPlayer.addListener('jeepCapVideoPlayerEnded', () => {
      if (this.isPreview) {
        return;
      }

      if (index + 1 <= this.steps.length) {
        if (!this.user.currentStep) {
          this.user.currentStep = (<any>{
            trainingName: this.training,
            step: this.steps[index + 1].order,
            absolvedSteps: []
          });
        } else {
          this.user.currentStep!.trainingName = this.training.title;

          if (this.steps[index + 1]) {
            this.user.currentStep!.step = this.steps[index + 1].order!;
          }
        }
      }

      this.setStep(step.id);
      this.updateUser(step.id);
    }, false);
  }

  isAbsolved(stepId: string) {
    if (this.user.trainings) {
      for (let training of this.user.trainings!) {
        if (training.trainingId === this.training.id) {
          return training.absolvedSteps.includes(stepId);
        }
      }
    }

    return false;
  }

  close() {
    this.modalCtrl.dismiss({
      user: this.user
    });
  }

  selectAnswer(e: any, answer: any, step: IStep, index: number) {
    if (answer.isRightAnswer) {
      e.srcElement.color = 'success';

      setTimeout(() => {
        this.next();

        if (this.isPreview) {
          return;
        }

        if (index + 1 <= this.steps.length) {
          if (!this.user.currentStep) {
            this.user.currentStep = (<any>{
              trainingName: this.training,
              step: this.steps[index + 1].order,
              absolvedSteps: []
            });
          } else {
            this.user.currentStep!.trainingName = this.training.title;

            if (this.steps[index + 1]) {
              this.user.currentStep!.step = this.steps[index + 1].order!;
            }
          }
        }

        this.setStep(step.id);
        this.updateUser(step.id);
      }, 1500);
    } else {
      e.srcElement.color = 'danger';
    }
  }

  next() {
    if (this.swiperRef.nativeElement.swiper.isEnd) {
      this.setStep('', true);
      this.userService.set(this.user.id, this.user);
      this.modalCtrl.dismiss({
        training: this.training
      });
    }

    this.swiperRef.nativeElement.swiper.slideNext(500);

    this.currentIndex = this.swiperRef.nativeElement.swiper.activeIndex;
  }

  back() {
    this.swiperRef.nativeElement.swiper.slidePrev(500);

    this.currentIndex = this.swiperRef.nativeElement.swiper.activeIndex;
  }

  updateUser(stepId: any) {
    if (!this.isPreview) {
      if (!this.user.currentStep!.absolvedSteps) {
        this.user.currentStep!.absolvedSteps = [];
      }

      if (!this.user.currentStep!.absolvedSteps.includes(stepId)) {
        this.user.currentStep!.absolvedSteps.push(stepId);
      }

      this.userService.set(this.user.id, this.user).then(() => this.storageService.setUser(this.user));
    }
  }

  readDone(step: IStep, index: number) {
    this.next();

    if (this.isPreview) {
      return;
    }

    if (index + 1 <= this.steps.length) {
      if (!this.user.currentStep) {
        this.user.currentStep = (<any>{
          trainingName: this.training,
          step: this.steps[index + 1].order,
          absolvedSteps: []
        });
      } else {
        this.user.currentStep!.trainingName = this.training.title;

        if (this.steps[index + 1]) {
          this.user.currentStep!.step = this.steps[index + 1].order!;
        }
      }
    }

    this.setStep(step.id);
    this.updateUser(step.id);
  }

  async downloadPDF(name: any, URL: any) {
    const toast = await this.toastCtrl.create({
      message: "PDF wird heruntergeladen"
    });


    try {
      let downloadResult = await Filesystem.downloadFile({
        url: URL,
        path: `startYourFuture/${name}-${Date.now()}.pdf`,
        directory: Capacitor.getPlatform() === 'ios' ? Directory.Documents : Directory.Data,
      });
      
      toast.dismiss();

      FileOpener.open({
        filePath: downloadResult.path!
      });
    } catch (e) {
      console.log('downloadError: ', e);
    }
  }

  private convertBlobToBase64 = (blob: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;

    reader.onload = () => {
      resolve(reader.result)
    };

    reader.readAsDataURL(blob);
  })

  getProgress() {
    if (this.swiperRef) {
      const value = (100 / this.steps.length) * this.swiperRef.nativeElement.swiper.activeIndex;
      return '.' + Math.round(value);
    }

    return 0;
  }
}
