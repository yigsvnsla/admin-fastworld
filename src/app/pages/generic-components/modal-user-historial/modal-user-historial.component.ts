import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { delay } from 'rxjs/operators';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { DetailsClientComponent } from '../details-client/details-client.component';
import { DetailsDriverComponent } from '../details-driver/details-driver.component';
import { DetailsPackageComponent } from '../details-package/details-package.component';
import { stringify } from 'qs'

@Component({
  selector: 'modal-user-historial',
  templateUrl: 'modal-user-historial.component.html',
  styleUrls: ['modal-user-historial.component.scss']
})

export class ModalUserHistorial implements OnInit {

  @Input() public id: number
  @Input() public prefix: string
  readonly rowHeight = 50;
  readonly headerHeight = 50;
  public source: any[] = []
  private path: string
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

  public loading: boolean
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType

  test($event) {

  }

  constructor(
    private toolsService: ToolsService,
    private conectionsService: ConectionsService,
    private el: ElementRef
  ) {
    this.setPagination = {
      start: 0,
      limit: 25,
      total: 0
    }
    this.loading = false
  }

  buildUser() {
    return stringify({
      sort: 'id:DESC',
      populate: '*',
      filters: {
        sender: {
          basic: this.id
        }
      }
    })
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

    // console.log($event);
    this.setPagination = {
      start: 0,
      limit: 25
    }
    this.setPath = `packages?${this.buildUser()}`
    this.getInformation()
  }

  private async getInformation() {
    this.loading = true;
    let loading = this.toolsService.showLoading()
    const { data, meta } = await this.getData(this.path + `&pagination[start]=${this.source.length}&pagination[limit]=${this.pagination.limit}`)
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
    })
  }

  // public showProfileClient(_id:number){
  //   this.toolsService.showModal({
  //     component:DetailsClientComponent,
  //     cssClass:['modal-fullscreen'],
  //     keyboardClose:true,
  //     mode:'ios',
  //     backdropDismiss:false,
  //     componentProps:{
  //       id:_id
  //     }
  //   })
  // }

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
