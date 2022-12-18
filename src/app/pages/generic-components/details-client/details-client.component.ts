import { ModalUserHistorial } from './../modal-user-historial/modal-user-historial.component';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { delay } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
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

  constructor(
    private modalController: ModalController,
    private toolsService: ToolsService,
    private conectionService: ConectionsService,
    private formBuilder: FormBuilder
  ) {

  }

  public async ionViewWillEnter() {
    this.user = await this.conectionService.get(`user/basic/${this.id}?populate=*`).pipe(delay(500)).toPromise()
    this.instanceForm(this.user)
    this.user$ = new BehaviorSubject<(any | undefined)>(this.user);
    // console.log(this.user);
  }

  ngOnInit(): void {


  }

  private instanceForm(data: any) {
    console.log(data);

    this.formBasic = this.formBuilder.nonNullable.group({
      type: [null, []],
      identification: [data.identification, [
        Validators.required,
        Validators.nullValidator,
        Validators.pattern(/(^\d{9}$|^\d{13}$)/),
        (codeControl: AbstractControl<number>) => {
          if (codeControl.value != null) {
            let val: string = codeControl.value.toString()
            if (val != '') {
              // if ( val.length == 9 ) this.formBasic.get('documents').get('type').setValue('dni');
              // if ( val.length == 13 ) this.formBasic.get('documents').get('type').setValue('ruc');
              if (!(RegExp(/(^\d{9}$|^\d{13}$)/).test(val))) this.formBasic.get('documents').get('type').reset();
              return null
            }
          }
        }
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
        mail: [data.user?.email, [
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
      header: 'Membrecia',
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
      header: 'Membrecia',
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
              const response = await this.conectionService.put(`businesses/${this.user.business.id}`, businessName).toPromise()
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
            header: 'Membrecia',
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
      if (value) {
        this.user.business.membreship = value
        this.user$.next(this.user)
      }
    })
  }

  public async showCreateEncomienda(){
    await this.toolsService.showModal({
      component:ModalCrearEncomiendaComponent,
      cssClass:['modal-fullscreen'],
      keyboardClose:true,
      mode:'ios',
      backdropDismiss:false,
      componentProps:{
        userID:this.user.id,
        _user : this.user
      }
    })
  }

  public async onShowHistory(){
    this.toolsService.showModal({
      component:ModalUserHistorial,
      cssClass:['modal-fullscreen'],
      keyboardClose:true,
      mode:'ios',
      backdropDismiss:false,
      componentProps:{
        id:this.id,
        prefix:'client'
      }
    })
  }
}
