import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { stringify } from 'qs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputCustomEvent, IonModal } from '@ionic/angular';
import { ModalCheckComponent } from '../modal-check/modal-check.component';

@Component({
  selector: 'pagos-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss'],
})
export class ResumenComponent implements OnInit, OnChanges {

  @Input() id: number;
  @ViewChild('modalPayment') modalPayment: IonModal

  user: any = {};
  validUser = false
  pagos = new Source(this.http)

  /* Forms */
  formPayment: FormGroup;

  constructor(private http: ConectionsService, private tools: ToolsService, private builder: FormBuilder) { }

  ngOnInit() {
    this.formPayment = this.builder.nonNullable.group({
      value: ['$0.00', [Validators.required]],
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fetchUser()
  }


  async fetchUser() {
    let loading = await this.tools.showLoading('Obteniendo informacion...');
    try {
      this.user = await this.http.get(`payments/${this.id}`).toPromise();
      this.pagos.setPath = `payments/history/${this.user.id}`
      this.validUser = true
      console.log(this.user)
    } catch (error) {
      console.log('Error al obtener informacion', error)
    } finally {
      loading.dismiss()
    }
  }


  async pay() {
    const { value } = this.formPayment.value
    let estimate = parseFloat(value.replace('$', '').replaceAll('.', '').replace(',', '.'))
    await this.modalPayment.dismiss()

    if (estimate < 2.50) {
      this.tools.showAlert({
        cssClass: 'alert-danger',
        header: `🚫 Monto invalido`,
        subHeader: "El monto ingresado debe ser mayor a $2.50",
        buttons: ['ok'],
      })
      return;
    }

    let loading = await this.tools.showLoading('Calculando');
    try {
      let response = await this.http.post('payments/calculate', {
        estimate,
        id: this.id
      }).toPromise()
      this.tools.showModal({
        component: ModalCheckComponent,
        componentProps: {
          resume: response,
          id: this.id,
          business: this.user.id
        }
      })
    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss()
    }
  }


  modalOnWillPresent($event) {
    this.formPayment.reset()
  }

  public ionChangesInputCurrency(_$event: Event) {
    const $event = (_$event as InputCustomEvent)
    let value = $event.detail.value;
    const decimal: string = ',';
    const thousand: string = '.';
    if (RegExp(/$/g).test($event.detail.value)) $event.detail.value.replace('$', '');
    if ($event.detail.value == '') this.formPayment.get(['value']).setValue(value = '0' + decimal + '00');
    value = value + '';
    value = value.replace(/[\D]+/g, '');
    value = value + '';
    value = value.replace(/([0-9]{2})$/g, decimal + '$1');
    var parts = value.toString().split(decimal);
    if (parts[0] == '') parts[0] = '0';
    parts[0] = parseInt(parts[0]).toString();
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
    value = parts.join(decimal);
    this.formPayment.get(['value']).setValue('$' + value)
  }


}
