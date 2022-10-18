import { Input, Output } from "@angular/core";
import { Component, OnInit, EventEmitter, } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { InputChangeEventDetail, IonInput, IonSearchbar } from "@ionic/angular";
import { endOfMonth, startOfMonth, sub } from "date-fns";
import * as qs from "qs";
import { ConectionsService } from "src/app/services/connections.service";
import { ToolsService } from "src/app/services/tools.service";


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
    private connection: ConectionsService,
    private tools: ToolsService
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

      default:
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




  async download() {
    const loading = await this.tools.showLoading("Generando...")
    try {
      let response = await this.connection.postStream('report/8', {hola: "Holaa"}).toPromise()
      let file = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      var a = document.createElement("a"), url = URL.createObjectURL(file);
      a.href = url;
      a.download = "prueba.xlsx";
      a.click();
    } catch (error) {
      console.log(error)
    }finally{
      loading.dismiss()
    }
  }


}


