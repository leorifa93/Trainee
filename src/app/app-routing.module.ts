import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'admin-home',
    loadChildren: () => import('./admin-home/admin-home.module').then( m => m.AdminHomePageModule)
  },
  {
    path: 'training',
    loadChildren: () => import('./_shared/pages/training/training.module').then( m => m.TrainingPageModule)
  },
  {
    path: 'data-protection',
    loadChildren: () => import('./home/menue/data-protection/data-protection.module').then( m => m.DataProtectionPageModule)
  },
  {
    path: 'agb',
    loadChildren: () => import('./home/menue/agb/agb.module').then( m => m.AgbPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
