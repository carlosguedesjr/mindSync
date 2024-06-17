import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { Page, PageRole } from './models/permission';
import { PermissionGuard } from './guards/permission.guard';

import { LayoutComponent } from './layout/layout.component';
import { UserListComponent } from './modules/user/list/list.component';
import { GroupListComponent } from './modules/group/list/list.component';
import { LoginFormComponent } from './modules/auth/login/login.component';
// import { CouponListComponent } from './modules/coupon/list/list.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { StudentListComponent } from './modules/student/list/list.component';
import { StudentFormComponent } from './modules/student/form/form.component';
import { CompanyListComponent } from './modules/company/list/list.component';
import { AssessmentListComponent } from './modules/assessment/list/list.component';
import { ReportStudentComponent } from './modules/report/student/report.component';
import { AccessListComponent } from './modules/assessment/access/list/list.component';
import { CompanyPostListComponent } from './modules/company/post/list/list.component';
import { CompanyAreaListComponent } from './modules/company/area/list/list.component';
import { CompanyBranchListComponent } from './modules/company/branch/list/list.component';
import { AssessmentGroupListComponent } from './modules/assessment/group/list/list.component';
import { CompanyDepartmentListComponent } from './modules/company/department/list/list.component';
import { ReportAssessmentNeuroComponent } from './modules/report/assessment/neuro/report.component';
import { NewNeuroComponent } from './modules/report/assessment/new-neuro/new-neuro.component';
import { PasswordResetFormComponent } from './modules/auth/password-reset/password-reset.component';
import { AssessmentQuestionListComponent } from './modules/assessment/question/list/list.component';
import { ForgotPasswordFormComponent } from './modules/auth/forgot-password/forgot-password.component';
import { AssessmentInstructionListComponent } from './modules/assessment/instruction/list/list.component';
import { ReportAssessmentStudentNeuroComponent } from './modules/report/assessment/student-neuro/report.component';
import { ReportAssessmentStudentNeuroCompleteComponent } from './modules/report/assessment/student-neuro-comp/report.component';
import { ReportAssessmentStudentComparisonNeuroCompleteComponent } from './modules/report/assessment/student-neuro-compars/report.component';
import { ReportAssessmentStudentProfileComponent } from './modules/report/assessment/student-profile/report.component';

