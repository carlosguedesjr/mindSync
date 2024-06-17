import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// FLEX
import { FlexLayoutModule } from '@angular/flex-layout';

// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Error404Component } from './404.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: Error404Component }]),
  ],
  declarations: [Error404Component],
})
export class Error404Module {}
