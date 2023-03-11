import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinanzasPage } from './finanzas.page';

const routes: Routes = [
  {
    path: '',
    component: FinanzasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanzasPageRoutingModule {}
