import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinanzasPageRoutingModule } from './finanzas-routing.module';

import { FinanzasPage } from './finanzas.page';
import { DatatableComponent } from './components/datatable/datatable.component';
import { ViewerComponent } from './components/viewer/viewer.component';
import { ResumeComponent } from './components/resume/resume.component';
import { PrompUserComponent } from './components/promp-user/promp-user.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RegisterComponent } from './components/register/register.component';
import { GenericSearchComponent } from './components/generic-search/generic-search.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinanzasPageRoutingModule,
    ScrollingModule,
    NgxDatatableModule,
    ReactiveFormsModule
  ],
  declarations: [
    FinanzasPage,
    DatatableComponent,
    ViewerComponent,
    ResumeComponent,
    PrompUserComponent,
    RegisterComponent,
    GenericSearchComponent],
    exports:[
      GenericSearchComponent
    ]
})
export class FinanzasPageModule { }
