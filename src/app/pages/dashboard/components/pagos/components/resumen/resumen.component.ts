import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { stringify } from 'qs'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputCustomEvent, IonModal, ModalController } from '@ionic/angular';
import { ModalCheckComponent } from '../modal-check/modal-check.component';
import { ModalAgregarComponent } from '../modal-agregar/modal-agregar.component';
import { BehaviorSubject } from 'rxjs';
import { ViewDataTableComponent } from '../view-data-table/view-data-table.component';

@Component({
  selector: 'pagos-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss'],
})
export class ResumenComponent implements OnInit {

  @Input() id: number;
  @ViewChild('modalPayment') modalPayment: IonModal
  @ViewChild('datatable') datatable: ViewDataTableComponent

  user: any = {};
  validUser = false
  dataPath = ''

  constructor(private http: ConectionsService, private tools: ToolsService, private builder: FormBuilder,
    private modal: ModalController) { }

  ngOnInit() {
    this.fetchUser()
  }




  async fetchUser() {
    let loading = await this.tools.showLoading('Obteniendo informacion...');
    try {
      this.user = await this.http.get(`payments/${this.id}`).toPromise();
      this.validUser = true
      this.dataPath = `payments/history/${this.user.id}`
    } catch (error) {
      console.log('Error al obtener informacion', error)
    } finally {
      loading.dismiss()
    }
  }


  async pay({ value, comment }) {
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
      this.tools.showModal({
        component: ModalCheckComponent,
        componentProps: {
          resume: response,
          id: this.id,
          business: this.user.id,
          charges: this.user.charges,
          estimate: estimate,
          comment
        }
      }).then(async res => {
        if (res) {
          await this.fetchUser()
          this.datatable.forceUpdate(this.dataPath)
        }
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
        comment: true
      }
    }).then(res => {
      if (res) {
        this.pay(res)
      }
    })
  }

  exit() {
    this.modal.dismiss()
  }

}
