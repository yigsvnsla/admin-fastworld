import { EncargadosComponent } from './components/usuarios/encargados/encargados.component';
import { ConductoresComponents } from './components/usuarios/conductores/conductores.component';
import { ClientesComponents } from './components/usuarios/clientes/clientes.component';
import { ActivasComponent } from './components/encomiendas/activas/activas.component';
import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { HistorialComponent } from './components/encomiendas/historial/historial.component';
import { CrearUsuarioComponent } from './components/usuarios/crear-usuario/crear-usuario.component';
import { SeguimientoComponent } from './components/encomiendas/seguimiento/seguimiento.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children:[
      {
        path:'',
        pathMatch:'full',
        redirectTo:'encomiendas/activas'
      },
      {
        path:'home',
        component:HomeComponent
      },
      {
        path:'encomiendas',
        children:[
          {
            path:'activas',
            component:ActivasComponent
          },
          {
            path:'historial',
            component:HistorialComponent
          },
          {
            path:'seguimiento',
            component:SeguimientoComponent
          }
        ]
      },
      {
        path:'usuarios',
        children:[
          {
            path:'crear',
            component:CrearUsuarioComponent
          },
          {
            path:'crear/:type',
            component:CrearUsuarioComponent
          },
          {
            path:'clientes',
            component:ClientesComponents
          },
          {
            path:'conductores',
            component:ConductoresComponents
          },
          {
            path:'encargados',
            component:EncargadosComponent
          }

        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
