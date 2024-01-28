import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuePage } from './menue.page';

const routes: Routes = [
  {
    path: '',
    component: MenuePage
  },
  {
    path: 'data-protection',
    loadChildren: () => import('./data-protection/data-protection.module').then( m => m.DataProtectionPageModule)
  },
  {
    path: 'agb',
    loadChildren: () => import('./agb/agb.module').then( m => m.AgbPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuePageRoutingModule {}
