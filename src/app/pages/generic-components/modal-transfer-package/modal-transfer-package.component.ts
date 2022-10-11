import { FormControl, Validators } from '@angular/forms';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
    selector: 'app-modal-transfer-package',
    templateUrl: './modal-transfer-package.component.html',
    styleUrls: ['./modal-transfer-package.component.scss']
})

export class ModalTransferPackageComponent implements OnInit {

    @Input() idPackage: number

    public idControl:FormControl

    constructor(
        private modalController: ModalController,
        private toolsService: ToolsService,
        private conectionsService: ConectionsService
    ) {
        this.idControl = new FormControl('',{validators:[Validators.required,Validators.min(1)]})
    }

    public ngOnInit() { }

    public async onSuccess() {

        const send = async () => {
            const loading = await this.toolsService.showLoading('Transfiriendo...')
            try {
                
                console.log({ driver: this.idControl.value, package: this.idPackage });
                

                const response = await this.conectionsService.post('package/transfer', { driver: this.idControl.value, package: this.idPackage }).toPromise()
                if (response) {
                    console.log(response);

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

    public async onExit() {
        (await this.modalController.getTop()).dismiss()
    }
}