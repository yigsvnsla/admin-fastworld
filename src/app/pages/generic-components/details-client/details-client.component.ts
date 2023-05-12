import { ModalUserHistorial } from './../modal-user-historial/modal-user-historial.component';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { delay, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { ToolsService } from '../../../services/tools.service';
import { IonDatetime, IonModal, ModalController } from '@ionic/angular';
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { endOfMonth } from 'date-fns';
import { ViewChild } from '@angular/core';

import { ConectionsService } from 'src/app/services/connections.service';
import { format, isValidPhoneNumber } from 'libphonenumber-js';
import { ModalMembershipComponent } from '../modal-membership/modal-membersip.component';
import { ModalCrearEncomiendaComponent } from '../modal-crear-encomienda/modal-crear-encomienda.component';
import { ModalStepsClientComponent } from '../modal-steps-client/modal-steps-client.component';
import { ModalMapComponent } from '../modal-map/modal-map.component';

@Component({
  selector: 'app-details-user',
  templateUrl: './details-client.component.html',
  styleUrls: ['./details-client.component.scss'],
})

export class DetailsClientComponent implements OnInit {

  @Input() public id: number

  public user$: BehaviorSubject<any>
  public user: any
  public formBasic: FormGroup
  public editingLogo: boolean = false
  private updateFileLogo = null
  public balance;

  constructor(
    private modalController: ModalController,
    private toolsService: ToolsService,
    private conectionService: ConectionsService,
    private formBuilder: FormBuilder
  ) {

  }

  public async ionViewWillEnter() {
    try {
      this.user = await this.conectionService.get(`user/basic/${this.id}?populate=*`).pipe(delay(500)).toPromise()
    } catch (error) {
      this.modalController.dismiss()
    }
    this.instanceForm(this.user)
    this.user$ = new BehaviorSubject<(any | undefined)>(this.user);
    console.log(this.user);
  }

  public async lodad() {
    try {
      this.user = await this.conectionService.get(`user/basic/${this.id}?populate=*`).pipe(delay(500)).toPromise()
    } catch (error) {
      this.modalController.dismiss()
    }
    this.instanceForm(this.user)
    this.user$ = new BehaviorSubject<(any | undefined)>(this.user);
    console.log(this.user);
  }

  ngOnInit(): void {


  }

  public async openMap() {
    const user = this.user$.value;

    const ubication = await this.toolsService.showModal({
      component: ModalMapComponent,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        id: user.id,
        user
      }
    });
    let response = await this.conectionService.put(`businesses/${this.user?.business?.id}?populate=*`, {
      data: {
        direction: ubication
      }
    }).toPromise()

  }


  private instanceForm(data: any) {
    console.log(data);
    this.fetchBalance()
    this.formBasic = this.formBuilder.nonNullable.group({
      type: [null, []],
      identification: [data.identification, [
        Validators.required,
        // Validators.nullValidator,
        Validators.pattern(/(^\d{9}$|^\d{13}$)/),
        // (codeControl: AbstractControl<number>) => {
        //   if (codeControl.value != null) {
        //     let val: string = codeControl.value.toString()
        //     if (val != '') {
        //       // if ( val.length == 9 ) this.formBasic.get('documents').get('type').setValue('dni');
        //       // if ( val.length == 13 ) this.formBasic.get('documents').get('type').setValue('ruc');
        //       // if (!(RegExp(/(^\d{9}$|^\d{13}$)/).test(val))) this.formBasic.get('documents').get('type').reset();
        //       return null
        //     }
        //   }
        // }
      ]],
      name: [data.name, [Validators.required, Validators.nullValidator]],
      lastname: [data.lastname, [Validators.required, Validators.nullValidator]],
      phone: [data.phone, [
        Validators.required,
        Validators.nullValidator,
        (phoneControl: AbstractControl<string>) => {
          if (phoneControl['value'] != '') {
            if (RegExp(/ /).test(phoneControl['value'])) phoneControl.patchValue(phoneControl['value'].replace(/ /, ''));
            if (RegExp(/^[0-9]{10}$/).test(phoneControl['value'])) phoneControl.setValue(format(phoneControl['value'], 'EC', 'INTERNATIONAL').replace(/ /, ''));
            if (RegExp(/^[+]{1}[0-9]{12}$/).test(phoneControl['value']) && isValidPhoneNumber(phoneControl['value'])) return null;
            return { notIsValidPhoneNumber: true };
          }
        }
      ]],
      user: this.formBuilder.nonNullable.group({
        password: [null, [Validators.required, Validators.nullValidator]],
        mail: [data.mail, [
          Validators.required,
          Validators.nullValidator,
          Validators.email,
          Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
        ]],
      })

    })

    this.formBasic.disable()
  }

  public async onExit() {
    (await this.modalController.getTop()).dismiss()
  }

  public imgHandler(event: Event, elementViewPort?: HTMLImageElement) {
    // pasamos a una constante el arr de archivo
    const files = (event.target['files'] as File[])
    // si el evento tiene un archivo y si esta en el indice
    if (files && files.length) {
      this.updateFileLogo = { name: event.target['id'], file: files[0] }
      if (elementViewPort) {
        //  creamos una instancia de un FileReader
        var fr = new FileReader();
        fr.onload = () => {
          elementViewPort.src = `${fr.result.toString()}`
        }
        fr.readAsDataURL(files[0]);
      }
    }
  }


  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async onEditHome() {
    const send = async (value) => {
      const loading = await this.toolsService.showLoading('Actualizando informacion...');
      try {
        const response = await this.conectionService.put(`businesses/${this.user?.business?.id}`, { data: { home: value } }).toPromise();
        this.user.business.home = response.data.attributes.home;
        console.log(response);
      } catch (error) {
        console.error(error);
      } finally {
        loading.dismiss();
      }
    };
    await this.toolsService.showAlert({
      cssClass: 'alert-success',
      keyboardClose: true,
      mode: 'ios',
      header: 'Confirmar edición',
      inputs: [
        {
          label: 'Direccion/manzana/villa',
          type: 'text',
          id: 'home',
          name: 'home',
          value: this.user?.business?.home
        }
      ],
      buttons: ['Cancelar', { text: 'Aceptar', handler: (x) => send(x.home) }]
    });

  }

  public async showAlertConfirmUpdateBasic() {
    const send = async () => {
      const loading = await this.toolsService.showLoading('Actualizando informacion...')
      try {
        console.log(this.formBasic.value)
        const response = await this.conectionService.put(`basics/${this.id}`, this.formBasic.value).toPromise()
        console.log(response)
      } catch (error) {
        console.error(error);
      } finally {
        loading.dismiss()
      }
    }
    await this.toolsService.showAlert({
      cssClass: 'alert-success',
      keyboardClose: true,
      mode: 'ios',
      header: 'Confirmar edición',
      buttons: ['Cancelar', { text: 'Aceptar', handler: () => send() }]
    })

  }

  public async showAlertConfirmUpdateLogo() {
    const send = async () => {
      const loading = await this.toolsService.showLoading('Actualizando informacion...')
      try {
        let form = new FormData();
        form.append('data', JSON.stringify({ logo: null }));
        form.append('files.logo', this.updateFileLogo.file, this.updateFileLogo.file.name);
        const response = await this.conectionService.put(`businesses/${this.user.business.id}`, form).toPromise()
        if (response) {
          this.editingLogo = false
        }
      } catch (error) {
        console.error(error);
      } finally {
        loading.dismiss()
      }
    }

    await this.toolsService.showAlert({
      cssClass: 'alert-success',
      keyboardClose: true,
      mode: 'ios',
      header: 'Membrecia',
      buttons: ['Cancelar', { text: 'Aceptar', handler: () => send() }]
    })
  }

  public async showAlertInputNameBusisness() {
    await this.toolsService.showAlert({
      cssClass: 'alert-success',
      keyboardClose: true,
      mode: 'ios',
      header: 'Asignar Nombre',
      inputs: [{
        type: 'text',
        value: this.user.business.name,
        name: 'name'
      }],
      buttons: [{
        text: 'Cancelar'
      }, {
        text: 'Confirmar',
        role: 'success',
        handler: async ({ name }) => {
          const send = async () => {
            const loading = await this.toolsService.showLoading('Actualizando informacion...')
            try {
              const businessName = { name: name }
              const response = await this.conectionService.put(`businesses/${this.user.business.id}`, { data: businessName }).toPromise()
              if (response) {
                this.user.business.name = name
              }
            } catch (error) {
              console.error(error);
            } finally {
              loading.dismiss()
            }
          }
          await this.toolsService.showAlert({
            cssClass: 'alert-success',
            keyboardClose: true,
            mode: 'ios',
            header: 'Confirmacion',
            buttons: ['Cancelar', { text: 'Aceptar', handler: () => send() }]
          })
        }
      }]
    })
  }

  public showModalMembership() {
    this.toolsService.showModal({
      cssClass: ['modal-fit-content'],
      component: ModalMembershipComponent,
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        membership: this.user.business.membreship,
        idBasic: this.id
      }
    }).then(value => {
      console.log(value);
      if (value == null) this.user.business.membreship = value;

      if (value != undefined) {
        this.user.business.membreship = value
      }
      this.user$.next(this.user)
    })
  }

  public async showCreateEncomienda() {
    await this.toolsService.showModal({
      component: ModalCrearEncomiendaComponent,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        userID: this.user.id,
        _user: this.user
      }
    })
  }

  public async onShowHistory() {
    this.toolsService.showModal({
      component: ModalUserHistorial,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        id: this.id,
        prefix: 'client'
      }
    })
  }

  async fetchBalance() {
    try {
      /* let response = await this.conectionService.get<any>(`user/basic/${this.id}?populate=*`).toPromise()
      console.log(response) */
      this.balance = this.user.balance
    } catch (error) {
      console.log(error)
    }
  }
}
