import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonItemGroup, ModalController } from '@ionic/angular';
import { format, isValidPhoneNumber } from 'libphonenumber-js';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { ModalStepsClientComponent } from '../modal-steps-client/modal-steps-client.component';
import { ModalStepsDriverComponent } from '../modal-steps-driver/modal-steps-driver.component';

@Component({
  selector: 'app-view-register',
  templateUrl: './view-register.component.html',
  styleUrls: ['./view-register.component.scss'],
})
export class ViewRegisterComponent implements OnInit {

  @Input() role: 'admin' | 'driver' | 'client' = 'client'
  @Input() skipAlert: boolean = false;

  @ViewChild('formRegisterRef') public formRegisterRef: IonItemGroup
  public formRegister: FormGroup
  public loading: boolean

  constructor(
    private modal: ModalController,
    private formBuilder: FormBuilder,
    private toolsService: ToolsService,
    private conectionsService: ConectionsService) { }

  async ngOnInit() {
    this.loading = false
    this.instanceForm()
  }


  getTitle() {
    if (this.role == 'admin') return 'Administrador';
    return this.role == 'client' ? 'Proveedor' : 'Motorizado'
  }

  close(data?: any) {
    this.modal.dismiss(data);
  }



  /* Shit code */
  public instanceForm() {
    this.formRegister = this.formBuilder.nonNullable.group({
      documents: this.formBuilder.nonNullable.group({
        code: ['', [
          Validators.required,
          Validators.nullValidator,
          Validators.pattern(/(^\d{10}$|^\d{13}$)/),

          (codeControl: AbstractControl<number>) => {
            if (codeControl.value != null) {
              let val: string = codeControl.value.toString()
              if (val != '') {
                if (val.length == 10) this.formRegister.get('documents').get('type').setValue('dni');
                if (val.length == 13) this.formRegister.get('documents').get('type').setValue('ruc');
                if (!(RegExp(/(^\d{10}$|^\d{13}$)/).test(val))) this.formRegister.get('documents').get('type').reset();
                return null
              }
            }
          }
        ]],
        type: [null, []]
      }),
      name: ['', [Validators.required, Validators.nullValidator]],
      lastname: ['', [Validators.required, Validators.nullValidator]],
      phone: ['', [
        Validators.required,
        Validators.nullValidator,
        (phoneControl: AbstractControl<string>) => {
          if (phoneControl['value'] != '') {
            if (RegExp(/ /).test(phoneControl['value'])) phoneControl.patchValue(phoneControl['value'].replace(/ /, ''));
            if (RegExp(/^[0-9]{10}$/).test(phoneControl['value'])) phoneControl.setValue(format(phoneControl['value'], 'EC', 'INTERNATIONAL').replace(/ /, ''));
            if (RegExp(/^[+]{1}[0-9]{12}$/).test(phoneControl['value']) && isValidPhoneNumber(phoneControl['value'])) return null;
            return { notIsValidPhoneNumber: true };
          }
        }
      ]],
      mail: ['', [
        Validators.required,
        Validators.nullValidator,
        Validators.email,
        Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      ]],
      password: ['', [Validators.required, Validators.nullValidator]],
    })
  }

  public enterOrGo() {
    if (!this.formRegister.valid) {
      for (const keyC1 in this.formRegisterRef['el']['children']) {
        if (Object.prototype.hasOwnProperty.call(this.formRegisterRef['el']['children'], keyC1)) {
          if (this.formRegisterRef['el']['children'][keyC1]['localName'] == 'ion-item') {
            for (const keyC2 in this.formRegisterRef['el']['children'][keyC1]['children']) {
              if (Object.prototype.hasOwnProperty.call(this.formRegisterRef['el']['children'][keyC1]['children'], keyC2)) {
                if (this.formRegisterRef['el']['children'][keyC1]['children'][keyC2]['localName'] == 'ion-input') {
                  if ((this.formRegisterRef['el']['children'][keyC1]['children'][keyC2] as HTMLIonInputElement).value == '') {
                    (this.formRegisterRef['el']['children'][keyC1]['children'][keyC2] as HTMLIonInputElement).setFocus()
                    return
                  }
                }
              }
            }
          }
        }
      }
    }
    else this.onRegister()
  }

  public async onRegister() {
    this.loading = true
    try {
      let response = await this.conectionsService.signUp(this.formRegister.value, this.role).toPromise()
      this.loading = false
      const { user } = response as any;

      if (this.skipAlert) {
        this.completeData(user);
        return;
      }

      this.toolsService.showAlert({
        cssClass: 'alert-sucess',
        header: `¿Desea culminar el registro añadiendo datos de${this.role == 'client' ? ' la empresa' : 'l motorizado'}?`,
        message: `Al aceptar se mostrara un formulario para ingresar la informacion especifica de${this.role == 'client' ? ' la empresa' : 'l motorizado'}`,
        buttons: [
          {
            text: 'Cancelar',
            handler: () => {
              this.close({ finished: false })
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              this.completeData(user)
            }
          }],
      })

    } catch (error) {

    } finally {
      this.loading = false
    }

  }

  async completeData({ email }) {
    let loading = await this.toolsService.showLoading('Verificando datos...')
    let response = await this.conectionsService.get<any>(`authentication/${email}?populate=*`).toPromise();

    try {
      switch (this.role) {
        case 'client':
          this.toolsService.showModal({
            component: ModalStepsClientComponent,
            cssClass: ['modal-fullscreen'],
            keyboardClose: true,
            mode: 'ios',
            backdropDismiss: false,
            componentProps: {
              id: response.data.id,
            }
          }).then(res => {
            this.modal.dismiss({
              finished: true,
              user: {
                id: res.id,
                name: `${res.name} ${res.lastname}`,
                business: res.business.name,
              }
            })
          })
          break;
        case 'driver':
          this.toolsService.showModal({
            component: ModalStepsDriverComponent,
            cssClass: ['modal-fullscreen'],
            keyboardClose: true,
            mode: 'ios',
            backdropDismiss: false,
            componentProps: {
              id: response.data.id,
            }
          }).then(res => {
            const { data } = response
            this.modal.dismiss({
              finished: true,
              user: {
                id: data.id,
                name: `${data.attributes.name} ${data.attributes.lastname}`
              }
            })
          })
          break;
        default:
          break;
      }
    } catch (error) {
      console.log()
      console.log(error)
    } finally {
      loading.dismiss()
    }


  }
}
