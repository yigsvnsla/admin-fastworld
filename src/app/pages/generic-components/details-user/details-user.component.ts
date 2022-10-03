import { ToolsService } from './../../../services/tools.service';
import { IonDatetime, IonModal, ModalController } from '@ionic/angular';
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { endOfMonth } from 'date-fns';
import { ViewChild } from '@angular/core';
import { ModalMembershipComponent } from '../modal-membership/modal-membersip.component';


@Component({
    selector: 'app-details-user',
    templateUrl: './details-user.component.html',
    styleUrls: ['./details-user.component.scss'],
})

export class DetailsuserComponent implements OnInit {

    @Input() public id: number
    
    

    constructor(
        private modalController: ModalController,
        private toolsService: ToolsService
    ) {

    }
    ngOnInit(): void {
        console.log(this.id);

    }



    public async onExit() {
        (await this.modalController.getTop()).dismiss()
    }

    public async showAlertInputNameBusisness(){

        await this.toolsService.showAlert({
            cssClass:'alert-success',
            keyboardClose: true,
            mode: 'ios',
            header: 'Membrecia',
            inputs: [{
                type: 'text',
                value: 'dasdasas',
                label:'das',
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
    }

    public showModalMembership(){
        this.toolsService.showModal({
            cssClass:['modal-membership'],
            component:ModalMembershipComponent,
            keyboardClose:true,
            mode:'ios',
            backdropDismiss:false,
        })
    }

}