import { ConectionsService } from './../../../services/connections.service';
import { ToolsService } from './../../../services/tools.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InputCustomEvent, IonDatetime, IonicSlides, IonModal, IonSegment, ModalController, SegmentCustomEvent, TextareaCustomEvent } from '@ionic/angular'
import { addHours, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as lib from 'libphonenumber-js';

import SwiperCore, { Pagination, Swiper, SwiperOptions } from 'swiper'
import { ModalMapComponent } from '../modal-map/modal-map.component';
import { IonDatetimeCustomEvent } from '@ionic/core';
SwiperCore.use([IonicSlides])

@Component({
  selector: 'app-modal-crear-encomienda',
  templateUrl: './modal-crear-encomienda.component.html',
  styleUrls: ['./modal-crear-encomienda.component.scss']
})

export class ModalCrearEncomiendaComponent implements OnInit {
  @Input() userID: number
  @Input() _user: any

  @ViewChild('modal') modal: IonModal
  @ViewChild('dateTimePrograming ') dateTimePrograming: IonDatetime

  public productList$: BehaviorSubject<any[]>
  public encomiendaForm: FormGroup
  public receiverForm: FormGroup
  public categories: string[]
  public startListUbication: any[] = [];


  private get dateMinTimeOutPrograming(): string {
    let offset = new Date().getTimezoneOffset() * 60
    let date = new Date(Date.now() - offset * 1000)
    date = addHours(date, 2)
    return date.toISOString()
  }

  public setStartUbication(v: any) {
    this.encomiendaForm.get(['route', 'start']).setValue(v);
    console.log(this.encomiendaForm.get(['route', 'start']).value);

  }
  // private  setEndUbication(v: any) { this.encomiendaForm.get(['route', 'end']).setValue(v); }

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private toolsService: ToolsService,
    private conectionsService: ConectionsService
  ) {
    this.productList$ = new BehaviorSubject([])
    this.categories = ['Alimentos', 'Compras', 'Correspondencia', 'Fragil', 'Libros', 'Madera', 'Medicina', 'Mensajeria', 'Otros', 'Ropa', 'Tecnología',];
  }

  public ionViewWillEnter() { }

  public ngOnInit() {
    console.log(this._user);

    this.instanceForm()
  }

  public ionViewDidEnter() {
    this.instanceDateTimePrograming()
    this.instanceForm();
  }



  public setTimeOutProgramingChange($event: Event) { this.encomiendaForm.get('timeOut').setValue(($event as IonDatetimeCustomEvent<any>).detail.value) }

  public timeOutFormat(time: string | number) { return typeof time == 'number' ? `${time} Minutos` : format(parseISO(time), "EEEE MMMM d 'del' y - h:mm aaa", { locale: es }) }

  public _typeof(base: any, comparator: string) { return (typeof base == comparator) }

  public async onExit() { (await this.modalController.getTop()).dismiss() }

  public async popoverDidPresentUserUbication() {
    this.startListUbication = []
    const { direction } = this._user.business
    this.startListUbication.push(direction)
  }

  public timeOutSegmentChange($event: Event) { this.encomiendaForm.get('timeOut').setValue(null) }

  public setStartUbicationMessage($event: Event) { this.encomiendaForm.get(['route', 'start']).value.message = ($event as TextareaCustomEvent).detail.value }

  public setEndUbicationMessage($event: Event) { this.encomiendaForm.get(['route', 'end']).value.message = ($event as TextareaCustomEvent).detail.value }

  public async setProduct(destiny: string) {
    const send = async () => {
      const loading = await this.toolsService.showLoading('Actualizando informacion...')
      try {
        // const { id } = await this.localStorageService.get(environment.user_tag)
        const _package = [{ receiver: this.receiverForm != null ? { ...this.receiverForm.value } : null, ...this.encomiendaForm.value }]
        const response = await this.conectionsService.post(`packages/client`, { client: this.userID, packages: _package }).toPromise();
        if (response) {
          const _id = response.data[0].id
          if (destiny == 'ticket') {
            this.toolsService.showLoading()
              .then(async loading => {
                const { id } = await this.conectionsService.get<any>(`ticket/generate/${_id}`).toPromise()
                loading.dismiss();
                (await this.toolsService.showAlert({
                  backdropDismiss: false,
                  header: 'Enlace Generado 🌎',
                  subHeader: 'Comparta este elace a su cliente para validar los datos de entrega',
                  keyboardClose: true,
                  mode: 'ios',
                  cssClass: 'alert-primary',
                  inputs: [{
                    type: 'text',
                    value: 'https://cliente.fastworld.app/ticket/' + id,
                    name: 'url'
                  }],
                  buttons: [{
                    text: 'copiar',
                    role: 'success',
                    handler: async (data) => {
                      navigator.clipboard.writeText(data.url);
                      await this.toolsService.showToast({
                        message: 'Enlace copiado',
                        icon: 'copy',
                        mode: 'ios',
                        buttons: ['Aceptar']
                      })
                    }
                  }]
                }))
              })
          }
          (await this.modalController.getTop()).dismiss()
          this.instanceForm()
          // this.router.navigateByUrl('dashboard/encomienda/activas')
          console.log(response);
        }
      } catch (error) {
        console.error(error);
      } finally {
        loading.dismiss()
      }
    }

    await this.toolsService.showAlert({
      cssClass: 'alert-danger',
      keyboardClose: true,
      mode: 'ios',
      header: 'Crear Encomienda',
      subHeader: '¿Desea enviar esta encomienda?',
      buttons: ['Cancelar', {
        text: 'Aceptar', handler: () => {
          send()
        }
      }]
    })

  }

  public editItem(item) { }

  public deleteItem(item) { }

  // public async post() {
  //   console.log(this.userID)
  //     const send = async () => {
  //         const loading = await this.toolsService.showLoading('Actualizando informacion...')
  //         try {
  //             const response = await this.conectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
  //             if (response) {
  //                 await this.toolsService.showAlert({
  //                     cssClass: 'alert-success',
  //                     keyboardClose: true,
  //                     mode: 'ios',
  //                     header: 'Exito',
  //                     buttons: [{ text: 'Aceptar' }]
  //                 })
  //             }
  //         } catch (error) {
  //             console.error(error);
  //         } finally {
  //             loading.dismiss()
  //         }
  //     }

  //     await this.toolsService.showAlert({
  //         cssClass: 'alert-success',
  //         keyboardClose: true,
  //         mode: 'ios',
  //         header: 'Membrecia',
  //         buttons: ['Cancelar', { text: 'Aceptar', handler: () => send()}]
  //     })
  // }

  public onChangeSegmentLocation($event: Event) {
    const { detail } = $event as SegmentCustomEvent
    if (detail.value == 'mapa') this.setReceiver();
    if (detail.value == 'ticket') this.setTicket();
  }

  public async onOpenModalMapStart() {
    const modal = await this.toolsService
      .showModal({
        component: ModalMapComponent,
        backdropDismiss: false,
        keyboardClose: true,
        cssClass: 'modal-fullscreen'
      })
    if (modal) { this.encomiendaForm.get(['route', 'start']).setValue(modal) }
  }

  public async onOpenModalMapEnd() {
    const modal = await this.toolsService
      .showModal({
        component: ModalMapComponent,
        backdropDismiss: false,
        keyboardClose: true,
        cssClass: 'modal-fullscreen'
      })
    if (modal) {
      this.encomiendaForm.get(['route', 'end']).setValue(modal);
      // this.setEndUbication = modal

    }
  }

  public async setTimeOutToday() {
    const actionSheet = await this.toolsService.showActionSheet({
      mode: 'ios',
      header: 'Seleccionar',
      subHeader: 'Seleccione un tiempo estimado de retiro',
      backdropDismiss: false,
      keyboardClose: true,
      buttons: [
        {
          text: '30 - 60 minutos',
          icon: 'timer',
          data: 60,
          role: 'selected',
        },
        {
          text: '60 - 90 minutos',
          icon: 'timer',
          data: 90,
          role: 'selected'
        },
        {
          text: '90 - 120 minutos',
          icon: 'timer',
          data: 120,
          role: 'selected'
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close',
        }
      ]
    });
    const { data, role } = await actionSheet.onDidDismiss();
    if (role == 'selected') { this.encomiendaForm.get('timeOut').setValue(data); }
  }

  public ionChangesInputCurrency(_$event: Event) {
    const $event = (_$event as InputCustomEvent)
    let value = $event.detail.value;
    const decimal: string = ',';
    const thousand: string = '.';
    if (RegExp(/$/g).test($event.detail.value)) $event.detail.value.replace('$', '');
    if ($event.detail.value == '') this.encomiendaForm.get(['payment', 'value']).setValue(value = '0' + decimal + '00');
    value = value + '';
    value = value.replace(/[\D]+/g, '');
    value = value + '';
    value = value.replace(/([0-9]{2})$/g, decimal + '$1');
    var parts = value.toString().split(decimal);
    if (parts[0] == '') parts[0] = '0';
    parts[0] = parseInt(parts[0]).toString();
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
    value = parts.join(decimal);
    this.encomiendaForm.get(['payment', 'value']).setValue('$' + value)
  }

  private instanceDateTimePrograming() {
    this.dateTimePrograming.value = this.dateMinTimeOutPrograming
    this.dateTimePrograming.min = this.dateMinTimeOutPrograming
  }

  private setTicket() {
    this.encomiendaForm.removeControl('receiver');
    (this.encomiendaForm.get('route') as FormGroup).removeControl('end')
  }

  private setReceiver() {
    if (!this.encomiendaForm.value.hasOwnProperty('receiver')) {
      (this.encomiendaForm.get('route') as FormGroup)
        .addControl('end', this.formBuilder.control(null, { validators: [Validators.required] }));
      this.encomiendaForm
        .addControl('receiver', this.formBuilder.group({
          name: ['', [Validators.required]],
          phone: ['', [Validators.required,
          (phoneControl: AbstractControl<string>) => {
            if (phoneControl['value'] != '') {
              if (RegExp(/ /).test(phoneControl['value'])) phoneControl.patchValue(phoneControl['value'].replace(/ /, ''));
              if (RegExp(/^[0-9]{10}$/).test(phoneControl['value'])) phoneControl.setValue(lib.format(phoneControl['value'], 'EC', 'INTERNATIONAL').replace(/ /, ''));
              if (RegExp(/^[+]{1}[0-9]{12}$/).test(phoneControl['value']) && lib.isValidPhoneNumber(phoneControl['value'])) return null;
              return { notIsValidPhoneNumber: true };
            }
          }]]
        }));
      this.encomiendaForm.updateValueAndValidity()
    }
  }

  private setCalculateFee(result: google.maps.DirectionsResult) {
    if (!result.hasOwnProperty('routes')) return;
    const { distance } = result.routes[0].legs[0];
    let km = 1;
    if (distance.text.includes('km')) {
      km = Number(distance.text.replace(/km/, '').replace(/,/, '.').trim());
    }
    let multiplicador = Math.ceil(km / 5);
    let base = 2; //recordar crear algoritmo de sucursales
    let start = 0.50;

    if (multiplicador > 2 && multiplicador < 6) {
      multiplicador = 3
    } else if (multiplicador == 6) {
      multiplicador = 4
    } else if (multiplicador > 6) {
      multiplicador = 5
    }

    let tarifa = (multiplicador * start) + base;

    //if (tarifa > 3.5) tarifa = 3.5
    if (this._user?.business?.membreship != null) {
      tarifa = 2.5
    }
    (this.encomiendaForm.get(['route', 'distance']) as FormControl).setValue(km, { emitEvent: false });
    (this.encomiendaForm.get(['route', 'value']) as FormControl).setValue(tarifa, { emitEvent: false });
  }

  private instanceForm() {
    this.encomiendaForm = this.formBuilder.group({
      category: [null, [Validators.required]],
      timeOut: [null, [Validators.required]],
      route: this.formBuilder.group({
        start: [null, [Validators.required]],
        end: [null, [Validators.required]],
        distance: [null],
        value: [null]
      }),
      payment: this.formBuilder.group({
        value: ['$0.00', []]
      }),
      receiver: this.formBuilder.group({
        name: ['', [Validators.required]],
        phone: ['', [Validators.required,
        (phoneControl: AbstractControl<string>) => {
          if (phoneControl['value'] != '') {
            if (RegExp(/ /).test(phoneControl['value'])) phoneControl.patchValue(phoneControl['value'].replace(/ /, ''));
            if (RegExp(/^[0-9]{10}$/).test(phoneControl['value'])) phoneControl.setValue(lib.format(phoneControl['value'], 'EC', 'INTERNATIONAL').replace(/ /, ''));
            if (RegExp(/^[+]{1}[0-9]{12}$/).test(phoneControl['value']) && lib.isValidPhoneNumber(phoneControl['value'])) return null;
            return { notIsValidPhoneNumber: true };
          }
        }]]
      }),
    });

    this.encomiendaForm
      .get('route')
      .valueChanges
      .subscribe(value => {
        if (value.start != null && value.end != null) {
          const { start, end } = value
          this.conectionsService
            .mapDirections({
              origin: start.position,
              destination: end.position,
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
            })
            .subscribe(res => {
              this.setCalculateFee(res);
            })
        }
      })
  }

  public async openModal() {
    this.modal.present()
  }

}
