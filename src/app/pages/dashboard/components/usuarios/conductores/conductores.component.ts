import { ToolsService } from 'src/app/services/tools.service';
import { Component, ElementRef, OnInit,} from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { delay } from 'rxjs/operators';
import { ConectionsService } from 'src/app/services/connections.service';
import { DetailsDriverComponent } from 'src/app/pages/generic-components/details-driver/details-driver.component';
import * as qs from 'qs';

@Component({
    selector: 'app-conductores',
    templateUrl: './conductores.component.html',
    styleUrls: ['./conductores.component.scss'],
})

export class ConductoresComponents implements OnInit{


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
    },
    {
      name: 'nombre',
      prop: 'attributes.name',
    }]

    public loading: boolean
    public ColumnMode = ColumnMode;


    constructor(
      private conectionsService: ConectionsService,
      private el: ElementRef,
      private toolsService:ToolsService
    ) {
      this.loading = false
      this.setPath = 'basic/driver?populate=*'
      this.setPagination = {
        start: 0,
        limit: 25,
        total: 0
      }
    }

    //////

    public showProfile(_id:number){
      this.toolsService.showModal({
        component:DetailsDriverComponent,
        cssClass:['modal-fullscreen'],
        keyboardClose:true,
        mode:'ios',
        backdropDismiss:false,
        componentProps:{
          id:_id
        }
      })
    }

    /////
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
      this.path = `basic/driver?populate=*&${qs.stringify({
        filters: {
          $or: [
            {
              id:{
                $containsi:$event.detail.value
              }
            },
            {
              name: {
                $containsi: $event.detail.value
              }
            } ,
            {
              lastname: {
                $containsi: $event.detail.value
              }
            } ,
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
      if(clear) {
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
}
