import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { endOfDay, format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-view-download',
  templateUrl: './view-download.component.html',
  styleUrls: ['./view-download.component.scss'],
})
export class ViewDownloadComponent implements OnInit {

  @Input() user: number

  public reportForm: FormGroup


  constructor(
    private formBuilder: FormBuilder,
    private toolsService: ToolsService,
    private http: ConectionsService,
    private modal: ModalController) { }

  ngOnInit() {
    this.reportForm = this.formBuilder.nonNullable.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
      type: [, [Validators.required]],
      all: [false]
    })

  }

  selectChange(event) {
    const { value } = event.detail;
    if (value == '4') {
      return;
    }
    let dateStart: Date;
    let dateEnd: Date;
    switch (value) {
      case '1':
        dateStart = startOfDay(new Date())
        dateEnd = endOfDay(new Date())
        break;
      case '2':
        dateStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        dateEnd = endOfDay(new Date())
        break;
      case '3':
        dateStart = startOfMonth(new Date())
        dateEnd = endOfDay(new Date())
        break;
      case '5':
        dateStart = startOfMonth(new Date())
        dateEnd = endOfDay(new Date())
        this.reportForm.get('all').patchValue(true)
        break;
      default:
        break;

    }
    this.reportForm.get('start').patchValue(format(dateStart, 'yyyy-MM-dd'))
    this.reportForm.get('end').patchValue(format(dateEnd, 'yyyy-MM-dd'))
  }

  async onSubmit() {
    const { type } = this.reportForm.value
    await this.getExport(this.user, type, this.reportForm.value)
    this.reportForm.get('all').patchValue(false)

  }

  async getExport(id: any, type: string, data: any) {
    const loading = await this.toolsService.showLoading('Cargando informacion...')
    try {
      let response = await this.http.postStream(`report/${id}`, data).toPromise()
      let name = new Date().toString()
      let file = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      var a = document.createElement("a"), url = URL.createObjectURL(file);
      a.href = url;
      a.download = `${name}.xlsx`;
      // const response = await this.connectionsService.post(`packages/client`, { client: this.userID, packages: this.productList$.value }).toPromise();
      if (response) {
        await this.toolsService.showAlert({
          cssClass: 'alert-success',
          keyboardClose: true,
          mode: 'ios',
          header: 'Exito',
          buttons: [{ text: 'Aceptar', handler: () => a.click() }]
        })
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.dismiss()
    }
  }
}
