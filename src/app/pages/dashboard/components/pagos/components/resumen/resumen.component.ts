import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { stringify } from 'qs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputCustomEvent, IonModal } from '@ionic/angular';
import { ModalCheckComponent } from '../modal-check/modal-check.component';
import { ModalAgregarComponent } from '../modal-agregar/modal-agregar.component';
import { BehaviorSubject } from 'rxjs';

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
  dataPath = ''

  updateTable: BehaviorSubject<string> = new BehaviorSubject('')

  constructor(private http: ConectionsService, private tools: ToolsService, private builder: FormBuilder) { }

  ngOnInit() {
    this.updateTable.subscribe(res=>{
      console.log(res)
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fetchUser()
  }


  async fetchUser() {
    let loading = await this.tools.showLoading('Obteniendo informacion...');
    try {
      this.user = await this.http.get(`payments/${this.id}`).toPromise();
      this.validUser = true
      this.updateTable.next(`payments/history/${this.user.id}`)
    } catch (error) {
      console.log('Error al obtener informacion', error)
    } finally {
      loading.dismiss()
    }
  }


  async pay({ value }) {
    let estimate = parseFloat(value.replace('$', '').replaceAll('.', '').replace(',', '.'))
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
      console.log(response)
      this.tools.showModal({
        component: ModalCheckComponent,
        componentProps: {
          resume: response,
          id: this.id,
          business: this.user.id,
          charges: this.user.charges,
          estimate: estimate
        }
      }).then(async res => {
        if (res) await this.fetchUser()
      })
    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss()
    }
  }

  async addCharges({ value, comment }) {
    let estimate = parseFloat(value.replace('$', '').replaceAll('.', '').replace(',', '.'))
    let loading = await this.tools.showLoading('Agregando cargos...');
    try {
      let response = await this.http.post('payments/charges', {
        value: estimate,
        description: comment,
        business: this.user.id
      }).toPromise()
      await this.fetchUser()
    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss()
    }
  }

  showCargoModal() {
    this.tools.showModal({
      component: ModalAgregarComponent,
      cssClass: 'modal-dialogs',
      componentProps: {
        title: 'Agregar cargos'
      }
    }).then(res => {
      if (res) {
        this.addCharges(res)
      }
    })
  }

  showPagoModal() {
    this.tools.showModal({
      component: ModalAgregarComponent,
      cssClass: 'modal-dialogs',
      componentProps: {
        title: 'Agregar saldo',
        comment: false
      }
    }).then(res => {
      if (res) {
        this.pay(res)
      }
    })
  }


}
