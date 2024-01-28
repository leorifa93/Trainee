import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StepsPageRoutingModule } from './steps-routing.module';

import { StepsPage } from './steps.page';
import {AddStepComponent} from "../../_shared/modals/add-step/add-step.component";
import {EditStepComponent} from "../../_shared/modals/edit-step/edit-step.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StepsPageRoutingModule
  ],
  declarations: [StepsPage, AddStepComponent, EditStepComponent]
})
export class StepsPageModule {}
