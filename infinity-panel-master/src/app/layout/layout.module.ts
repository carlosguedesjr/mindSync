import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// MATERIAL
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';

// ===============================================================================
// MODULES =======================================================================
// ===============================================================================
import { UserListComponent } from 'src/app/modules/user/list/list.component';
import { UserFormComponent } from 'src/app/modules/user/form/form.component';
import { UserDetailComponent } from 'src/app/modules/user/detail/detail.component';

import { GroupListComponent } from 'src/app/modules/group/list/list.component';
import { GroupFormComponent } from 'src/app/modules/group/form/form.component';
import { GroupDetailComponent } from 'src/app/modules/group/detail/detail.component';

import { CompanyListComponent } from 'src/app/modules/company/list/list.component';
import { CompanyFormComponent } from 'src/app/modules/company/form/form.component';
import { CompanyDetailComponent } from 'src/app/modules/company/detail/detail.component';

import { CompanyAreaListComponent } from 'src/app/modules/company/area/list/list.component';
import { CompanyAreaFormComponent } from 'src/app/modules/company/area/form/form.component';
import { CompanyAreaDetailComponent } from 'src/app/modules/company/area/detail/detail.component';

import { CompanyPostListComponent } from 'src/app/modules/company/post/list/list.component';
import { CompanyPostFormComponent } from 'src/app/modules/company/post/form/form.component';
import { CompanyPostDetailComponent } from 'src/app/modules/company/post/detail/detail.component';

import { CompanyBranchListComponent } from 'src/app/modules/company/branch/list/list.component';
import { CompanyBranchFormComponent } from 'src/app/modules/company/branch/form/form.component';
import { CompanyBranchDetailComponent } from 'src/app/modules/company/branch/detail/detail.component';

import { CompanyDepartmentListComponent } from 'src/app/modules/company/department/list/list.component';
import { CompanyDepartmentFormComponent } from 'src/app/modules/company/department/form/form.component';
import { CompanyDepartmentDetailComponent } from 'src/app/modules/company/department/detail/detail.component';

import { DialogContentExportComponent } from 'src/app/modules/student/list/list.component';
import { StudentListComponent } from 'src/app/modules/student/list/list.component';
import { StudentFormComponent } from 'src/app/modules/student/form/form.component';
import { StudentDetailComponent } from 'src/app/modules/student/detail/detail.component';

import { CouponListComponent } from 'src/app/modules/coupon/list/list.component';
import { CouponFormComponent } from 'src/app/modules/coupon/form/form.component';
import { CouponDetailComponent } from 'src/app/modules/coupon/detail/detail.component';

import { AccessListComponent } from 'src/app/modules/assessment/access/list/list.component';
import { AccessFormComponent } from 'src/app/modules/assessment/access/form/form.component';
import { AccessDetailComponent } from 'src/app/modules/assessment/access/detail/detail.component';

import { AssessmentListComponent } from 'src/app/modules/assessment/list/list.component';
import { AssessmentFormComponent } from 'src/app/modules/assessment/form/form.component';
import { AssessmentDetailComponent } from 'src/app/modules/assessment/detail/detail.component';

import { AssessmentGroupListComponent } from 'src/app/modules/assessment/group/list/list.component';
import { AssessmentGroupFormComponent } from 'src/app/modules/assessment/group/form/form.component';
import { AssessmentGroupDetailComponent } from 'src/app/modules/assessment/group/detail/detail.component';

import { AssessmentQuestionListComponent } from 'src/app/modules/assessment/question/list/list.component';
import { AssessmentQuestionFormComponent } from 'src/app/modules/assessment/question/form/form.component';
import { AssessmentQuestionDetailComponent } from 'src/app/modules/assessment/question/detail/detail.component';

import { AssessmentInstructionListComponent } from 'src/app/modules/assessment/instruction/list/list.component';
import { AssessmentInstructionFormComponent } from 'src/app/modules/assessment/instruction/form/form.component';
import { AssessmentInstructionDetailComponent } from 'src/app/modules/assessment/instruction/detail/detail.component';

