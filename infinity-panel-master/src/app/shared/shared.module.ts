import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';

import { HighchartsChartModule } from 'highcharts-angular';

import { PieComponent } from './widgets/pie/pie.component';
import { AreaComponent } from './widgets/area/area.component';
import { CardComponent } from './widgets/card/card.component';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { InputFormModule } from './components/input-form/input-form.module';

@NgModule({
  declarations: [
    PieComponent,
    AreaComponent,
    CardComponent,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatDividerModule,
    MatExpansionModule,
    HighchartsChartModule
  ],
  exports: [
    PieComponent,
    AreaComponent,
    CardComponent,
    InputFormModule,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
  ]
})
export class SharedModule { }
