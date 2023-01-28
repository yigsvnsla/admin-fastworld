import { ConectionsService } from './../../../services/connections.service';
import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'modal-steps-drivers',
  templateUrl:'./modal-steps-driver.component.html',
  styleUrls:['./modal-steps-driver.component.scss']
})

export class ModalStepsDriverComponent implements OnInit {

  @Input() id:number
  @Input() user:any

  public stepsForm : FormGroup
  public uploadFiles: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalController:ModalController,
    private conectionsService:ConectionsService
  ) { }

  ngOnInit() {
    this.stepsForm = this.formBuilder.nonNullable.group({
      maker: ['', [Validators.required, Validators.pattern(/([a-zA-Z])/g),]],
      model: ['', [Validators.required, Validators.pattern(/([a-zA-Z0-9])/g),]],
      year: ['', [Validators.required, Validators.pattern(/([0-9]{4})/g),]],
      color: ['', [Validators.required, Validators.pattern(/([a-zA-Z])/g),]],
      plate_id: ['', Validators.required],
      licence_id: ['', Validators.required]
    },);
  }

  public imgHandler(event: Event, elementViewPort?: HTMLImageElement) {
    console.log(event);
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

  async buildPost() {
    let data = this.stepsForm.value;
    let form = new FormData();
    console.log(data)
    this.uploadFiles.forEach(({ name, file }) => {
      form.append(`files.${name.replace('image_', '')}`, file, file.name);
    });
    form.append('data', JSON.stringify(data))
    this.conectionsService
      .post(`user/driver/${this.id}`, form)
      .subscribe(async res => {
        (await this.modalController.getTop()).dismiss()
        console.log(res)
      })
  }

  public async onExit(){
    (await this.modalController.getTop()).dismiss()
  }
}
