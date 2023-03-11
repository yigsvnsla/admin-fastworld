import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { format } from 'date-fns';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { httpSingleResponse, userModel } from '../resume/resume.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  @Input() mode: 'all' | 'providers' | 'drivers' = 'all'
  @Input() current: userModel = null
  @Input() published!: httpSingleResponse

  user: any | null = null;
  driver: any | null = null;
  defaultObj = {
    id: 0,
    attributes: {
      nombre: '~'
    }
  }

  formRoute!: FormGroup

  constructor(private modal: ModalController, private http: ConectionsService, private tools: ToolsService, private builder: FormBuilder) {
    this.formRoute = this.builder.group({
      cliente: [''],
      proveedor: [0],
      conductor: [0],
      ingreso: ['', Validators.required],
      egreso: ['', Validators.required],
      valor: ['', Validators.required],
      direccion: [''],
      entrega: [format(new Date(), 'yyyy-MM-dd'), Validators.required]
    })
  }

  async ngOnInit() {
    if (this.current) {
      try {
        if (this.mode == 'providers') {
          this.user = this.current;
          this.formRoute.patchValue({ proveedor: this.user.id })
        } else {
          this.driver = this.current;
          this.formRoute.patchValue({ conductor: this.driver.id })
        }
      } catch (error) {

      }
    }
    console.log(this.current)

    if (this.published) {
      const { attributes } = this.published
      let entrega = attributes.entrega.split("T")[0];
      let conductor = attributes.conductor?.data?.id || 0
      let proveedor = attributes.proveedor?.data?.id || 0

      if (conductor != 0) this.driver = attributes.conductor.data;
      if (proveedor != 0) this.user = attributes.proveedor.data;
      this.formRoute.patchValue({
        ...attributes,
        conductor,
        proveedor,
        entrega
      })
    }

  }

  ionViewDidEnter() {
    console.log("menu enter")
  }


  close() {
    this.modal.dismiss()
  }

  onResult(event: any, mode: string) {
    console.log(event)
    if (mode == 'providers') {
      this.user = event;
      this.formRoute.patchValue({ proveedor: event.id })
    } else {
      this.driver = event;
      this.formRoute.patchValue({ conductor: event.id })
    }
  }


  async send() {
    let data = JSON.parse(JSON.stringify(this.formRoute.value));
    let { proveedor, conductor, entrega } = data

    if (proveedor == 0) delete data['proveedor']
    if (conductor == 0) delete data['conductor']

    if (this.published) {
      let loading = await this.tools.showLoading('Actualizando registro...')
      try {
        let response = await this.http.put(`froutes/${this.published.id}`, { data })
        this.modal.dismiss(response)
      } catch (error) {
        console.log("Error on post ModalAddComponent", error)
      } finally {
        loading.dismiss()
      }
      return;
    }

    let loading = await this.tools.showLoading('Creando registro...')
    try {
      let response = await this.http.post('froutes', { data })
      this.modal.dismiss(response)
    } catch (error) {
      console.log("Error on post ModalAddComponent", error)
    } finally {
      loading.dismiss()
    }
  }

  runClear(mode: string) {
    console.log("here")

    if (this.mode) {
      if (this.mode == mode) return;
    }

    mode == 'fusers' ? this.user = null : this.driver = null;
    /* if (mode == 'fuser') {
      this.user = null;
    } else {
      this.driver = null;
    } */
  }



}
