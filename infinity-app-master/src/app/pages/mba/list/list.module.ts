import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MBAListPage } from './list.page';

@NgModule({
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    RouterModule.forChild([{ path: '', component: MBAListPage }])
  ],
  declarations: [MBAListPage]
})
export class MBAListPageModule {}
