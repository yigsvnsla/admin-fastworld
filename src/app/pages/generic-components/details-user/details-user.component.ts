import { ToolsService } from './../../../services/tools.service';
import { IonDatetime, IonModal, ModalController } from '@ionic/angular';
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { endOfMonth } from 'date-fns';
import { ViewChild } from '@angular/core';
import { ModalMembershipComponent } from '../modal-membership/modal-membersip.component';
import { ConectionsService } from 'src/app/services/connections.service';


@Component({
  selector: 'app-details-user',
  templateUrl: './details-user.component.html',
  styleUrls: ['./details-user.component.scss'],
})

export class DetailsuserComponent implements OnInit {

  @Input() public id: number



  constructor(
    private modalController: ModalController,
    private toolsService: ToolsService,
    private conectionService: ConectionsService
  ) {

  }
  ngOnInit(): void {
    console.log(this.id);
    this.fetch(this.id)
  }



  public async onExit() {
    (await this.modalController.getTop()).dismiss()
  }

  public async showAlertInputNameBusisness() {

    await this.toolsService.showAlert({
      cssClass: 'alert-success',
      keyboardClose: true,
      mode: 'ios',
      header: 'Membrecia',
      inputs: [{
        type: 'text',
        value: 'dasdasas',
        label: 'das',
      }],
      buttons: [{
        text: 'Cancelar'
      }, {
        text: 'Asignar',
        role: 'success',
        handler: (value) => {
          console.log(value);

        }
      }]
    })
  }

  public showModalMembership() {
    this.toolsService.showModal({
      cssClass: ['modal-membership'],
      component: ModalMembershipComponent,
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
    }).then(res => {
      this.updateMembreship(  {
        start: new Date().toISOString(),
        expire: new Date(Date.now() + 60000).toISOString(),
        type: 'junior'
      })
      /* if (res) {
        this.updateMembreship({
          start: new Date().toISOString(),
          end: new Date(Date.now() + 60000).toISOString(),
          type: 'junior'
        })
      } */
    })
  }


  async fetch(id) {
    const loading = await this.toolsService.showLoading('Buscando informacion...')
    try {
      const response = await this.conectionService.get(`user/basic/${id}?populate=*`).toPromise()
      console.log(response);
    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss()
    }
  }

  async updateMembreship(time) {
    const loading = await this.toolsService.showLoading('Actualizando informacion...')
    try {
      const response = await this.conectionService.post(`membreship`, {
        business: this.id,
        ...time
      }).toPromise()
      console.log(response);
    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss()
    }
  }

}
