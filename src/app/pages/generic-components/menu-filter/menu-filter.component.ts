
import { Input, Output, ViewChild } from "@angular/core";
import { Component, OnInit, EventEmitter, } from "@angular/core";
import { InputChangeEventDetail, IonInput, IonSearchbar, IonSegment, IonSelect, SegmentCustomEvent, SelectCustomEvent } from "@ionic/angular";
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth, sub } from "date-fns";
import * as qs from "qs";

@Component({
  selector: 'app-menu-filter',
  templateUrl: './menu-filter.component.html',
  styleUrls: ['./menu-filter.component.scss'],
})
export class MenuFilterComponent implements OnInit {

  @Input() path: string = '';
  @Input() public inputSearch: IonInput;
  @Input() public segmentStatus: IonSegment;
  @Output() public urlGen: EventEmitter<string> = new EventEmitter();
  @ViewChild('dateRangeSelect') public dateRangeSelect: IonSelect
  @ViewChild('findSelect') public findSelect: IonSelect

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

  constructor() { }

  ngOnInit(): void {



    this.segmentStatus
      .ionChange
      .subscribe(($event: CustomEvent<SegmentCustomEvent>) => {

        if ($event.detail['value'] == '') {
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
            basic: {
              name: {
                $containsi: $event.detail.value
              }
            }
          }
        },
        {
          sender: {
            basic: {
              lastname: {
                $containsi: $event.detail.value
              }
            }
          }
        },
        {
          sender: {
            basic: {
              business: {
                name: {
                  $containsi: $event.detail.value
                }
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
    /* const or = this.qsObject.filters.$or;
    const changes = this.dateBuilder()
    this.qsObject.filters.$or = or.map(e=>{
      let key = Object.keys(e)[0];
      let element = {}
      for (const item of changes) {
        if(Object.prototype.hasOwnProperty.call(item, key)){
          element = {[key]: item[key]}
        }
      }
      return this._isEmpty(element) ? e : element

    }) */


    if($event.detail.value != 4){
      this.emit()
    }
  }


  /* onDateChange($event,target){
    if (target != 'start'){
      this.inputEnd =
    }
  } */


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


    switch (range) {
      case 0:
        return dateHelper();
      case 1:
        return dateHelper(sub(new Date(Date.now()), { days: 7 }))
      case 2:
        return dateHelper(startOfMonth(new Date()), endOfMonth(new Date()), true)
      case 3:
        return dateHelper(sub(new Date(), { months: 3 }), endOfMonth(new Date()), true)
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
        updatedAt: {
          $between: value ? value : this.rangeToDate(this.dateRangeSelect.value)
        }
      },
      {
        createdAt: {
          $between: value ? value : this.rangeToDate(this.dateRangeSelect.value)
        }
      }
      ,
      {
        delivered: {
          $between: value ? value :  this.rangeToDate(this.dateRangeSelect.value)
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
    let dateStart = new Date(this.inputStart)
    let dateEnd = new Date(this.inputEnd)

    if (dateEnd < dateStart) {
      console.error('Fecha final menor que la de inicio')
      return;
    }

    this.emit(dateHelper(dateStart, dateEnd))

  }

}


