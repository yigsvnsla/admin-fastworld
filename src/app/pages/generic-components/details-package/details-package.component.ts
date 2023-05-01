import { ToolsService } from 'src/app/services/tools.service';
import { delay, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { InputCustomEvent, IonModal, ModalController } from '@ionic/angular';
import { ConectionsService } from 'src/app/services/connections.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalTransferPackageComponent } from '../modal-transfer-package/modal-transfer-package.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-details-package',
  templateUrl: './details-package.component.html',
  styleUrls: ['./details-package.component.scss'],
})
export class DetailsPackageComponent implements OnInit {
  @ViewChild('modal') modal: IonModal

  @Input() public id: number
  public dialogForm: FormGroup;

  public package: Observable<any>
  public history: Observable<any>
  constructor(
    private conectionsService: ConectionsService,
    private modalController: ModalController,
    private toolsService: ToolsService,
    private formBuilder: FormBuilder

  ) {
    this.dialogForm = this.formBuilder.nonNullable.group({
      money_catch: ['$0.00', [Validators.required]],
      comment: ['Sin Novedad', [Validators.required]],
      fee: ['$0.00', [Validators.required]]
    })
  }

  public ngOnInit(): void {
    this.loadPackage()
  }

  private _refPackage: any = {}

  private async loadPackage() {
    this.package = this.conectionsService
      .get<any>(`admin/packages/${this.id}?populate=*`)
      .pipe(
        delay(1000),
        map(res => res.data),
        tap((val) => { this._refPackage = val, console.log(val) }),
      )
    this.history = this.conectionsService
      .get<any>(`history/package/${this.id}?populate=*`)
      .pipe(
        delay(1000),
        // map(res => res),
      )
  }

  public async paymentPackage(item: any) {
    const send = async () => {
      const loading = await this.toolsService.showLoading('Transfiriendo...')
      try {
        if (item.attributes.payment_status == 'pagado') {
          await this.toolsService.showAlert({
            cssClass: 'alert-danger',
            keyboardClose: true,
            mode: 'ios',
            header: 'Esta Encomienda ya esta pagada',
            buttons: ['Cancelar', { text: 'Aceptar' }]
          })
        }

        if (item.attributes.payment_status == 'pendiente') {
          const response = await this.conectionsService.post(`packages/payment/${this.id}`, { status: 'pagado' }).toPromise()
          // console.log(response);
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

  public sharePackage(_id: number) {
    this.toolsService.showLoading()
      .then(async loading => {
        const { id } = await this.conectionsService.get<any>(`ticket/generate/${_id}`).toPromise()
        loading.dismiss();
        (await this.toolsService.showAlert({
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

  public onTransferPackage(row: any) {
    this.toolsService.showModal({
      cssClass: ['modal-fit-content'],
      component: ModalTransferPackageComponent,
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        idPackage: row
      }
    }).then(value => {
      this.loadPackage()
      if (value) {

        this.modal.dismiss(this._refPackage)

        // this.user$.next(this.user)
      }
    })
  }

  public async updateStatusPackage(_id: number, status: string) {
    let loading = await this.toolsService.showLoading('Actualizando...');
    const { money_catch, comment, fee } = this.dialogForm.value

    try {
      let response = await this.conectionsService.post(`packages/shipping/${_id}`, {
        money_catch,
        fee,
        comment,
        status
      }).toPromise()

      // console.log(response.data);
      this.loadPackage()
      // if ( status == 'recibido' ){
      //   this.source.addItemToSource(response.data);
      // }
      // if ( status != 'recibido' ){
      //   this.source.deleteItemToSource(_id)
      // }

      // console.log('response', response)
    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss();
      (await this.modalController.getTop()).dismiss(this._refPackage)
      // this.modal.dismiss(this._refPackage)
    }
  }

  public ionChangesInputCurrencyMoneyCatch(_$event: Event) {
    const $event = (_$event as InputCustomEvent)
    console.log($event);

    let value = $event.detail.value;
    const decimal: string = ',';
    const thousand: string = '.';
    if (RegExp(/$/g).test($event.detail.value)) $event.detail.value.replace('$', '');
    if ($event.detail.value == '') this.dialogForm.get(['money_catch']).setValue(value = '0' + decimal + '00');
    value = value + '';
    value = value.replace(/[\D]+/g, '');
    value = value + '';
    value = value.replace(/([0-9]{2})$/g, decimal + '$1');
    var parts = value.toString().split(decimal);
    if (parts[0] == '') parts[0] = '0';
    parts[0] = parseInt(parts[0]).toString();
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
    value = parts.join(decimal);
    this.dialogForm.get(['money_catch']).setValue('$' + value)
  }

  public ionChangesInputCurrencyFee(_$event: Event) {
    const $event = (_$event as InputCustomEvent)
    console.log($event);

    let value = $event.detail.value;
    const decimal: string = ',';
    const thousand: string = '.';
    if (RegExp(/$/g).test($event.detail.value)) $event.detail.value.replace('$', '');
    if ($event.detail.value == '') this.dialogForm.get(['money_catch']).setValue(value = '0' + decimal + '00');
    value = value + '';
    value = value.replace(/[\D]+/g, '');
    value = value + '';
    value = value.replace(/([0-9]{2})$/g, decimal + '$1');
    var parts = value.toString().split(decimal);
    if (parts[0] == '') parts[0] = '0';
    parts[0] = parseInt(parts[0]).toString();
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
    value = parts.join(decimal);
    this.dialogForm.get(['fee']).setValue('$' + value)
  }

  public async onExit() {
    // console.log(this._refPackage);

    (await this.modalController.getTop()).dismiss(this._refPackage)
  }

    async getPDF(id) {
    const loading = await this.toolsService.showLoading('Cargando informacion...')
    try {
      let response = await this.conectionsService.postStream(`print/package/${id}`, {}).toPromise()
      let name = new Date().toString()
      let file = new Blob([response], { type: 'application/pdf' })
      var a = document.createElement("a"), url = URL.createObjectURL(file);
      a.href = url;
      a.download = `${name}.pdf`;
      // const response = await this.connectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
      if (response) {
        await this.toolsService.showAlert({
          cssClass: 'alert-success',
          keyboardClose: true,
          mode: 'ios',
          header: 'Exito',
          buttons: [{ text: 'Aceptar', handler: () => a.click() }]
        })
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.dismiss()
    }
  }

}