import { ReportStudentComponent } from '../modules/report/student/report.component';
import { ReportAssessmentNeuroComponent } from 'src/app/modules/report/assessment/neuro/report.component';
import { NewNeuroComponent } from 'src/app/modules/report/assessment/new-neuro/new-neuro.component';
import { ReportAssessmentStudentNeuroComponent } from 'src/app/modules/report/assessment/student-neuro/report.component';
import { ReportAssessmentStudentNeuroCompleteComponent } from 'src/app/modules/report/assessment/student-neuro-comp/report.component';
import { ReportAssessmentStudentComparisonNeuroCompleteComponent } from 'src/app/modules/report/assessment/student-neuro-compars/report.component';
import { ReportAssessmentStudentProfileComponent } from 'src/app/modules/report/assessment/student-profile/report.component';
import { DialogContentExportReportComponent } from 'src/app/modules/report/assessment/student-profile/report.component';

import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';

// MASK
import { NgxMaskModule } from 'ngx-mask';
// QUILL
import { QuillModule } from 'ngx-quill';
// DROPZONE
import { NgxDropzoneModule } from 'ngx-dropzone';
// COMPRESS
import { NgxImageCompressService } from 'ngx-image-compress';
// LOTTIE
import { LottieModule } from 'ngx-lottie';
export function playerFactory(): Promise<any> {
  return import('lottie-web');
}

// DEFAULT
import { LayoutComponent } from './layout.component';
import { RemoveHtmlPipe } from '../pipes/remove-html.pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { translateMatPaginator } from 'src/app/services/localization.service';

@NgModule({
  declarations: [
    RemoveHtmlPipe,
    LayoutComponent,
    DeleteComponent,
    LoadingComponent,
    UserListComponent,
    UserFormComponent,
    GroupListComponent,
    GroupFormComponent,
    DashboardComponent,
    UserDetailComponent,
    CouponListComponent,
    CouponFormComponent,
    AccessListComponent,
    AccessFormComponent,
    GroupDetailComponent,
    DialogContentExportComponent,
    StudentListComponent,
    StudentFormComponent,
    CompanyListComponent,
    CompanyFormComponent,
    AccessDetailComponent,
    CouponDetailComponent,
    StudentDetailComponent,
    CompanyDetailComponent,
    ReportStudentComponent,
    AssessmentListComponent,
    AssessmentFormComponent,
    CompanyPostListComponent,
    CompanyPostFormComponent,
    CompanyAreaListComponent,
    CompanyAreaFormComponent,
    AssessmentDetailComponent,
    CompanyAreaDetailComponent,
    CompanyPostDetailComponent,
    CompanyBranchListComponent,
    CompanyBranchFormComponent,
    CompanyBranchDetailComponent,
    AssessmentGroupListComponent,
    AssessmentGroupFormComponent,
    ReportAssessmentNeuroComponent,
    NewNeuroComponent,
    AssessmentGroupDetailComponent,
    CompanyDepartmentListComponent,
    CompanyDepartmentFormComponent,
    AssessmentQuestionListComponent,
    AssessmentQuestionFormComponent,
    CompanyDepartmentDetailComponent,
    AssessmentQuestionDetailComponent,
    AssessmentInstructionListComponent,
    AssessmentInstructionFormComponent,
    AssessmentInstructionDetailComponent,
    ReportAssessmentStudentNeuroComponent,
    ReportAssessmentStudentNeuroCompleteComponent,
    ReportAssessmentStudentComparisonNeuroCompleteComponent,
    ReportAssessmentStudentProfileComponent,
    DialogContentExportReportComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    SharedModule,
    MatCardModule,
    MatIconModule,
    MatSortModule,
    MatListModule,
    MatTableModule,
    DragDropModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatRippleModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDividerModule,
    FlexLayoutModule,
    NgxDropzoneModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    QuillModule.forRoot(),
    NgxMaskModule.forRoot(),
    MatProgressSpinnerModule,
    MatCheckboxModule,
    LottieModule.forRoot({ player: playerFactory, useCache: true })
  ],
  providers: [
    RemoveHtmlPipe,
    NgxImageCompressService,
    { provide: MatPaginatorIntl, useValue: translateMatPaginator() }
  ]
})
export class LayoutModule { }
