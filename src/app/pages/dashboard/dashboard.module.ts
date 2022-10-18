import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ModalMembershipComponent } from '../generic-components/modal-membership/modal-membersip.component';
import { DetailsPackageComponent } from './../generic-components/details-package/details-package.component';
import { ConductoresComponents } from './components/usuarios/conductores/conductores.component';
import { ClientesComponents } from './components/usuarios/clientes/clientes.component';
import { HistorialComponent } from './components/encomiendas/historial/historial.component';
import { ActivasComponent } from './components/encomiendas/activas/activas.component';
import { BtnMenuComponent } from './../generic-components/btn-menu/btn-menu.component';
import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from 'swiper/angular';
import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PopOverMenuComponent } from '../generic-components/popover-menu/popover-menu.component';
import { CrearUsuarioComponent } from './components/usuarios/crear-usuario/crear-usuario.component';
import { MenuFilterComponent } from '../generic-components/menu-filter/menu-filter.component';
import { DetailsClientComponent } from '../generic-components/details-client/details-client.component';
import { ModalCrearEncomiendaComponent } from '../generic-components/modal-crear-encomienda/modal-crear-encomienda.component';
import { ModalMapComponent } from '../generic-components/modal-map/modal-map.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { ModalTransferPackageComponent } from '../generic-components/modal-transfer-package/modal-transfer-package.component';
import { DetailsDriverComponent } from '../generic-components/details-driver/details-driver.component';
import { SeguimientoComponent } from './components/encomiendas/seguimiento/seguimiento.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    SwiperModule,
    ScrollingModule,
    HttpClientModule,
    GoogleMapsModule,
    HttpClientJsonpModule,
  ],
  declarations: [
    DashboardPage,
    HomeComponent,
    BtnMenuComponent,
    ActivasComponent,
    HistorialComponent,
    PopOverMenuComponent,
    CrearUsuarioComponent,
    ClientesComponents,
    ConductoresComponents,
    DetailsPackageComponent,
    MenuFilterComponent,
    DetailsClientComponent,
    DetailsDriverComponent,
    ModalMembershipComponent,
    ModalCrearEncomiendaComponent,
    ModalMapComponent,
    ModalTransferPackageComponent,
    SeguimientoComponent
  ]
})
export class DashboardPageModule {}
