import { ModalCrearEncomiendaComponent } from './../../../../generic-components/modal-crear-encomienda/modal-crear-encomienda.component';
import { ToolsService } from './../../../../../services/tools.service';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ConectionsService } from 'src/app/services/connections.service';
import { DetailsClientComponent } from 'src/app/pages/generic-components/details-client/details-client.component';
import * as qs from 'qs';
import { ModalStepsClientComponent } from 'src/app/pages/generic-components/modal-steps-client/modal-steps-client.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.components.scss'],
})

export class ClientesComponents implements OnInit {

  @ViewChild('opcionesRef') opcionesRef: TemplateRef<any>

  readonly rowHeight = 50;
  readonly headerHeight = 50;
  public selected = []
  public SelectionType = SelectionType

  public source: any[] = []
  private itemsChanges$: BehaviorSubject<any>
  private path: string
  private pagination: {
    start: number
    limit: number
    total?: number
  }

  public columns: any[]

  public loading: boolean
  public ColumnMode = ColumnMode;


  constructor(
    private conectionsService: ConectionsService,
    private el: ElementRef,
    private toolsService: ToolsService
  ) {

    this.columns = [{
      name: 'id',
      prop: 'id',
    },
    {
      name: 'nombre',
      prop: 'attributes.name',
    }]


    this.setPath = 'basic/client?populate=*'
    this.setPagination = {
      start: 0,
      limit: 25,
      total: 0
    }
    this.loading = false
  }

  onSelect($event) {
    this.showProfile($event.selected[0])
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
    this.getInformation()

  }

  public onSearchChange($event) {
    this.path = `basic/client?populate=*&${qs.stringify({
      filters: {
        $or: [
          {
            id: {
              $containsi: $event.detail.value
            }
          },
          {
            business: {
              name: {
                $containsi: $event.detail.value
              }
            }
          },
          {
            name: {
              $containsi: $event.detail.value
            }
          },
          {
            lastname: {
              $containsi: $event.detail.value
            }
          },
          {
            identification: {
              $containsi: $event.detail.value
            }
          }
        ]
      }
    })}`

    this.getInformation(true)

  }





  private async getInformation(clear: boolean = false) {
    this.loading = true;
    let loading = this.toolsService.showLoading()
    if (clear) {
      this.source = []
      this.setPagination = {
        start: 0,
        limit: 25,
        total: 0
      }
    }
    const { data, meta } = await this.getData(this.path + `&sort=id:ASC&pagination[start]=${this.source.length}&pagination[limit]=${this.pagination.limit}`)
    const { page, pageSize, pageCount, total } = meta.pagination
    this.pagination = meta.pagination
    this.source = [...this.source, ...data];
    (await loading).dismiss()
    this.loading = false;

    console.log(this.source);


  }

  private async getData(path: string) {
    return await this.conectionsService
      .get<any>(path)
      .pipe(delay(1000))
      .toPromise()
  }

  public onScroll(offsetY: number) {
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


  public async showProfile(user: any) {
    if (user.attributes.business.data == null) {

      this.toolsService.showModal({
        component: ModalStepsClientComponent,
        cssClass: ['modal-fullscreen'],
        keyboardClose: true,
        mode: 'ios',
        backdropDismiss: false,
        componentProps: {
          id: user.id,
          user: user
        }
      })
    } else {
      this.toolsService.showModal({
        component: DetailsClientComponent,
        cssClass: ['modal-fullscreen'],
        keyboardClose: true,
        mode: 'ios',
        backdropDismiss: false,
        componentProps: {
          id: user.id
        }
      })
    }
  }

  public async showCreateEncomienda(_id: number) {
    let _user = await this.conectionsService.get(`user/basic/${_id}?populate=*`).pipe(delay(500)).toPromise()
    await this.toolsService.showModal({
      component: ModalCrearEncomiendaComponent,
      cssClass: ['modal-fullscreen'],
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        userID: _id,
        _user: _user
      }
    })
  }

}
