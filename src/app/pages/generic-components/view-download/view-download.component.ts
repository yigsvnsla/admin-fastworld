import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonSelect, ModalController } from '@ionic/angular';
import { endOfDay, format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-view-download',
  templateUrl: './view-download.component.html',
  styleUrls: ['./view-download.component.scss'],
})
export class ViewDownloadComponent implements OnInit {

  @Input() infoUser?: { id: string, role: string };
  @Input() pdf: boolean = true
  @Input() excel: boolean = true

  public reportForm: FormGroup
  user: any

  constructor(
    private formBuilder: FormBuilder,
    private modal: ModalController) { }

  ngOnInit() {
    this.reportForm = this.formBuilder.group({
      start: [, Validators.required],
      end: [, Validators.required],
      target: [0, Validators.required],
      mode: ['providers', Validators.required],
    })

    if (this.infoUser) {
      this.reportForm.get('target').patchValue(this.infoUser.id)
      this.reportForm.get('mode').patchValue(this.infoUser.role)
    }

  }

  selectChange(event) {
    const { value } = event.detail;
    if (value == '4') {
      return;
    }
    let dateStart: Date;
    let dateEnd: Date;
    switch (value) {
      case '0':
        dateStart = startOfMonth(new Date('2020-01-02'))
        dateEnd = endOfDay(new Date())
        break;
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
      default:
        break;

    }
    this.reportForm.get('start').patchValue(format(dateStart, 'yyyy-MM-dd'))
    this.reportForm.get('end').patchValue(format(dateEnd, 'yyyy-MM-dd'))
  }

  async download(print: 'pdf' | 'excel') {
    this.close({
      ...this.reportForm.value,
      print,
    })
  }



  onResult(event: any) {
    this.user = event;
    this.reportForm.patchValue({ target: event.id })
  }

  runClear(event?: any) {
    this.user = null
    this.reportForm.patchValue({ target: null })
    if (event) {
      const { value } = event.detail;
      if (value == 'all') this.reportForm.patchValue({ target: 0 })
    }

  }
  close(data?) {
    this.modal.dismiss(data)
  }
}
