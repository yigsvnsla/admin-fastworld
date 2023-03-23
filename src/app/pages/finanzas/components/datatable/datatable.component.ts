import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ConectionsService } from 'src/app/services/connections.service';

@Component({
  selector: 'records',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
})
export class DatatableComponent implements OnInit, OnChanges {

  readonly rowHeight = 50;
  readonly headerHeight = 50;
  public source: any[] = []
  private path: string = ''
  private pagination: paginationModel = {
    start: 0,
    limit: 25,
    total: 0
  }

  @Input() columns: any
  public loading: boolean = false;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  public get getPagination(): paginationModel { return this.pagination }
  public set setPagination(v: paginationModel) { this.pagination = v; }

  @Input() parentPath: string = ''
  @Input() egreso: boolean = true;
  @Input() set setPath(v: string) {
    if (v == '' || v == undefined) return;
    this.path = v;
    this.forceUpdate()
  }

  @Output() select: EventEmitter<any> = new EventEmitter()



  constructor(
    private conectionsService: ConectionsService,
    private el: ElementRef) {
  }

  ngOnInit() {
    this.setPath = this.parentPath
  }

  onSelect(event: any) {
    const { id } = event.selected[0];
    this.select.emit(event.selected[0])
  }

  ngOnChanges(changes: SimpleChanges) {
    /* console.log("Changed parent", this.path)
    this.pagination = {
      start: 0,
      limit: 25,
      total: 0
    }
    this.getInformation(true) */
  }

  async forceUpdate() {
    this.pagination = {
      start: 0,
      limit: 25,
      total: 0
    }
    this.getInformation(true)
  }

  private async getInformation(clear = false) {
    this.loading = true;
    /* let loading = this.toolsService.showLoading() */
    const { data, meta } = await this.getData(`pagination[start]=${this.pagination.total}&pagination[limit]=${this.pagination.limit}&sort=id:DESC`)
    this.pagination = meta.pagination
    this.setPagination = {
      start: this.source.length,
      limit: 25,
      total: this.source.length + meta.total
    }
    if (clear) {
      this.pagination = {
        start: 0,
        limit: 25,
        total: 0
      }
      this.source = data;
    }
    else this.source = [...this.source, ...data];
    /* (await loading).dismiss() */
    this.loading = false;
  }
  private async getData(route: any) {
    let path = ''
    if (this.path.includes('?')) {
      path = this.path + `&${route}`
    } else {
      path = this.path + `?${route}`
    }
    return await this.conectionsService
      .get<any>(path).toPromise()
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


  /* Optionals helpres */
  getFullDate(value: string) {
    let date = new Date(value);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60000)
    return format(date, 'yyyy-MM-dd')
  }

}
interface paginationModel {
  start: number
  limit: number
  total: number
}

