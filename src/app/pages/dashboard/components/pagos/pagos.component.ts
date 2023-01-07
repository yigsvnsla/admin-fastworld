import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { stringify } from 'qs'
import { delay } from 'rxjs/operators';
import { ResumenComponent } from './components/resumen/resumen.component';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PagosComponent implements OnInit {

  @ViewChild('searchBar') searchBar: any

  /* user = 8; */
  readonly rowHeight = 50;
  readonly headerHeight = 50;
  public source: any[] = []
  private path: string
  private pagination: paginationModel = {
    start: 0,
    limit: 25,
    total: 0
  }
  public loading: boolean = false;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType
  public get getPagination(): paginationModel { return this.pagination }
  public set setPagination(v: paginationModel) { this.pagination = v; }

  set setPath(v: string) {
    if (v == '' || v == undefined) return;
    this.path = `${v}?${this.buildUser()}`;
    this.pagination = {
      start: 0,
      limit: 25,
      total: 0
    }
    this.getInformation(true)
  }


  constructor(private http: ConectionsService, private tools: ToolsService, private el: ElementRef) { }

  ngOnInit() {
    this.setPath = 'business/payments'
  }

  buildUser() {
    return stringify({
      sort: 'id:DESC',
      populate: '*'
    })
  }


  /**
   * DataTable
   */

  private async getInformation(clear = false) {
    this.loading = true;
    /* let loading = this.toolsService.showLoading() */
    const { data, meta } = await this.getData(  `&pagination[start]=${this.pagination.total}&pagination[limit]=${this.pagination.limit}&sort=id:DESC`)
    this.pagination = meta.pagination
    this.setPagination = {
      start: this.source.length,
      limit: 25,
      total: this.source.length + meta.total
    }
    if(clear) this.source = data;
    else this.source = [...this.source, ...data];
    /* (await loading).dismiss() */
    console.log(data)
    this.loading = false;
  }

  private async getData(route) {
    let path = ''
    if (this.path.includes('?')) {
      path = this.path + `&${route}`
    } else {
      path = this.path + `?${route}`
    }
    return await this.http
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

  public onSelect({ selected }) {
    this.tools.showModal({
      component: ResumenComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        id: selected[0].id
      }
    }).then(res => {
      this.setPath = 'business/payments'
    })
  }

  integer(value) {
    return parseInt(value)
  }
}

interface paginationModel {
  start: number
  limit: number
  total?: number
}

