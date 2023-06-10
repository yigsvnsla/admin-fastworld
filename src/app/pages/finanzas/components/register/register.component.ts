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
      business: [0],
      driver: [0],
      client: [''],
      income: ['', Validators.required],
      discharge: ['', Validators.required],
      delivery: ['', Validators.required],
      direction: [''],
      time: [format(new Date(), 'yyyy-MM-dd'), Validators.required]
    })
  }

  async ngOnInit() {
    if (this.current) {
      try {
        if (this.mode == 'providers') {
          this.user = this.current;
          this.formRoute.patchValue({ business: this.user.id })
        } else {
          this.driver = this.current;
          this.formRoute.patchValue({ driver: this.driver.id })
        }
      } catch (error) {

      }
    }
    if (this.published) {
      const { attributes } = this.published
      let time = attributes.time.split("T")[0];
      let driver = attributes.driver?.data?.id || 0
      let business = attributes.business?.data?.id || 0

      if (driver != 0) this.driver = {
        id: attributes.driver.data.id,
        name: attributes.driver.data.attributes.name
      };
      if (business != 0) this.user = {
        id: attributes.business.data.id,
        name: attributes.business.data.attributes.name,
      };
      this.formRoute.patchValue({
        ...attributes,
        driver,
        business,
        time
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
    if (mode == 'providers') {
      this.user = event;
      this.formRoute.patchValue({ business: event.id })
    } else {
      this.driver = event;
      this.formRoute.patchValue({ driver: event.id })
    }
  }


  async send() {
    let data = JSON.parse(JSON.stringify(this.formRoute.value));
    let { business, driver, time } = data
    let day = new Date(time)

    if (business == 0) delete data['business']
    if (driver == 0) delete data['driver']
    data['time'] = day.toISOString()

    if (this.published) {
      let loading = await this.tools.showLoading('Actualizando registro...')
      try {
        let response = await this.http.put(`finances/${this.published.id}`, { data }).toPromise()
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
      let response = await this.http.post('finances?populate=*', { data }).toPromise()
      this.modal.dismiss(response)
    } catch (error) {
      console.log("Error on post ModalAddComponent", error)
    } finally {
      loading.dismiss()
    }
  }

  runClear(mode: string) {
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
