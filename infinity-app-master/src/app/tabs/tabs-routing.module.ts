import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'mba', loadChildren: () => import('../pages/mba/list/list.module').then(m => m.MBAListPageModule) },
      { path: 'perfil', loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule) },
      { path: 'cursos', loadChildren: () => import('../pages/course/list/list.module').then(m => m.CourseListPageModule) },
      { path: 'assessment', loadChildren: () => import('../pages/assessment/list/list.module').then(m => m.AssessmentListPageModule) },
      { path: '', redirectTo: 'assessment', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
