import { ToolsService } from 'src/app/services/tools.service';
import { Component, ElementRef, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ConectionsService, SocketService } from 'src/app/services/connections.service';
import { ModalTransferPackageComponent } from 'src/app/pages/generic-components/modal-transfer-package/modal-transfer-package.component';

@Component({
  selector: 'app-activas',
  templateUrl: './activas.component.html',
  styleUrls: ['./activas.component.scss'],
})
export class ActivasComponent implements OnInit {

  readonly rowHeight = 50;
  readonly headerHeight = 50;

  public source: any[] = []
  private itemsChanges$: BehaviorSubject<any>
  private path: string
  private pagination: {
    start: number
    limit: number
    total?: number
  }


  public loading: boolean
  public ColumnMode = ColumnMode;

  constructor(
    private conectionsService: ConectionsService,
    private el: ElementRef,
    private toolsService:ToolsService,
    private socketService: SocketService
  ) {

    this.setPath = 'admin/packages?filters[shipping_status][$notContains]=invalido&filters[shipping_status][$notContains]=entregado&populate=*&sort=id:DESC&'
    this.setPagination = {
      start:0,
      limit:25,
      total:0
    }
    this.loading = false
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

  public onTransferPackage(row:any){
    this.toolsService.showModal({
      cssClass: ['modal-fit-content'],
      component: ModalTransferPackageComponent,
      keyboardClose: true,
      mode: 'ios',
      backdropDismiss: false,
      componentProps: {
        idPackage:row
      }
    }).then(value => {
      if (value) {

        // this.user$.next(this.user)
      }
    })
  }

  public ngOnInit(): void {
    this.socketService.on('product-updated', (product: any | any[]) => {
      const condition = (product.data.attributes.shipping_status == 'aceptado' || product.data.attributes.shipping_status == 'pendiente')
      console.log(product);

      if (condition) {
        // this.source.addItemToSource(product.data)
      }

      if (!condition) {
        // this.source.deleteItemToSource(product.data.attributes.id)
      }
    })
    this.socketService.on('product-created', (product: any | any[]) => {
      console.log(product);            // if (Array.isArray(product)) {
      product['data'].forEach((value) => {
        if (value.attributes.shipping_status == 'pendiente') {
          // this.source.addItemToSource(value)
        };
        if (value.attributes.shipping_status != 'pendiente') {
          // this.source.deleteItemToSource(value.id)
        }
      })

    })
    this.getInformation()
  }

  ionViewWillLeave() {
    /**
     * Important, remove all listener of the events used.
     */
    this.socketService.removeAllListeners('product-updated')
    this.socketService.removeAllListeners('product-created')
  }

  private async getInformation() {
    this.loading = true;
    const { data, meta } = await this.getData(this.path + `&pagination[start]=${this.source.length}&pagination[limit]=${this.pagination.limit}`)
    const { page, pageSize, pageCount, total } = meta.pagination
    this.pagination = meta.pagination
    this.source = [...this.source, ...data]
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
      if (!this.loading && this.source.length != 0 && this.source.length  >= this.pagination.total) {
        this.loading = false
        return
      }
      this.getInformation();
    }
    return


  }

}


// vista de la tabla columnas : ticket/ remitente / estado del paquete / contra entrega / repartidor / tiempo de retiro
