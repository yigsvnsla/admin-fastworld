import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { endOfDay, format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { stringify } from 'qs';
import { ViewDownloadComponent } from 'src/app/pages/generic-components/view-download/view-download.component';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { DatatableComponent } from '../datatable/datatable.component';
import { RegisterComponent } from '../register/register.component';

const MimeTypes = [
  {
    name: 'excel',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx',
    route: 'finances/excel'
  },
  {
    name: 'pdf',
    type: 'application/pdf',
    extension: '.pdf',
    route: 'finances/pdf'
  },
]

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
    let start = this.tools.satinizeDate(new Date(this.date), true)
    let end = endOfDay(start)
    if (this.mode == 'all') {
      this.resume = await this.http.get<resumeModel>(`finances/${start.toISOString()}/${end.toISOString()}`).toPromise()
      return;
    }
    let filters = stringify({
      filters: {
        [this.mode == 'providers' ? 'business' : 'driver']: {
          id: this.target.id
        }
      }
    })
    this.resume = await this.http.get<resumeModel>(`finances/${start.toISOString()}/${end.toISOString()}?${filters}`).toPromise()

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
    if (this.mode != 'all') {
      props = {
        current: this.target,
        mode: this.mode,
        ...props
      }
    }

    this.tools.showModal({
      component: RegisterComponent,
      componentProps: props
    }).then(res => {
      if (res) {
        this.buildView()
      }
    })
  }




  public async download() {
    let builded = await this.tools.showModal({
      component: ViewDownloadComponent,
      cssClass: 'modal-dialogs',
      componentProps: {
        mode: 'builder',
      }
    })
    if (builded) {
      const { end, start, print, mode, target } = builded;
      this.buildRequest([start, end], mode, target, print)
    }
  }


  async buildRequest(day, mode, target, print) {

    const downloader = async (data, name) => {
      let mimeType = MimeTypes.find(e => e.name == print)
      let response = await this.http.postStream(mimeType.route, data).toPromise()
      let file = new Blob([response], { type: mimeType.type })
      var a = document.createElement("a"), url = URL.createObjectURL(file);
      a.href = url;
      a.download = `${name}${mimeType.extension}`;
      if (response) {
        a.click()
      }
    }
    const loading = await this.tools.showLoading('Descargando informacion...')
    try {
      let query: any = {
        mode: mode,
        day: day
      }
      if (mode != 'all') {
        query = {
          ...query,
          current: target
        }
      }

      await downloader(query, `${mode}_${format(new Date(), 'yyyy-MM-dd')}`)
      this.tools.showToast({
        message: 'Descarga completada!',
        color: 'success'
      })

    } catch (error) {
      console.error(error);
    } finally {
      loading.dismiss()
    }
  }

  between() {
    let startDate = this.tools.satinizeDate(new Date(this.date), true)
    let endDate = endOfDay(startDate);
    /* endDate = this.tools.satinizeDate(endDate) */
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
      delivery: 0,
      driver: 0
    }
  }

  getSueldo(): number {
    let deducible = this.resume.delivery * 0.25;
    let pendiente = this.resume.income - this.resume.discharge;
    let addons = this.resume.driver;
    if (pendiente < 0) return (this.resume.delivery - deducible) + pendiente + addons
    return (this.resume.delivery - deducible) + addons
  }

  getSaldo(): number {
    let egreso = this.resume.delivery + this.resume.discharge;
    //if (this.resume.ingreso >= egreso) return egreso - this.resume.ingreso
    return egreso - this.resume.income
  }

  getGastos() {
    return this.resume.driver;
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
  delivery: number,
  driver: number
}
