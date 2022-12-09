import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { stringify } from 'qs'

@Component({
  selector: 'pagos-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss'],
})
export class ResumenComponent implements OnInit, OnChanges {

  @Input() id: number;

  user: any = {};
  validUser = false
  pagos = new Source(this.http)

  constructor(private http: ConectionsService, private tools: ToolsService) { }

  ngOnInit() {
    //this.fetchUser()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fetchUser()
  }


  async fetchUser() {
    let loading = await this.tools.showLoading('Obteniendo informacion...');
    try {
      this.user = await this.http.get(`payments/${this.id}`).toPromise();
      this.pagos.setPath = `payments/history/${this.user.id}`
      this.validUser = true
      console.log(this.user)
    } catch (error) {
      console.log('Error al obtener informacion', error)
    } finally {
      loading.dismiss()
    }
  }

}
