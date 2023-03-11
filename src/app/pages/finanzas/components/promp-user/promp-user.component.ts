import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { stringify } from 'qs';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-promp-user',
  templateUrl: './promp-user.component.html',
  styleUrls: ['./promp-user.component.scss'],
})
export class PrompUserComponent implements OnInit {

  @Input() target: 'providers' | 'drivers' = 'providers'

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
    return `basic/${this.target == 'providers' ? 'client' : 'driver'}?populate=*&`
  }


  close() {
    this.modal.dismiss()
  }

  selectUser(user: any) {
    console.log(user)
    this.modal.dismiss(
      {
        id: user.attributes.business.data.id,
        name: `${user.attributes.name} ${user.attributes.lastname}`,
        business: user.attributes.business.data.attributes.name,
      }
    )
  }

  getTitle(): string {
    return this.target == 'providers' ? 'Proveedor' : 'Motorizado'
  }

}
