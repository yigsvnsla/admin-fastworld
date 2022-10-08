import { ConectionsService } from './../../../services/connections.service';
import { ToolsService } from './../../../services/tools.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InputCustomEvent, IonDatetime, IonicSlides, IonSegment, ModalController, SegmentCustomEvent, TextareaCustomEvent } from '@ionic/angular'
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
    @ViewChild('dateTimePrograming ') dateTimePrograming: IonDatetime
    @ViewChild('segmentSelectPage') segmentSelectPage: IonSegment
    private swiper: Swiper;
    public swiperConfig: SwiperOptions;
    public productList$: BehaviorSubject<any[]>
    public encomiendaForm: FormGroup
    public receiverForm: FormGroup
    public categories: string[]

    public get getSwiper(): Swiper { return this.swiper }
    public set setSwiper(v: Swiper) { this.swiper = v }

    private get dateMinTimeOutPrograming(): string {
        let offset = new Date().getTimezoneOffset() * 60
        let date = new Date(Date.now() - offset * 1000)
        date = addHours(date, 2)
        return date.toISOString()
    }

    private set setStartUbication(v: any) { this.encomiendaForm.get(['route', 'start']).setValue(v); }
    private set setEndUbication(v: any) { this.encomiendaForm.get(['route', 'end']).setValue(v); }

    constructor(
        private modalController: ModalController,
        private formBuilder: FormBuilder,
        private toolsService: ToolsService,
        private conectionsService: ConectionsService
    ) {
        this.productList$ = new BehaviorSubject([])
        this.categories = ['Alimentos', 'Compras', 'Correspondencia', 'Fragil', 'Libros', 'Madera', 'Medicina', 'Mensajeria', 'Otros', 'Ropa', 'Tecnología',];
        this.swiperConfig = {
            followFinger: false,
            on: {
                activeIndexChange: (swiper) => {
                    if (swiper.realIndex == 0) this.segmentSelectPage.value = 'lista';
                    if (swiper.realIndex == 1) this.segmentSelectPage.value = 'agregar';
                }
            }
        }
    }

    public ionViewWillEnter() { }

    public ngOnInit() { this.instanceForm() }

    public ionViewDidEnter() {
        this.getSwiper.slidePrev()
        this.instanceDateTimePrograming()
        this.instanceForm();
        this.swiper.activeIndex
    }

    public setTimeOutProgramingChange($event: Event) { this.encomiendaForm.get('timeOut').setValue(($event as IonDatetimeCustomEvent<any>).detail.value) }

    public timeOutFormat(time: string | number) { return typeof time == 'number' ? `${time} Minutos` : format(parseISO(time), "EEEE MMMM d 'del' y - h:mm aaa", { locale: es }) }

    public _typeof(base: any, comparator: string) { return (typeof base == comparator) }

    public async onExit() { (await this.modalController.getTop()).dismiss() }

    public setSwiperInstance($swiper: Swiper) { this.setSwiper = $swiper }

    public timeOutSegmentChange($event: Event) { this.encomiendaForm.get('timeOut').setValue(null) }

    public setStartUbicationMessage($event: Event) { this.encomiendaForm.get(['route', 'start']).value.message = ($event as TextareaCustomEvent).detail.value }

    public setEndUbicationMessage($event: Event) { this.encomiendaForm.get(['route', 'end']).value.message = ($event as TextareaCustomEvent).detail.value }

    public async setProduct() {
        const list = this.productList$.value
        list.push({ receiver: this.receiverForm != null ? { ...this.receiverForm.value } : null, ...this.encomiendaForm.value })
        this.productList$.next(list)
        this.getSwiper.slidePrev()
        this.instanceForm()
    }


    public editItem(item) { }

    public deleteItem(item) { }

    public async post() {
      console.log(this.userID)
        const send = async () => {
            const loading = await this.toolsService.showLoading('Actualizando informacion...')
            try {
                const response = await this.conectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
                if (response) {
                    await this.toolsService.showAlert({
                        cssClass: 'alert-success',
                        keyboardClose: true,
                        mode: 'ios',
                        header: 'Exito',
                        buttons: [{ text: 'Aceptar' }]
                    })
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
            buttons: ['Cancelar', { text: 'Aceptar', handler: () => {send()} }]
        })
    }

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
        if (modal) { this.setStartUbication = modal }
    }

    public async onOpenModalMapEnd() {
        const modal = await this.toolsService
            .showModal({
                component: ModalMapComponent,
                backdropDismiss: false,
                keyboardClose: true,
                cssClass: 'modal-fullscreen'
            })
        if (modal) { this.setEndUbication = modal }
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
                    text: '30 minutos',
                    icon: 'timer',
                    data: 30,
                    role: 'selected',
                },
                {
                    text: '45 minutos',
                    icon: 'timer',
                    data: 45,
                    role: 'selected'
                },
                {
                    text: '60 minutos',
                    icon: 'timer',
                    data: 60,
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
        let km = Number(distance.text.replace(/km/, '').replace(/,/, '.').trim());
        let multiplicador = Math.ceil(km / 6);
        let base = 2; //recordar crear algoritmo de sucursales
        let start = 0.50;
        let tarifa = (multiplicador * start) + base;
        (this.encomiendaForm.get(['route', 'distance']) as FormControl).setValue(km, { emitEvent: false });
        (this.encomiendaForm.get(['route', 'value']) as FormControl).setValue(tarifa, { emitEvent: false });
    }

    private instanceForm() {
        this.encomiendaForm = this.formBuilder.group({
            category: [null, [Validators.required]],
            timeOut: [30, [Validators.required]],
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

}