const routes: Routes = [

  {
    path: 'auth', children: [
      { path: '', redirectTo: 'entrar', pathMatch: 'full' },
      { path: 'entrar', component: LoginFormComponent },
      { path: 'esqueci-senha', component: ForgotPasswordFormComponent },
      { path: 'redefinir-senha', component: PasswordResetFormComponent },
    ]
  },

  {
    path: '', canActivate: [AuthGuard], component: LayoutComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      // {
      //   path: 'cupons',
      //   component: CouponListComponent,
      //   canActivate: [PermissionGuard],
      //   data: {permissions: [{page: Page.CounponPage, role: PageRole.CanList}]}
      // },
      {
        path: 'empresas',
        canActivate: [PermissionGuard],
        data: { permissions: [{ page: Page.CompanyPage, role: PageRole.CanList }] },
        children: [
          {
            path: '',
            canActivate: [PermissionGuard],
            component: CompanyListComponent,
            data: { permissions: [{ page: Page.CompanyPage, role: PageRole.CanList }] },
          },
          {
            path: 'unidades',
            canActivate: [PermissionGuard],
            component: CompanyBranchListComponent,
            data: { permissions: [{ page: Page.CompanyPage, role: PageRole.CanList }] },
          },
          {
            path: 'entidades',
            canActivate: [PermissionGuard],
            component: CompanyDepartmentListComponent,
            data: { permissions: [{ page: Page.CompanyPage, role: PageRole.CanList }] },
          },
          {
            path: 'areas',
            canActivate: [PermissionGuard],
            component: CompanyAreaListComponent,
            data: { permissions: [{ page: Page.CompanyPage, role: PageRole.CanList }] },
          },
          {
            path: 'cargos',
            canActivate: [PermissionGuard],
            component: CompanyPostListComponent,
            data: { permissions: [{ page: Page.CompanyPage, role: PageRole.CanList }] },
          },
        ]
      },
      {
        path: 'alunos',
        canActivate: [PermissionGuard],
        data: { permissions: [{ page: Page.StudentPage, role: PageRole.CanList }] },
        children: [
          { path: '', component: StudentListComponent },
          {
            path: 'formulario', children: [
              { path: '', component: StudentFormComponent },
              { path: ':id', component: StudentFormComponent },
            ]
          },
        ]
      },
      {
        path: 'assessments',
        canActivate: [PermissionGuard],
        component: AssessmentListComponent,
        data: { permissions: [{ page: Page.AssessmentPage, role: PageRole.CanList }] },
      },
      {
        path: 'assessment',
        children: [
          { path: '', redirectTo: 'questoes', pathMatch: 'full' },
          {
            path: 'grupos',
            canActivate: [PermissionGuard],
            component: AssessmentGroupListComponent,
            data: { permissions: [{ page: Page.AssessmentGroupPage, role: PageRole.CanList }] },
          },
          {
            path: 'questoes',
            canActivate: [PermissionGuard],
            component: AssessmentQuestionListComponent,
            data: { permissions: [{ page: Page.AssessmentQuestionPage, role: PageRole.CanList }] },
          },
          {
            path: 'instrucoes',
            canActivate: [PermissionGuard],
            component: AssessmentInstructionListComponent,
            data: { permissions: [{ page: Page.AssessmentInstructionPage, role: PageRole.CanList }] },
          },
          {
            path: 'acessos',
            component: AccessListComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [{ page: Page.AccessPage, role: PageRole.CanList }] }
          },
        ]
      },
      {
        path: 'relatorios',
        children: [
          {
            path: 'assessment/nneuro',
            canActivate: [PermissionGuard],
            component: NewNeuroComponent,
            data: { permissions: [{ page: Page.ReportAssessmentPage, role: PageRole.CanList }] },
          },
          {
            path: 'assessment/neuro',
            canActivate: [PermissionGuard],
            component: ReportAssessmentNeuroComponent,
            data: { permissions: [{ page: Page.ReportAssessmentPage, role: PageRole.CanList }] },
          },
          {
            path: 'assessment/individual/neuro',
            canActivate: [PermissionGuard],
            component: ReportAssessmentStudentNeuroComponent,
            data: { permissions: [{ page: Page.ReportAssessmentPage, role: PageRole.CanList }] },
          },
          {
            path: 'assessment/individual/neuro-completo',
            canActivate: [PermissionGuard],
            component: ReportAssessmentStudentNeuroCompleteComponent,
            data: { permissions: [{ page: Page.ReportAssessmentPage, role: PageRole.CanList }] },
          },
          {
            path: 'assessment/comparison/neuro-completo',
            canActivate: [PermissionGuard],
            component: ReportAssessmentStudentComparisonNeuroCompleteComponent,
            data: { permissions: [{ page: Page.ReportAssessmentPage, role: PageRole.CanList }] },
          },
          {
            path: 'assessment/individual/profile',
            canActivate: [PermissionGuard],
            component: ReportAssessmentStudentProfileComponent,
            data: { permissions: [{ page: Page.ReportAssessmentPage, role: PageRole.CanList }] },
          },
          {
            path: 'alunos',
            canActivate: [PermissionGuard],
            component: ReportStudentComponent,
            data: { permissions: [{ page: Page.ReportStudentPage, role: PageRole.CanList }] },
          },
        ]
      },

      {
        path: 'administracao', children: [
          {
            path: 'usuarios',
            component: UserListComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [{ page: Page.UserPage, role: PageRole.CanList }] },
          },
          {
            path: 'grupos',
            component: GroupListComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [{ page: Page.GroupPage, role: PageRole.CanList }] },
          },
        ]
      }
    ]
  },

  // ERROR PAGES
  { path: 'error/403', loadChildren: () => import('./modules/error/403/403.module').then(m => m.Error403Module) },
  { path: '**', loadChildren: () => import('./modules/error/404/404.module').then(m => m.Error404Module) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
