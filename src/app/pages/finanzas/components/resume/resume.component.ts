import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { endOfDay, format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { stringify } from 'qs';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { DatatableComponent } from '../datatable/datatable.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'finance-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss'],
})
export class ResumeComponent implements OnInit, OnChanges {

  @ViewChild('datatable') datatable!: DatatableComponent

  @Input() date: string;
  @Input() target: userModel | null;
  @Input() mode: string;

  path = "";
  resume: resumeModel;

  constructor(private tools: ToolsService, private http: ConectionsService) {
  }

  ngOnChanges(simple: SimpleChanges) {
    this.buildView();
  }


  async buildView() {
    let loading = await this.tools.showLoading('Cargando...')
    try {
      this.genPath()
      this.datatable.setPath = this.path
      this.datatable.forceUpdate()
      await this.fetchResume()
    } catch (error) {

    } finally {
      loading.dismiss()
    }
  }


  ngOnInit() {
    this.clearResume()
  }

  async fetchResume() {
    if (this.mode == 'all') {
      this.resume = await this.http.get<resumeModel>(`finances/${this.date}`).toPromise()
      return;
    }
    let filters = stringify({
      filters: {
        [this.mode == 'providers' ? 'business' : 'driver']: {
          id: this.target.id
        }
      }
    })
    this.resume = await this.http.get<resumeModel>(`finances/${this.date}?${filters}`).toPromise()

  }


  getDay() {
    let date = new Date(this.date);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60000)
    return format(date, 'PPPP', {
      locale: es
    })
  }

  getDayISO() {
    return this.date
  }

  showModal(props = {}) {
    let buildedProps = {}
    if (this.mode != 'all') {
      buildedProps = {
        current: this.target,
        mode: this.mode,
        ...props
      }
    }

    this.tools.showModal({
      component: RegisterComponent,
      componentProps: buildedProps
    }).then(res => {
      if (res) {
        this.buildView()
      }
    })
  }




  async download() {
    /* const loading = await this.tools.showLoading('Descargando informacion...')
    try {
      let response = await this.http.postStream(`froutes/report`, {
        target: 'general',
        day: this.getDayISO()
      })
      let name = `finanzas_${this.getDayISO()}_general`
      let file = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      var a = document.createElement("a"), url = URL.createObjectURL(file);
      a.href = url;
      a.download = `${name}.xlsx`;
      // const response = await this.connectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
      if (response) {
        await this.tools.showAlert({
          cssClass: 'alert-success',
          keyboardClose: true,
          mode: 'ios',
          header: 'Exito',
          buttons: [{ text: 'Aceptar', handler: () => a.click() }]
        })
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.dismiss()
    } */
  }

  between() {
    let startDate = new Date(this.date)
    let endDate = new Date(this.date)
    startDate.setTime(startDate.getTime() + startDate.getTimezoneOffset() * 60000)
    endDate.setTime(endDate.getTime() + endDate.getTimezoneOffset() * 60000)
    startDate = startOfDay(startDate);
    endDate = endOfDay(endDate);
    startDate.setTime(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
    endDate.setTime(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
    return [startDate.toISOString(), endDate.toISOString()]
  }

  genPath() {
    if (this.mode == 'all') {
      this.path = "finances?populate=*&" + stringify({
        filters: {
          time: {
            $between: this.between()
          }
        }
      })
      return;
    }
    let param = this.mode == 'providers' ? 'business' : 'driver';
    this.path = "finances?populate=*&" + stringify({
      filters: {
        time: {
          $between: this.between()
        },
        [param]: {
          id: this.target.id
        }
      }
    })
  }

  onRowSelect(response: httpSingleResponse) {
    this.showModal({ published: response })
  }


  clearResume() {
    this.resume = {
      income: 0,
      discharge: 0,
      delivery: 0
    }
  }

  getSueldo(): number {
    let deducible = this.resume.delivery * 0.25;
    let pendiente = this.resume.income - this.resume.discharge
    if (pendiente < 0) return (this.resume.delivery - deducible) + pendiente
    return (this.resume.delivery - deducible)
  }

  getSaldo(): number {
    let egreso = this.resume.delivery + this.resume.discharge;
    //if (this.resume.ingreso >= egreso) return egreso - this.resume.ingreso
    return egreso - this.resume.income
  }
}

export interface httpSingleResponse {
  attributes: any,
  id: number
}

export interface userModel {
  id: number,
  name: string,
  business?: string
}
export interface resumeModel {
  income: number,
  discharge: number,
  delivery: number
}
