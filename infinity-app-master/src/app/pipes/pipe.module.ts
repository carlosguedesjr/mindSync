import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { SafePipe } from './safe.pipe';
import { RandomPipe } from './random.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
  ],
  declarations: [RandomPipe, SafePipe],
  exports: [RandomPipe, SafePipe]
})
export class PipeModule {}
