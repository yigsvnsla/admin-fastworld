import { ToolsService } from 'src/app/services/tools.service';
import { Component, ElementRef, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ConectionsService } from 'src/app/services/connections.service';
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

  public columns = [ {
    name: 'Paquete',
    prop: 'id',
  },{
    name: 'Categoria',
    prop: 'attributes.category',
  },{
    name: 'id',
    prop: 'attributes.shipping_status',
  },{
    name: 'id',
    prop: 'attributes.sender.data.attributes.basic.attributes.name',
  },{
    name: 'id',
    prop: 'attributes.',
  },{
    name: 'id',
    prop: 'attributes.',
  },]

  public loading: boolean
  public ColumnMode = ColumnMode;

  constructor(
    private conectionsService: ConectionsService,
    private el: ElementRef,
    private toolsService:ToolsService
  ) {
      
    this.setPath = 'admin/packages?filters[shipping_status][$notContains]=invalido&filters[shipping_status][$notContains]=entregado&populate=*&sort=id:ASC&'
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
        data:row
      }
    }).then(value => {
      if (value) {

        // this.user$.next(this.user)
      }
    })
  }

  public ngOnInit(): void {
    this.getInformation()
  }

  private async getInformation() {
    this.loading = true;
    const { data, meta } = await this.getData(this.path + `&pagination[start]=${this.source.length}&pagination[limit]=${this.pagination.limit}`)    
    const { page, pageSize, pageCount, total } = meta.pagination
    this.pagination = meta.pagination
    this.source = [...this.source, ...data]
    this.loading = false;    
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