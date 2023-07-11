
import { Input, Output, ViewChild } from "@angular/core";
import { Component, OnInit, EventEmitter, } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { InputChangeEventDetail, IonInput, IonSearchbar, IonSegment, IonSelect, SegmentCustomEvent, SelectCustomEvent } from "@ionic/angular";
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth, sub } from "date-fns";
import * as qs from "qs";
import { ConectionsService } from "src/app/services/connections.service";
import { ToolsService } from "src/app/services/tools.service";

@Component({
  selector: 'app-menu-filter',
  templateUrl: './menu-filter.component.html',
  styleUrls: ['./menu-filter.component.scss'],
})
export class MenuFilterComponent implements OnInit {

  @Input() path: string = '';
  @Input() public inputSearch: IonSearchbar;
  @Input() public segmentStatus: IonSegment;
  @Output() public urlGen: EventEmitter<string> = new EventEmitter();
  @ViewChild('dateRangeSelect') public dateRangeSelect: IonSelect
  @ViewChild('findSelect') public findSelect: IonSelect

  /* @ViewChild('viewStart') viewStart: IonInput
  @ViewChild('viewEnd') viewEnd: IonInput
 */
  inputStart = format(new Date(), 'yyyy-MM-dd')
  inputEnd = format(new Date(), 'yyyy-MM-dd')


  public qsObject: {
    filters: {
      shipping_status: {
        $containsi: ''
      },

      $or: { [key: string]: any }[]
    }
  } = {
      filters: {
        shipping_status: {
          $containsi: ''
        },

        $or: []
      }
    }

  constructor(private http: ConectionsService, private tools: ToolsService) { }

  ngOnInit(): void {



    this.segmentStatus
      .ionChange
      .subscribe(($event: CustomEvent<SegmentCustomEvent>) => {

        if ($event.detail['value'] == '') {
          // delete this.qsObject.filters.shipping_status
          // this.emit()

          // return
        }

        this.qsObject.filters.shipping_status.$containsi = $event.detail['value']
        this.emit()

      })

    this.inputSearch
      .ionChange
      .subscribe(($event: CustomEvent<InputChangeEventDetail>) => {
        if ($event.detail.value == '') {
          //this.qsObject.filters.$or = this.dateBuilder()
          this.qsObject.filters.$or = []
          this.emit()
          return
        }
        console.log(this.qsObject);
        this.qsObject.filters.$or = [...this.qsObject.filters.$or,
        {
          id: {
            $eqi: $event.detail.value
          }
        },
        {
          sender: {
            name: {
              $containsi: $event.detail.value
            }
          }
        },
        {
          sender: {
            lastname: {
              $containsi: $event.detail.value
            }
          }
        },
        {
          sender: {
            business: {
              name: {
                $containsi: $event.detail.value
              }
            }
          }
        },
        ]
        // emit
        this.emit()
      })
  }


  ngAfterViewInit() {

    // this.qsObject.filters.$or = this.dateBuilder();
    this.emit()
  }



  public dateRangeChange($event) {

    if ($event.detail.value != 4) {
      this.emit()
    }
  }



  private emit(value?) {
    let filters = JSON.parse(JSON.stringify(this.qsObject.filters))
    delete filters['$or'];
    this.urlGen.emit(`${qs.stringify({
      filters: {
        $and: [
          { $or: this.dateBuilder(value) },
          { $or: this.qsObject.filters.$or }
        ],
        ...filters
      }
    })}`)
  }


