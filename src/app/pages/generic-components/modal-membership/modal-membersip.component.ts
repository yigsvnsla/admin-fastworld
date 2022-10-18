import { ConectionsService } from '../../../services/connections.service';
import { ModalController, IonDatetime, SelectCustomEvent, IonSelect, AlertOptions } from '@ionic/angular';
import { ToolsService } from '../../../services/tools.service';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { addMonths, endOfMonth, parseISO, subDays } from 'date-fns';
import { Input } from '@angular/core';
import { DatetimeCustomEvent,} from '@ionic/core';

@Component({
    selector: 'app-modal-membership',
    templateUrl: './modal-membersip.component.html',
    styleUrls: ['./modal-membersip.component.scss']
})

export class ModalMembershipComponent implements OnInit {

    @Input() public membership: any
    @Input() private idBasic: number
    @ViewChild('selectDate') selectDate: IonSelect
    @ViewChild('dateTimeStart') dateTimeStart: IonDatetime
    @ViewChild('dateTimeEnd') dateTimeEnd: IonDatetime

    private get dateNow(): string {
        return new Date(Date.now()).toISOString()
    }

    private get dateEndOfMonth(): string {
        return subDays(endOfMonth(new Date(Date.now())), 1).toISOString()
    }

    private get nextDateMonth(): string {
        return subDays(addMonths(new Date(), 1), 1).toISOString()
    }

    public tempMembership: any

    constructor(
        private toolsService: ToolsService,
        private modalController: ModalController,
        private conectionsService: ConectionsService
    ) { }

    ngOnInit() {
        this.tempMembership = { ...this.membership }
    }

    public dateTimeStartChange(e: Event) {
        const value = (e as DatetimeCustomEvent).detail.value;
        this.tempMembership.start = value;
    }

    public dateTimeEndChange(e: Event) {
        const value = (e as DatetimeCustomEvent).detail.value;
        this.tempMembership.expire = value;
    }

    public selectDateChange(e: Event) {

        const value = (e as SelectCustomEvent).detail.value

        if (value == 0) {
            this.dateTimeStart.value = this.tempMembership ? this.tempMembership.start : this.dateNow;
            this.dateTimeStart.max = this.dateEndOfMonth;
            this.dateTimeStart.min = this.tempMembership ? this.tempMembership.start : this.dateNow;
            this.dateTimeEnd.value = this.tempMembership ? this.tempMembership.expire : this.nextDateMonth
            this.dateTimeEnd.min = this.tempMembership ? this.tempMembership.expire : this.nextDateMonth;
        }

        if (value != 0) {
            this.tempMembership.start = this.membership ? this.membership.start : new Date(Date.now()).toISOString();
            this.tempMembership.expire = addMonths(parseISO(this.membership ? this.membership.expire : new Date(Date.now()).toISOString()), value).toISOString()
        }
    }

    public async updateMemberShip() {
        const send = async () => {
            const loading = await this.toolsService.showLoading('Actualizando informacion...')
            try {
                const { start, expire, type } = this.tempMembership;
                const response = await this.conectionsService.post(`membreship`, { basic: this.idBasic, start, expire, type }).toPromise()
                if (response) { this.onExit({ id: response.data.id, ...response.data.attributes }) }
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

    public async onExit(data?: any) {
        (await this.modalController.getTop()).dismiss(data)
    }

    public async showAlertMembership() {
        const toCheckConfirmButtonState = () => {
            document.querySelector('ion-alert div.alert-button-group button:nth-of-type(2)').removeAttribute('disabled');
        };

        const alertConfig: AlertOptions = {
            cssClass: 'alert-success',
            keyboardClose: true,
            mode: 'ios',
            header: 'Membrecia',
            inputs: [
                {
                    label: 'Junior',
                    type: 'radio',
                    value: 'junior',

                    handler: () => {
                        toCheckConfirmButtonState()
                    }
                },
                {
                    label: 'Silver',
                    type: 'radio',
                    value: 'silver',
                    handler: () => {
                        toCheckConfirmButtonState()
                    }
                },
                {
                    label: 'Gold',
                    type: 'radio',
                    value: 'gold',
                    handler: () => {
                        toCheckConfirmButtonState()
                    }
                }],
            buttons: [{
                text: 'Cancelar'
            }, {
                text: 'Asignar',
                role: 'success',
                handler: (value) => {
                    this.tempMembership.type = value
                }
            }]
        }

        for (const input of alertConfig.inputs) {
            if (input.value == this.tempMembership.type) {
                input.checked = true
            }
        }

        await this.toolsService.showAlert(alertConfig)
        document.querySelector('ion-alert div.alert-button-group button:nth-of-type(2)').setAttribute('disabled', 'true');
    }
}
