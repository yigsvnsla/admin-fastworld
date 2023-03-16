import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { stringify } from 'qs';
import { ViewRegisterComponent } from 'src/app/pages/generic-components/view-register/view-register.component';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-promp-user',
  templateUrl: './promp-user.component.html',
  styleUrls: ['./promp-user.component.scss'],
})
export class PrompUserComponent implements OnInit {

  @Input() mode: 'providers' | 'drivers' = 'providers'

  sourceUser: Source = new Source(this.http)


  constructor(private modal: ModalController, private http: ConectionsService, private tools: ToolsService) { }

  ngOnInit() {
    this.sourceUser.setPath = `${this.getRoute()}` + stringify({
      sort: 'name:ASC'
    })
  }


  onSearch(event: any) {
    const { value } = event.detail
    this.sourceUser.setPath = `${this.getRoute()}` + stringify({
      filters: {
        name: {
          $containsi: value
        }
      },
      sort: 'name:ASC'
    })
  }

  getRoute(): string {
    console.log(this.mode)
    return `basic/${this.mode == 'providers' ? 'client' : 'driver'}?populate=*&`
  }


  close() {
    this.modal.dismiss()
  }

  selectUser(user: any) {
    if (this.mode == 'providers') {
      this.modal.dismiss({
        id: user.id,
        name: `${user.attributes.name} ${user.attributes.lastname}`,
        business: user.attributes.business.data.attributes.name,
      })
    } else {
      this.modal.dismiss({
        id: user.id,
        name: `${user.attributes.name} ${user.attributes.lastname}`,
      })
    }
  }

  getTitle(): string {
    return this.mode == 'providers' ? 'Proveedor' : 'Motorizado'
  }

  showRegister() {
    let role = this.mode == 'providers' ? 'client' : 'driver'

    this.tools.showModal({
      component: ViewRegisterComponent,
      componentProps: {
        role,
        skipAlert: true
      }
    }).then(res => {
      if (res) {
        if (res.finished) {
          this.modal.dismiss(res.user)
        }
      }
    })
  }

}
