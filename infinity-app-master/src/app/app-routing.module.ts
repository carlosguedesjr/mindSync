import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { ProfileGuard } from './guards/profile.guard';

const routes: Routes = [
  { path: '', redirectTo: '/tabs/assessment', pathMatch: 'full' },

  { path: 'tabs', canActivate: [AuthGuard], loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'auth', children: [
    { path: 'entrar', loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule) },
    { path: 'esqueci-senha', loadChildren: () => import('./pages/auth/forgot/forgot.module').then(m => m.ForgotPageModule) },
    { path: 'registre-se', loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule) },
    {
      path: 'redefinir-senha',
      loadChildren: () => import('./pages/auth/password-reset/password-reset.module').then(m => m.PasswordResetPageModule)
    }
  ]},

  { path: '', canActivate: [AuthGuard], children: [
    {
      path: 'assessment/:id/:accessId',
      data: {assessment: true},
      canActivate: [ProfileGuard],
      loadChildren: () => import('./pages/assessment/form/form.module').then(m => m.AssessmentFormPageModule)
    },
  ]},
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
