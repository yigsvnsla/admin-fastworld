
import { Input, Output, ViewChild } from "@angular/core";
import { Component, OnInit, EventEmitter, } from "@angular/core";
import { InputChangeEventDetail, IonInput, IonSearchbar, IonSegment, IonSelect, SegmentCustomEvent, SelectCustomEvent } from "@ionic/angular";
import { endOfMonth, startOfMonth, sub } from "date-fns";
import * as qs from "qs";

@Component({
  selector: 'app-menu-filter',
  templateUrl: './menu-filter.component.html',
  styleUrls: ['./menu-filter.component.scss'],
})
export class MenuFilterComponent implements OnInit {

  @Input() path: string = '';
  @Input() public inputSearch: IonInput;
  @Input() public segmentStatus:IonSegment;
  @Output() public urlGen: EventEmitter<string> = new EventEmitter();
  @ViewChild('dateRangeSelect') public dateRangeSelect: IonSelect
  @ViewChild('findSelect') public findSelect: IonSelect
  public qsObject: any = {
    filters: {
      createdAt: {
        $between: []
      },
      shipping_status:{
        $containsi:''
      },


      $or: []
    }
  }

  constructor( ) { }

  ngOnInit(): void {

    this.segmentStatus
      .ionChange
      .subscribe(($event:CustomEvent<SegmentCustomEvent>)=>{

        if($event.detail['value'] == '') {
          delete this.qsObject.filters.shipping_status
          // this.emit()

          return
        }

        this.qsObject.filters.shipping_status.$containsi = $event.detail['value']
        this.emit()

      })

    this.inputSearch
      .ionChange
      .subscribe(($event: CustomEvent<InputChangeEventDetail>) => {
        if ($event.detail.value == '') {
          delete this.qsObject.filters.$or
          return
        }

        this.qsObject.filters.$or = [
          {
            id: {
              $containsi: $event.detail.value
            }
          },
          {
            sender: {
              basic: {
                name:{
                  $containsi: $event.detail.value
                }
              }
            }
          },
          {
            sender: {
              basic: {
                lastname:{
                  $containsi: $event.detail.value
                }
              }
            }
          },
          {
            sender: {
              basic: {
                business:{
                  name:{
                    $containsi: $event.detail.value
                  }
                }
              }
            }
          },
          // {
          //   name: {
          //     $containsi: $event.detail.value
          //   }
          // },
          // {
          //   lastname: {
          //     $containsi: $event.detail.value
          //   }
          // },
          // {
          //   identification: {
          //     $containsi: $event.detail.value
          //   }
          // }
        ]
        // emit
        this.emit()
      })
  }


  ngAfterViewInit() {

    this.qsObject.filters.createdAt.$between = this.rangeToDate(this.dateRangeSelect.value)
    console.log(this.qsObject.filters.createdAt.$between);
    // emit
    this.emit()
  }


  public dateRangeChange($event) {
    this.qsObject.filters.createdAt.$between = this.rangeToDate($event.detail.value)
    // emit
    this.emit()
  }


  private emit(){
    this.urlGen.emit(`${qs.stringify(this.qsObject)}`)
  }


  private rangeToDate(range: number) {
    switch (range) {
      case 0:
        return [
          new Date(new Date().getFullYear(), new Date().getMonth(),
            new Date().getDate()).toISOString(), new Date(Date.now()).toISOString()
        ]
      case 1:
        return [
          sub(new Date(Date.now()), { days: 7 }).toISOString(),
          new Date(Date.now()).toISOString()
        ]
      case 2:
        return [
          startOfMonth(new Date(Date.now())).toISOString(),
          endOfMonth(new Date(Date.now())).toISOString()
        ]
      case 3:
        return [
          startOfMonth(sub(new Date(Date.now()), { months: 3 })).toISOString(),
          endOfMonth(new Date(Date.now())).toISOString()
        ]
      default: { console.error('rangeToDate --> el valor'); }
    }
  }



  // public async getExport(type:string){
  //     const send = async () => {
  //         const loading = await this.toolsServices.showLoading('Cargando informacion...')
  //         try {
  //           let response = await this.connectionsService.postStream('report/8', {hola: "Holaa"}).toPromise()
  //           let file = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  //           var a = document.createElement("a"), url = URL.createObjectURL(file);
  //           a.href = url;
  //           a.download = "prueba.xlsx";

  //             // const response = await this.connectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
  //             if (response) {
  //                 await this.toolsServices.showAlert({
  //                     cssClass: 'alert-success',
  //                     keyboardClose: true,
  //                     mode: 'ios',
  //                     header: 'Exito',
  //                     buttons: [{ text: 'Aceptar', handler: ()=> a.click() }]
  //                 })
  //             }
  //         } catch (error) {
  //             console.error(error);
  //         } finally {
  //             loading.dismiss()
  //         }
  //     }

  //     await this.toolsServices.showAlert({
  //         cssClass: 'alert-success',
  //         keyboardClose: true,
  //         mode: 'ios',
  //         header: 'Descargar ' + type,
  //         buttons: ['Cancelar', { text: 'Aceptar', handler: () => send()}]
  //     })
  // }
}


