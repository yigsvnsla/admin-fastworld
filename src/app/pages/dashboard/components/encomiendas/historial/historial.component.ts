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
  readonly headerHeight = 50;
  public source: any[] = []
  private path: string
  private pagination: {
    start: number
    limit: number
    total?: number
  }

  public columns = [ {
    name: 'id',
    prop: 'id',
  },{
    name: 'Categoria',
    prop: 'attributes.category',
  },{
    name: 'Remitente',
    prop: 'attributes.shipping_status',
  },]

  public loading: boolean
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType

  test($event){
    console.log($event);
    this.setPagination = {
      start: 0,
      limit: 25
    }
    this.setPath = 'admin/packages?populate=*&sort=id:DESC&'+$event
    this.getInformation()
  }

  constructor(
    private toolsService:ToolsService,
    private conectionsService: ConectionsService,
    private el: ElementRef
  ) {




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

  public ngOnInit(): void {


  }

  private async getInformation() {
    this.loading = true;
    const { data, meta } = await this.getData(this.path + `&pagination[start]=${this.pagination.start}&pagination[limit]=${this.pagination.limit}`)
    this.pagination = meta.pagination
    if(this.pagination.start == 0){
      this.source = data
    }else{
      this.source = [...this.source, ...data]
    }
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

  public onSearchPackage(_id:number){
    this.toolsService.showModal({
      component:DetailsPackageComponent,
      cssClass:['modal-fullscreen'],
      keyboardClose:true,
      mode:'ios',
      backdropDismiss:false,
      componentProps:{
        id:_id
      }
    })
  }

  public showProfileClient(_id:number){
    this.toolsService.showModal({
      component:DetailsClientComponent,
      cssClass:['modal-fullscreen'],
      keyboardClose:true,
      mode:'ios',
      backdropDismiss:false,
      componentProps:{
        id:_id
      }
    })
  }

  public showProfileDriver(_id:number){
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

  public onTransferPackage(_id:number){

  }

  public onDonwloadInfoPackage(_id:number){

  }

  public onDeletePackage(_id:number){

  }





  // @ViewChild('progressBar') progressBar: IonProgressBar;
  // @ViewChild('limitSelect') limitSelect: IonSelect;
  // @ViewChild('ngxTable') ngxTable : DatatableComponent

  // public isLoading: number;
  // public pageNumber: number;
  // public row$: Observable<any>;

  // public dateValue1:string
  // public dateValue2:string

  // private qsQuery:any

  // constructor(
  //   private conectionsService: ConectionsService,
  //   private toolsService: ToolsService
  // ) {
  //   this.isLoading = 0;
  //   this.pageNumber = 0;
  // }

  // //////////////////////////
  // // lifeHooks
  // /////////////////////////
  // public ngOnInit() {
  //   this.dateValue1 = format(startOfMonth(new Date(Date.now())), 'yyyy-MM-dd')
  //   this.dateValue2 = format(new Date(Date.now()), 'yyyy-MM-dd')
  // }

  // public ionViewDidEnter() {
  //   this.rangeToDate(3)
  // }

  // /////////////////////////
  // // onChanges / events
  // ////////////////////////
  // public dateValueChange1($event:Event){
  //   this.dateValue1 = ($event as CustomEvent).detail.value;
  // }

  // public dateValueChange2($event:Event){
  //   this.dateValue2 = ($event as CustomEvent).detail.value;
  // }

  // public limitSelectChange($event:Event){
  // //   this.limitSelect.value == ($event as CustomEvent).detail.value
  // //   this.request({pagination:{...this.qsQuery.pagination, pageSize:($event as CustomEvent).detail.value}})
  // }

  // public onSort($event:any,rows){
  // //   this.progressBar['el'].hidden = false;
  // //   this.conectionsService
  // //     .get(`users?${qs.stringify({...this.qsQuery,...{sort:[`${( $event.column.prop as string ).includes('.')? ( $event.column.prop as string ).slice( ( $event.column.prop as string ).indexOf('.') + 1 ) : $event.column.prop }:${ $event.newValue }`]}},{  encode:false  })}&populate=*`)
  // //     .subscribe(res=>{
  // //       this.progressBar['el'].hidden = true;
  // //       rows.data = (res.data as any)
  // //     })
  // }

  // public onSearchChange($event:any){
  // //   if ((this.qsQuery.filters as Object).hasOwnProperty('id') && ($event as CustomEvent).detail.value == '') {
  // //     delete this.qsQuery.filters.id
  // //     this.request(this.qsQuery)
  // //   }
  // //   if(($event as CustomEvent).detail.value != '')    {
  // //     this.request({filters:{ ...this.qsQuery.filters,id:{$containsi:($event as CustomEvent).detail.value}}})
  // //   }
  // }

  // public setPage(pageInfo: { offset: number,  pageSize: number,  limit: number,  count: number  }){
  // //   this.request({pagination:{...this.qsQuery.pagination, page:pageInfo.offset + 1 }})
  // }

  // public async rangeToDate($event:any) {
  // //   switch (typeof $event === 'number'?$event : ($event as CustomEvent).detail.value) {
  // //     case 0:
  // //       this.request({ filters:{  createdAt:{ $between: [new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()).toISOString(),new Date(Date.now()).toISOString()]}}})
  // //       break;
  // //     case 1:
  // //       this.request({ filters:{  createdAt:{ $between: [sub(new Date(Date.now()),{days:7}).toISOString(),new Date(Date.now()).toISOString()]}}})
  // //       break
  // //     case 2:
  // //       this.request({ filters:{  createdAt:{ $between: [startOfMonth(new Date(Date.now())).toISOString(),endOfMonth(new Date(Date.now())).toISOString()]}}})
  // //       break
  // //     case 3:
  // //       this.request({ filters:{  createdAt:{ $between: [startOfMonth(sub(new Date(Date.now()),{months:3})).toISOString(),endOfMonth(new Date(Date.now())).toISOString()]}}})
  // //       break;
  // //   }
  // }

  // // ////////////////////////
  // // // Miselaneus
  // // ////////////////////////
  // public formatDate(iso:string) : string {
  //   return format(parseISO(iso),'dd/MM/yyyy - hh:mm b')
  // }

  // // public modal(user?:any) {
  // //   // this.toolsService
  // //   //   .showModal({
  // //   //     component: UsuariosFormComponent,
  // //   //     componentProps:{
  // //   //       inputUser:user
  // //   //     }
  // //   //   });
  // // }

  // public rangeToDateSearch(){
  // //   let x1 = parse(this.dateValue1,'yyyy-MM-dd',new Date(Date.now()));
  // //   let x2 = parse(this.dateValue2,'yyyy-MM-dd',new Date(Date.now()));
  // //   if (isAfter(x1,x2)  || isBefore(x2,x1)) {
  // //     this.toolsService
  // //       .showAlert({
  // //         cssClass:'alert-danger',
  // //         backdropDismiss:false,
  // //         header:'🛑 Limites de Fechas',
  // //         subHeader:'las fechas ingresadas estan fuera del rango de busqueda',
  // //         buttons:[{
  // //           text:'aceptar',
  // //           handler:()=>{
  // //             this.dateValue1 = format(startOfMonth(new Date(Date.now())), 'yyyy-MM-dd')
  // //             this.dateValue2 = format(new Date(Date.now()), 'yyyy-MM-dd')
  // //           }
  // //         }]
  // //       })
  // //   }else{
  // //     this.request({pagination:{...this.qsQuery.pagination, page:1 }, filters:{  createdAt:{ $between: [parse(this.dateValue1,'yyyy-MM-dd',new Date(Date.now())).toISOString(),parse(this.dateValue2,'yyyy-MM-dd',new Date(Date.now())).toISOString()]}}})
  // //   }
  // }

  // // private request(_qs:any){
  // //   this.qsQuery = {
  // //     sort:['id:DESC'],
  // //     pagination:{  page:this.pageNumber + 1, pageSize:this.limitSelect.value },
  // //     ...this.qsQuery,
  // //     ..._qs,
  // //   }
  // //   // console.log(this.qsQuery);
  // //   this.row$ = this.conectionsService
  // //   .get(`users?${qs.stringify({...this.qsQuery},{  encode:false  })}&populate=*`)
  // //   .pipe(
  // //     tap(x=>{
  // //       console.log('response -> ',x);
  // //       // console.log('query -> ',{...this.qsQuery,..._qs});
  // //       // console.log('qs -> ','lotes?'+qs.stringify({...this.qsQuery,..._qs},{  encode:false  }));

  // //       this.progressBar['el'].hidden = true
  // //     })
  // //   );
  // // }

  // // public deleteUser(id:number){
  // //   this.toolsService
  // //     .showAlert({
  // //       cssClass:'alert-danger',
  // //       header:'🛑 Alerta',
  // //       subHeader:'¿Seguro de eliminar a este usuario?',
  // //       buttons:['No',{
  // //         text:'Si',
  // //         handler:async ()=>{
  // //           console.log(id);

  // //           // let loading = (await this.toolsService.showLoading())
  // //           // this.conectionsService
  // //           //   .put(`user/${id}`,{deleted:true})
  // //           //   .subscribe(res=>{},err=>{},()=>{
  // //           //     loading.dismiss()
  // //           //   })

  // //         }
  // //       }]
  // //     })
  // // }
  // ///////////////////////////////////////////////////////
}
