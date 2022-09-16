import { ActivatedRoute, Router } from '@angular/router';
import { ConectionsService } from 'src/app/services/connections.service';
import { IonItemGroup } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ToolsService } from 'src/app/services/tools.service';
import { format, isValidPhoneNumber } from 'libphonenumber-js';

@Component({
    selector: 'app-historial',
    templateUrl: './crear-usuario.component.html',
    styleUrls: ['./crear-usuario.component.scss'],
})

export class CrearUsuarioComponent implements OnInit {

    @ViewChild('formRegisterRef') public formRegisterRef: IonItemGroup
    public formRegister: FormGroup
    public loading: boolean
    public listTypeUser = [{
        title: 'cliente',
        url: 'client'
    }, {
        title: 'conductor',
        url: 'driver'
    }]
    public scope: string
    constructor(
        private toolsService: ToolsService,
        private conectionsService: ConectionsService,
        private formBuilder: FormBuilder,
        private rutaActiva: ActivatedRoute,
        private router: Router
    ) {

    }

    ngOnChanges(){
        this.scope = ''
        if (new RegExp(/([a-zA-Z])/g).test(this.rutaActiva.snapshot.params['type'])) {
            if (this.rutaActiva.snapshot.params['type'] !== undefined){
                let index = this.listTypeUser.findIndex((rol => rol.title === this.rutaActiva.snapshot.params['type']))
                if ( index < 0 ) { this.router.navigateByUrl('/dashboard/usuarios/crear') }
                if (index >= 0) { this.scope = this.listTypeUser[index].url }
            }
        }
    }

    public ngOnInit() {

        this.loading = false
        this.formRegister = this.formBuilder.nonNullable.group({
            documents: this.formBuilder.nonNullable.group({
                code: ['', [
                    Validators.required,
                    Validators.nullValidator,
                    Validators.pattern(/(^\d{9}$|^\d{13}$)/),
                    (codeControl: AbstractControl<number>) => {
                        if (codeControl.value != null) {
                            let val: string = codeControl.value.toString()
                            if (val != '') {
                                if (val.length == 9) this.formRegister.get('documents').get('type').setValue('dni');
                                if (val.length == 13) this.formRegister.get('documents').get('type').setValue('ruc');
                                if (!(RegExp(/(^\d{9}$|^\d{13}$)/).test(val))) this.formRegister.get('documents').get('type').reset();
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

    public onRegister() {
        this.loading = true
        this.conectionsService
            .signUp(this.formRegister.value,this.scope)
            .subscribe((response) => {
                console.log(response);
              
                this.loading = false
            }, (error) => {
                console.error(error);
                this.loading = false
            })
    }

}