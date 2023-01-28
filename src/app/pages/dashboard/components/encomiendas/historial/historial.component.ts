import { ToolsService } from 'src/app/services/tools.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ConectionsService } from '../../../../../services/connections.service';
import { delay } from 'rxjs/operators';
import { Component, ElementRef, OnInit } from '@angular/core';
import { DetailsPackageComponent } from 'src/app/pages/generic-components/details-package/details-package.component';
import { DetailsClientComponent } from 'src/app/pages/generic-components/details-client/details-client.component';
import { DetailsDriverComponent } from 'src/app/pages/generic-components/details-driver/details-driver.component';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {

  readonly rowHeight = 50;
  readonly headerHeight = 30;
  public source: any[] = []
  public path: string
  public query: string
  private pagination: {
    start: number
    limit: number
    total?: number
  }

  public columns = [{
    name: 'id',
    prop: 'id',
  }, {
    name: 'Categoria',
    prop: 'attributes.category',
  }, {
    name: 'Remitente',
    prop: 'attributes.shipping_status',
  },]
  public segments: any[]
  public loading: boolean
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType

  // test($event){
  // console.log($event);
  // this.setPagination = {
  //   start: 0,
  //   limit: 25
  // }
  // this.setPath = 'admin/packages?populate=*&sort=id:DESC&'+$event
  // this.getInformation()
  // }

  constructor(
    private toolsService: ToolsService,
    private conectionsService: ConectionsService,
    private el: ElementRef
  ) {
    this.setPath = 'admin/packages?populate=*&sort=id:DESC&'
    this.query = ''
    this.setPagination = {
      start: 0,
      limit: 100,
      total: 0
    }
    this.loading = false;

    this.segments = [
      {
        name: 'Todos',
        icon: '',
        color: 'medium',
        value: ''

      }, {
        name: 'Pendientes',
        icon: '',
        color: 'dark',
        value: 'pendiente'
      }, {
        name: 'Aceptados',
        icon: '',
        color: 'tertiary',
        value: 'aceptado'
      }, {
        name: 'Recibidos',
        icon: '',
        color: 'primary',
        value: 'recibido'
      }, {
        name: 'Entregados',
        icon: '',
        color: 'success',
        value: 'entregado'
      }, {
        name: 'Reportados',
        icon: '',
        color: 'danger',
        value: 'rechazado',
      },
      {
        name: 'Sin Confirmar',
        icon: '',
        color: 'warning',
        value: 'invalido'
      },

    ]
  }

  public get getPagination(): {
    start: number
    limit: number
    total?: number
  } { return this.pagination }

  public set setPagination(v: {
    start: number
    limit: number
    total?: number
  }) { this.pagination = v; }

  public set setPath(v: string) {
    this.path = v;
  }

  public ngOnInit(): void {


  }


  public getFilter($event: string) {
    // console.log($event);
    this.query = $event;
    this.getInformation(true)
  }

  private async getInformation(clear: boolean = false) {
    this.loading = true;
    let loading = this.toolsService.showLoading()
    if (clear) {
      this.source = []
      this.setPagination = {
        start: 0,
        limit: 100,
        total: 0
      }
    }
    const { data, meta } = await this.getData(this.path + this.query + `&pagination[start]=${this.source.length}&pagination[limit]=${this.pagination.limit}`)
    this.pagination = meta.pagination
    console.log(data);

    if (this.pagination.start == 0) {
      this.source = data
    } else {
      this.source = [...this.source, ...data]
    }
    (await loading).dismiss()
    this.loading = false;
  }

  private async getData(path: string) {
    return await this.conectionsService
      .get<any>(path)
      .pipe(delay(1000))
      .toPromise()
  }

  public onScroll({offsetY, offsetX}) {
    if(offsetX >= 0) return;

    // total height of all rows in the viewport
    const viewHeight = this.el.nativeElement.getBoundingClientRect().height - this.headerHeight;
    // check if we scrolled to the end of the viewport
    if (!this.loading && offsetY + viewHeight >= this.source.length * this.rowHeight) {
      if (!this.loading && this.source.length != 0 && this.source.length >= this.pagination.total) {
        this.loading = false
        return
      }
      this.getInformation();
    }
    return
  }

  public onSearchPackage(_id: number) {

    this.toolsService.showModal({
      component: DetailsPackageComponent,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        id: _id
      }
    }).then((val) => {
      if (val) {
        let tempArr = this.source.map((value, index, arr) => {
          let _refValue: any = value
          if (_refValue.id == _id) _refValue = { ..._refValue, ...val }
          return _refValue
        })
        this.source = [...tempArr]
      }
    })

  }

  public showProfileClient(_id: number) {
    this.toolsService.showModal({
      component: DetailsClientComponent,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        id: _id
      }
    })
  }

  public showProfileDriver(_id: number) {
    this.toolsService.showModal({
      component: DetailsDriverComponent,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        id: _id
      }
    })
  }

  public onTransferPackage(_id: number) {

  }

  public onDonwloadInfoPackage(_id: number) {

  }

  public onDeletePackage(_id: number) {

  }
}

