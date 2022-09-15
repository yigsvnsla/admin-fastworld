import { ActivasComponent } from './components/encomiendas/activas/activas.component';
import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { HistorialComponent } from './components/encomiendas/historial/historial.component';
import { CrearComponent } from './components/encomiendas/crear/crear.component';

const routes: Routes = [

  {
    path: '',
    component: DashboardPage,
    children:[
      {
        path:'',
        pathMatch:'full',
        redirectTo:'home'
      },
      {
        path:'home',
        component:HomeComponent
      },{
        path:'encomiendas',
        children:[
          {
            path:'crear',
            component:CrearComponent
          },
          {
            path:'activas',
            component:ActivasComponent
          },{
            path:'historial',
            component:HistorialComponent
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
