import { ToolsService } from 'src/app/services/tools.service';
import { delay, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ConectionsService } from 'src/app/services/connections.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-details-package',
  templateUrl: './details-package.component.html',
  styleUrls: ['./details-package.component.scss'],
})
export class DetailsPackageComponent implements OnInit {

  @Input() public id : number

  public package : Observable<any>
  public history : Observable<any>
  constructor(
    private conectionsService:ConectionsService,
    private modalController:ModalController,
    private toolsService:ToolsService
  ) { }

  public ngOnInit(): void {
    this.loadPackage()
  }

  private async loadPackage(){
    this.package = this.conectionsService.get<any>(`client/packages/${this.id}?populate=*`).pipe(delay(1000),map(res=>res.data),tap(console.log),)
    this.history = this.conectionsService.get<any>(`history/package/${this.id}?populate=*`).pipe(delay(1000),map(res=>res),tap(console.log))
  }

  public async paymentPackage(item:any){
    const send = async () => {
      const loading = await this.toolsService.showLoading('Transfiriendo...')
      try {
        if (item.attributes.payment_status == 'pagado'){
          await this.toolsService.showAlert({
            cssClass: 'alert-danger',
            keyboardClose: true,
            mode: 'ios',
            header: 'Esta Encomienda ya esta pagada',
            buttons: ['Cancelar', { text: 'Aceptar'}]
          })
        }

        if (item.attributes.payment_status == 'pendiente'){
          const response = await this.conectionsService.post(`packages/payment/${this.id}`, {status:'pagado'}).toPromise()
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
      header: 'Confirmar pago',
      buttons: ['Cancelar', { text: 'Aceptar', handler: () => send() }]
    })
  }

  public async onExit(){
    (await this.modalController.getTop()).dismiss()
  }

}
