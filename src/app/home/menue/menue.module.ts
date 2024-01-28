import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuePageRoutingModule } from './menue-routing.module';

import { MenuePage } from './menue.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuePageRoutingModule
  ],
  declarations: [MenuePage]
})
export class MenuePageModule {}
