import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgCircleProgressModule } from 'ng-circle-progress';

import { AssessmentFormPage } from './form.page';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { RandomPipe } from 'src/app/pipes/random.pipe';

@NgModule({
  imports: [
    PipeModule,
    IonicModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      space: -8,
      responsive: true,
      showUnits: false,
      titleFontSize: '40',
      innerStrokeWidth: 8,
      subtitleFontSize: '20',
      outerStrokeGradient: true,
      titleColor: 'var(--ion-text-color)',
      subtitleColor: 'var(--ion-text-color)',
      outerStrokeColor: 'var(--ion-color-primary-shade)',
      innerStrokeColor: 'rgba(var(--ion-color-primary-rgb), .2)',
      outerStrokeGradientStopColor: 'var(--ion-color-primary-tint)'
    }),
    RouterModule.forChild([{ path: '', component: AssessmentFormPage }])
  ],
  declarations: [AssessmentFormPage],
  providers: [RandomPipe]
})
export class AssessmentFormPageModule {}
