import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrMaskerModule } from 'br-mask';
import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    BrMaskerModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ProfilePage }])
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
