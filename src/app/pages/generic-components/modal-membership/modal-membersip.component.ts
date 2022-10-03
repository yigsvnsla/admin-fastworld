import { ModalController, IonDatetime } from '@ionic/angular';
import { ToolsService } from './../../../services/tools.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { addMonths, endOfMonth } from 'date-fns';

@Component({
    selector: 'app-modal-membership',
    templateUrl: './modal-membersip.component.html',
    styleUrls:['./modal-membersip.component.scss']
})

export class ModalMembershipComponent implements OnInit {


    @ViewChild('dateTimeStart') dateTimeStart : IonDatetime
    @ViewChild('dateTimeEnd') dateTimeEnd : IonDatetime

    private get dateNow() : string {
        return new Date(Date.now()).toISOString()
    }

    private get dateEndOfMonth() : string {
        return endOfMonth(new Date(Date.now())).toISOString()
    }

    private get nextDateMonth() : string{
        return addMonths(new Date(Date.now()),1).toISOString()
    }

    constructor(
        private toolsService:ToolsService,
        private modalController:ModalController
    ) { }

    ngOnInit() { }

    ionViewWillEnter() {
        this.dateTimeStart.value = this.dateNow
        this.dateTimeStart.min = this.dateNow;
        this.dateTimeStart.max = this.dateEndOfMonth;

        this.dateTimeEnd.value = this.nextDateMonth
        this.dateTimeEnd.min = this.nextDateMonth;
    }

    // public ionViewDidEnter() { console.log(this.dateTimeStart) }

    public async onExit(data?:any) { (await this.modalController.getTop()).dismiss(data) }

    public async showAlertMembership() {
        const toCheckConfirmButtonState = ()=>{
            document.querySelector('ion-alert div.alert-button-group button:nth-of-type(2)').removeAttribute('disabled');
        };
        await this.toolsService.showAlert({
            cssClass:'alert-success',
            keyboardClose: true,
            mode: 'ios',
            header: 'Membrecia',
            inputs: [{
                label: 'Ninguna',
                type: 'radio',
                value: null,
                handler:()=>{
                    toCheckConfirmButtonState()
                }
            },
            {
                label: 'Junior',
                type: 'radio',
                value: 'junior',
                handler:()=>{
                    toCheckConfirmButtonState()
                }
            },
            {
                label: 'Silver',
                type: 'radio',
                value: 'silver',
                handler:()=>{
                    toCheckConfirmButtonState()
                }
            },
            {
                label: 'Gold',
                type: 'radio',
                value: 'gold',
                handler:()=>{
                    toCheckConfirmButtonState()
                }
            }],
            buttons:[{
                text:'Cancelar'
            },{
                text:'Asignar',
                role:'success',
                handler:(value)=>{
                    console.log(value);

                }
            }]
        })
        document.querySelector('ion-alert div.alert-button-group button:nth-of-type(2)').setAttribute('disabled', 'true');
    }
}
