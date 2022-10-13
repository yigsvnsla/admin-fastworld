import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { format, isValidPhoneNumber } from 'libphonenumber-js';
@Component({
    selector: 'app-details-driver',
    templateUrl: './details-driver.component.html',
    styleUrls:['./details-driver.component.scss']
})

export class DetailsDriverComponent implements OnInit {

    @Input() public id: number

    public user$: BehaviorSubject<any>;
    public formBasic: FormGroup;

    constructor(
        private modalController: ModalController,
        private toolsService: ToolsService,
        private conectionService: ConectionsService,
        private formBuilder: FormBuilder
    ) {
        this.user$ = new BehaviorSubject<(any | undefined)>(undefined);
    }

    public async onExit() {
        (await this.modalController.getTop()).dismiss()
    }

    public async ngOnInit(): Promise<void> {
        const user = await this.conectionService.get<any>(`user/basic/${this.id}?populate=*`).pipe(delay(500)).toPromise()
        this.user$.next(user);
        this.instanceForm(this.user$.value)
    }

    public async showAlertConfirmUpdateBasic() {
        const send = async () => {
          const loading = await this.toolsService.showLoading('Actualizando informacion...')
          try {
            console.log(this.formBasic.value)
            const response = await this.conectionService.put(`basics/${this.id}`, this.formBasic.value).toPromise()
            console.log(response)
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
          buttons: ['Cancelar', { text: 'Aceptar', handler: () => console.log(this.formBasic)  }]
        })
    
      }

    private instanceForm(data: any) {
        console.log(data);

        this.formBasic = this.formBuilder.nonNullable.group({
            type: [null, []],
            identification: [data.identification, [
                Validators.required,
                Validators.nullValidator,
                Validators.pattern(/(^\d{9}$|^\d{13}$)/),
                (codeControl: AbstractControl<number>) => {
                    if (codeControl.value != null) {
                        let val: string = codeControl.value.toString()
                        if (val != '') {
                            // if ( val.length == 9 ) this.formBasic.get('documents').get('type').setValue('dni');
                            // if ( val.length == 13 ) this.formBasic.get('documents').get('type').setValue('ruc');
                            if (!(RegExp(/(^\d{9}$|^\d{13}$)/).test(val))) this.formBasic.get('documents').get('type').reset();
                            return null
                        }
                    }
                }
            ]],
            name: [data.name, [Validators.required, Validators.nullValidator]],
            lastname: [data.lastname, [Validators.required, Validators.nullValidator]],
            phone: [data.phone, [
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
            user: this.formBuilder.nonNullable.group({
                password: [null, [Validators.required, Validators.nullValidator]],
                mail: [data.user.email, [
                    Validators.required,
                    Validators.nullValidator,
                    Validators.email,
                    Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
                ]],
            })

        })

        this.formBasic.disable()
    }


}