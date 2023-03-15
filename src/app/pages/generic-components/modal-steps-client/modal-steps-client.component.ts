import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from './../../../services/tools.service';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalMapComponent } from '../modal-map/modal-map.component';

@Component({
  selector: 'app-modal-steps-client',
  templateUrl: 'modal-steps-client.component.html',
  styleUrls:['./modal-steps-client.component.scss']
})

export class ModalStepsClientComponent implements OnInit {

  @Input() id:number
  @Input() user:any
  public stepsForm : FormGroup
  public uploadFiles: any = [];

  constructor(
    private modalController:ModalController,
    private formBuilder: FormBuilder,
    private toolsService:ToolsService,
    private conectionsService:ConectionsService
  ) {
    this.stepsForm = this.formBuilder.nonNullable.group({
      business: this.formBuilder.nonNullable.group({
        name: ['', [Validators.required,]],
        logoImg: ['', [Validators.required,]],
        ubication: ['', [Validators.required,]],
        documentImg: ['', [Validators.required,]],
        home:['',[Validators.required]]
      })
    });
  }

  ngOnInit() {

  }

  ionViewDidEnter() {

  }

  public async showMap() {
    this.toolsService
    .showModal({
      component: ModalMapComponent,
      backdropDismiss: false,
      keyboardClose: true,
      cssClass: 'modal-fullscreen'
    }).then((val)=>{
      if (val) {
        this.stepsForm
          .get('business')
          .get('ubication')
          .setValue(val);
      }
    })
  }

  public imgHandler(event: Event, elementViewPort?: HTMLImageElement) {
    // pasamos a una constante el arr de archivo
    const files = (event.target['files'] as File[])
    // si el evento tiene un archivo y si esta en el indice
    if (files && files.length) {
      this.uploadFiles.push({
        name: event.target['id'],
        file: files[0]
      })
      if (elementViewPort) {
        //  creamos una instancia de un FileReader
        var fr = new FileReader();
        fr.onload = () => {
          elementViewPort.style.backgroundImage = `url('${fr.result.toString()}')`
          elementViewPort.style.backgroundSize = 'cover'
        }
        fr.readAsDataURL(files[0]);
      }
    }
  }

  public async onPost(){
    const load = await this.toolsService.showLoading()

    let data = this.stepsForm.value;
    let form = new FormData();
    this.uploadFiles.forEach(({ name, file }) => {
      form.append(`files.${name.replace('image_', '')}`, file, file.name);
    });
    form.append('data', JSON.stringify(data))
    this.conectionsService
      .post(`user/business/${this.id}`, form)
      .subscribe(async  res => {
        load.dismiss();
        this.modalController.dismiss(res)
      })
  }

  public async onExit(){
    (await this.modalController.getTop()).dismiss()
  }
}
