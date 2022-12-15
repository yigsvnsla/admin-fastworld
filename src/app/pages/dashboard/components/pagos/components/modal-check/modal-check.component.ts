import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-modal-check',
  templateUrl: './modal-check.component.html',
  styleUrls: ['./modal-check.component.scss'],
})
export class ModalCheckComponent implements OnInit {

  @Input() id: any;
  @Input() business: any;
  @Input() estimate: number;
  @Input() resume: {
    total: number,
    value: number,
    left: number,
  }
  @Input() charges: {
    total: string,
    count: string
  }


  formPago: FormGroup

  constructor(
    private modal: ModalController,
    private tools: ToolsService,
    private builder: FormBuilder,
    private http: ConectionsService) { }

  ngOnInit() {
    console.log(this.resume)
  }


  async onExit(obj?: any) {
    this.modal.dismiss(obj)
  }

  async confirm(option: any) {
    let loading = await this.tools.showLoading('Pagando...')
    console.log(option)
    try {
      switch (option) {
        case "0":
          this.exit(await this.addBalance())
          break;
        case "1":
          this.exit(await this.payPackages())
          break
        case "2":
          this.exit(await this.payAll())
          break
        default:
          break;
      }

    } catch (error) {
      console.log(error)
    } finally {
      loading.dismiss()
    }
  }

  async addBalance() {
    return await this.http.post('payments/charges', {
      value: this.estimate,
      description: "Saldo acreditado",
      business: this.business,
      type: 'credito'
    }).toPromise()
  }

  async payPackages() {
    return await this.http.post('payments/packages', {
      value: this.resume.value,
      description: `Pago de ${this.resume.total} encomiendas`,
      business: this.business,
    }).toPromise()
  }

  async payAll() {
    return await this.http.post('payments/packages', {
      value: this.resume.value,
      balance: this.resume.left,
      description: `Pago de ${this.resume.total} encomiendas`,
      business: this.business,
    }).toPromise()
  }

  async exit(values) {
    this.modal.dismiss(values)
  }

}
