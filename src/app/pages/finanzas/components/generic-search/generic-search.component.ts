import { Component, OnInit, Output, Input, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { stringify } from 'qs';
import { IonPopover } from '@ionic/angular';
import { present } from '@ionic/core/dist/types/utils/overlays';
import { ConectionsService, Source } from 'src/app/services/connections.service';

@Component({
  selector: 'generic-search',
  templateUrl: './generic-search.component.html',
  styleUrls: ['./generic-search.component.scss'],
})
export class GenericSearchComponent implements OnInit {

  @Output() value = new EventEmitter<any>()
  @ViewChild('popover') popover!: IonPopover
  @Input() mode: string;
  @Input() searchID: string = 'searchBar'

  results: any[] = []


  sourceUser: Source = new Source(this.http)

  constructor(private http: ConectionsService) {
  }

  ngOnInit() {
    this.sourceUser.loading.subscribe(res => {
      if (res == false) {
        if (this.sourceUser.source.length == 0) {
          try {
            this.popover.dismiss()
          } catch (error) {
            console.log("IonPopover undefined")
          }
        }
      }
    })
  }

  ionViewDidEnter() {

  }

  ngOnDestroy(): void {
    // this.sourceUser.loading.unsubscribe()
  }

  onSearch(event: any) {
    const { value } = event.detail;
    if (value == '' || value.trim() == '') {
      return;
    }
    this.popover.present()
    this.sourceUser.setPath = `${this.getRoute()}?populate=*&` + stringify({
      filters: {
        $or: [
          {
            name: {
              $containsi: event.detail.value
            }
          },
          {
            lastname: {
              $containsi: event.detail.value
            }
          },
          {
            [this.mode == 'providers' ? 'business' : 'driver']: {
              name: {
                $containsi: event.detail.value
              }
            }
          }
        ]
      }
    })
  }

  selectUser(user: any) {
    this.popover.dismiss()
    if (this.mode == 'providers') {
      this.value.emit({
        id: user.id,
        name: `${user.attributes.name} ${user.attributes.lastname}`,
        business: user.attributes.business.data.attributes.name,
      })
    } else {
      this.value.emit({
        id: user.id,
        name: `${user.attributes.name} ${user.attributes.lastname}`,
      })
    }

  }

  getTitle(): string {
    return this.mode == 'providers' ? 'Proveedor' : 'Motorizado'
  }
  getRoute(): string {
    return `basic/${this.mode == 'providers' ? 'client' : 'driver'}`
  }
}
