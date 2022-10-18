import { ConectionsService } from './../../../services/connections.service';
import { ToolsService } from './../../../services/tools.service';
import { Input, Output } from "@angular/core";
import { Component, OnInit, EventEmitter,} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { InputChangeEventDetail, IonInput, IonSearchbar, SelectCustomEvent } from "@ionic/angular";
import { endOfMonth, startOfMonth, sub } from "date-fns";
import * as qs from "qs";


@Component({
    selector: 'app-menu-filter',
    templateUrl: './menu-filter.component.html',
    styleUrls: ['./menu-filter.component.scss'],
})
export class MenuFilterComponent implements OnInit {

    @Input() path: string;
    @Input() public inputSearch: IonInput;
    @Output() public urlGen: EventEmitter<string> = new EventEmitter();


    public qsForm: FormGroup;
    public qsObject: {
        filters: {
            [key: string]: any
        }
    };


    constructor(
        private formBuilder: FormBuilder,
        private toolsServices:ToolsService,
        private connectionsService:ConectionsService
    ) {

    }

    ngOnInit(): void {
        this.instanceQsObject()
        this.instaceForm()

        this.inputSearch.ionChange.subscribe(($event: CustomEvent<InputChangeEventDetail>) => {
            if ($event.detail.value != '') {
                let filter = {
                    $containsi: $event.detail.value
                }
                this.setFilter(this.qsForm.get(['$containsi']).value, filter)
            } else {
                delete this.qsObject.filters['id'];
                delete this.qsObject.filters['name']
                this.urlGen.emit(`${qs.stringify(this.qsObject.filters, { encode: false })}`)

            }
        })
    }

    private instanceQsObject() {
        this.qsObject = {
            filters: {
                createdAt: {
                    $between: [
                        new Date(new Date().getFullYear(), new Date().getMonth(),
                            new Date().getDate()).toISOString(), new Date(Date.now()).toISOString()
                    ]
                }
            }
        }
    }

    private instaceForm() {
        this.qsForm = this.formBuilder.nonNullable.group({
            $between: [0],
            $containsi: ['id']
        });
        this.qsForm.get(['$between']).valueChanges.subscribe(values => {
            this.rangeToDate(values);
        });

        this.qsForm.get(['$containsi']).valueChanges.subscribe(values => {
            if (this.inputSearch.value != '') {
                if (values == 'id') {
                    delete this.qsObject.filters['name']
                } else {
                    delete this.qsObject.filters['id']
                }
                this.inputSearch.value = ''
                this.rangeToSearch(values);
            }
        });
        this.urlGen.emit(`${qs.stringify(this.qsObject.filters, { encode: false })}`)

    }

    private rangeToDate(range: number) {
        let filter = new Object()
        switch (range) {
            case 0:
                filter = {
                    $between: [
                        new Date(new Date().getFullYear(), new Date().getMonth(),
                            new Date().getDate()).toISOString(), new Date(Date.now()).toISOString()
                    ]
                }
                this.setFilter('createdAt', filter)
                break;
            case 1:
                filter = {
                    $between: [
                        sub(new Date(Date.now()), { days: 7 }).toISOString(),
                        new Date(Date.now()).toISOString()
                    ]
                }
                this.setFilter('createdAt', filter)
                break
            case 2:
                filter = {
                    $between: [
                        startOfMonth(new Date(Date.now())).toISOString(),
                        endOfMonth(new Date(Date.now())).toISOString()
                    ]
                }
                this.setFilter('createdAt', filter)
                break
            case 3:
                filter = {
                    $between: [
                        startOfMonth(sub(new Date(Date.now()), { months: 3 })).toISOString(),
                        endOfMonth(new Date(Date.now())).toISOString()
                    ]
                }
                this.setFilter('createdAt', filter)
                break;
            default: { console.error('rangeToDate --> el valor'); }
        }
    }

    private rangeToSearch(range: string) {
        let filter = new Object()
        switch (range) {
            case 'id':
                filter = {
                    $containsi: this.inputSearch.value
                }
                this.setFilter(range, filter)
                break;
            case 'name':
                filter = {
                    $containsi: this.inputSearch.value
                }
                this.setFilter(range, filter)
                break;

            default: { console.error('rangeSearch --> el valor'); }
                break;
        }

    }

    private setFilter(key: string, value: object) {
        for (let _key in this.qsObject.filters) {
            if (Object.prototype.hasOwnProperty.call(this.qsObject.filters, key)) {
                this.qsObject.filters[key] = { ...value }
            }
            if (!Object.prototype.hasOwnProperty.call(this.qsObject.filters, key)) {
                this.qsObject.filters[key] = value;
            }
            console.log(this.qsObject.filters);
        }

        this.urlGen.emit(`${qs.stringify(this.qsObject, { encode: false })}`)
    }


    public async getExport(type:string){
        const send = async () => {
            const loading = await this.toolsServices.showLoading('Actualizando informacion...')
            try {
                // const response = await this.connectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
                // if (response) {
                    await this.toolsServices.showAlert({
                        cssClass: 'alert-success',
                        keyboardClose: true,
                        mode: 'ios',
                        header: 'Exito',
                        buttons: [{ text: 'Aceptar' }]
                    })
                // }
            } catch (error) {
                console.error(error);
            } finally {
                loading.dismiss()
            }
        }

        await this.toolsServices.showAlert({
            cssClass: 'alert-success',
            keyboardClose: true,
            mode: 'ios',
            header: 'Descargar ' + type,
            buttons: ['Cancelar', { text: 'Aceptar', handler: () => send()}]
        })
    }

}


