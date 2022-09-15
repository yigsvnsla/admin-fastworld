import { HistorialComponent } from './components/encomiendas/historial/historial.component';
import { ActivasComponent } from './components/encomiendas/activas/activas.component';
import { BtnMenuComponent } from './../generic-components/btn-menu/btn-menu.component';
import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CrearComponent } from './components/encomiendas/crear/crear.component';
import { PopOverMenuComponent } from '../generic-components/popover-menu/popover-menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    NgxDatatableModule,
  ],
  declarations: [
    DashboardPage,
    HomeComponent,
    BtnMenuComponent,
    ActivasComponent,
    HistorialComponent,
    CrearComponent,
    PopOverMenuComponent 
  ]
})
export class DashboardPageModule {}
