import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'start',
        loadChildren: () => import('./start/start.module').then( m => m.StartPageModule)
      },
      {
        path: 'menue',
        loadChildren: () => import('./menue/menue.module').then( m => m.MenuePageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