  private rangeToDate(range: number) {


    const dateHelper = (_dateStart: Date = new Date(), _dateEnd: Date = new Date(), month: boolean = false) => {

      if (month) {
        _dateEnd.setTime(_dateEnd.getTime() - _dateEnd.getTimezoneOffset() * 60000)


      } else {
        _dateEnd.setTime(_dateEnd.getTime() + _dateEnd.getTimezoneOffset() * 60000)


      }
      _dateStart.setTime(_dateStart.getTime() + _dateStart.getTimezoneOffset() * 60000)


      _dateStart = startOfDay(_dateStart);
      _dateEnd = endOfDay(_dateEnd);

      _dateStart.setTime(_dateStart.getTime() - _dateStart.getTimezoneOffset() * 60000)
      _dateEnd.setTime(_dateEnd.getTime() - _dateEnd.getTimezoneOffset() * 60000)


      return [
        _dateStart.toISOString(),
        _dateEnd.toISOString()
      ]
    }


    // console.table(dateHelper(sub(new Date(Date.now()), { days: 7 }), new Date(Date.now())))

    let start = startOfDay(new Date())
    let end = endOfDay(start)

    switch (range) {
      case 0:
        return [start.toISOString(), end.toISOString()]
      case 1:
        return [sub(start, { days: 7 }).toISOString(), end.toISOString()]
      case 2:
        return [startOfMonth(start).toISOString(), endOfMonth(end).toISOString()]
      //return dateHelper(startOfMonth(new Date()), endOfMonth(new Date()), true)
      case 3:
        return [sub(start, { months: 3 }).toISOString(), endOfMonth(end).toISOString()]
      //return dateHelper(sub(new Date(), { months: 3 }), endOfMonth(new Date()), true)

      default: {
        console.error('rangeToDate --> el valor');
        break;
      }
    }
  }

  /**
   * Hander}
   */

  dateBuilder(value?): any {
    return [
      {
        createdAt: {
          $between: value ? value : this.rangeToDate(this.dateRangeSelect.value)
        }
      }
      ,
      {
        delivered: {
          $between: value ? value : this.rangeToDate(this.dateRangeSelect.value)
        }
      }
    ]
  }


  onSearchDate() {

    const dateHelper = (_dateStart: Date = new Date(), _dateEnd: Date = new Date(), month: boolean = false) => {

      if (month) {
        _dateEnd.setTime(_dateEnd.getTime() - _dateEnd.getTimezoneOffset() * 60000)


      } else {
        _dateEnd.setTime(_dateEnd.getTime() + _dateEnd.getTimezoneOffset() * 60000)


      }
      _dateStart.setTime(_dateStart.getTime() + _dateStart.getTimezoneOffset() * 60000)


      _dateStart = startOfDay(_dateStart);
      _dateEnd = endOfDay(_dateEnd);

      _dateStart.setTime(_dateStart.getTime() - _dateStart.getTimezoneOffset() * 60000)
      _dateEnd.setTime(_dateEnd.getTime() - _dateEnd.getTimezoneOffset() * 60000)


      return [
        _dateStart.toISOString(),
        _dateEnd.toISOString()
      ]
    }
    let dateStart = this.tools.satinizeDate(new Date(this.inputStart), true)
    let dateEnd = this.tools.satinizeDate(new Date(this.inputEnd), true)

    if (dateEnd == dateStart) {
      this.emit([dateStart.toISOString(), endOfDay(dateEnd).toISOString()])
      return
    }

    if (dateEnd < dateStart) {
      console.error('Fecha final menor que la de inicio')
      return;
    }

    //this.emit(dateHelper(dateStart, dateEnd))
    this.emit([dateStart.toISOString(), endOfDay(dateEnd).toISOString()])

  }



  async genExcel() {
    let filters = JSON.parse(JSON.stringify(this.qsObject.filters))
    console.log(filters)
    delete filters['$or'];
    let request = {
      $and: [
        this.dateBuilder()[2],
        { $or: this.qsObject.filters.$or }
      ],
      ...filters
    }
    const loading = await this.tools.showLoading('Cargando informacion...')
    try {
      let response = await this.http.postStream(`report/query`, { query: request }).toPromise()
      let name = new Date().toString()
      let file = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      var a = document.createElement("a"), url = URL.createObjectURL(file);
      a.href = url;
      a.download = `${name}.xlsx`;
      // const response = await this.connectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
      a.click()
      this.tools.showToast({
        message: 'Descarga completada!',
        color: 'success'
      })
    } catch (error) {
      console.error(error);
    } finally {
      loading.dismiss()
    }

  }

}


