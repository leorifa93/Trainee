import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminHomePage } from './admin-home.page';

const routes: Routes = [
  {
    path: '',
    component: AdminHomePage,
    children: [
      {
        path: 'requests',
        loadChildren: () => import('./requests/requests.module').then( m => m.RequestsPageModule)
      },
      {
        path: 'members',
        loadChildren: () => import('./members/members.module').then( m => m.MembersPageModule)
      },
      {
        path: 'steps',
        loadChildren: () => import('./steps/steps.module').then( m => m.StepsPageModule)
      },
      {
        path: 'menue',
        loadChildren: () => import('./../home/menue/menue.module').then( m => m.MenuePageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminHomePageRoutingModule {}
