import { ToolsService } from 'src/app/services/tools.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-modal-transfer-package',
    templateUrl: './modal-transfer-package.component.html',
    styleUrls: ['./modal-transfer-package.component.scss']
})

export class ModalTransferPackageComponent implements OnInit {
    constructor(
        private modalController:ModalController,
        private toolsService:ToolsService
    ) { }

    public ngOnInit() { }

    public async onSuccess(){
        const send = async () => {
            const loading = await this.toolsService.showLoading('Actualizando informacion...')
            try {
            //   const response = await this.conectionService.put(`businesses/${this.user.business.id}`, form).toPromise()
            //   if (response) {
            //     this.editingLogo = false
            //   }
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