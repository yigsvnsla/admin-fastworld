import { Injectable } from '@angular/core';
import { ActionSheetController, ActionSheetOptions, AlertController, AlertOptions, LoadingController, MenuController, ModalController, ModalOptions, PickerController, PickerOptions, PopoverController, PopoverOptions, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private menuController:MenuController,
    private alertController:AlertController,
    private actionSheetController: ActionSheetController,
    private picker:PickerController,
    private popover: PopoverController
  ) { }

  async showPopover(options:PopoverOptions){
    const pop = await this.popover.create(options)
    pop.present()

    return new Promise<HTMLIonPopoverElement>(async (resolve, reject) => {
      
      return resolve(pop)
    })
  }

  async  showPicker(options: PickerOptions){
    const picker = await this.picker.create(options)
    picker.present()
    return new Promise<HTMLIonPickerElement>((resolve, reject) => {
      return resolve(picker)
    })
  }

  async showActionSheet(options:ActionSheetOptions){

    const actionSheet = await this.actionSheetController.create(options)
    await actionSheet.present();
  
    return new Promise<HTMLIonActionSheetElement>(async(value)=>{
      return value(actionSheet)
    })
  }

  async showAlert(alertOptions:AlertOptions){    
    let alert = await this.alertController.create(alertOptions)
      alert.present()
    return new Promise<HTMLIonAlertElement>(async (value)=>{
      value(alert)
    })
  }

  async showToast(message: string) : Promise<HTMLIonToastElement> {
    let toast = await this.toastController.create({
      message: message,
      duration: 1000
    })
    toast.present();
    return new Promise<HTMLIonToastElement>(async (value) => {
      value(toast);
    })
  }

  async showLoading(message: string="Loading") {
    let loading = await this.loadingController.create({
      message: message,
    });
    loading.present();
    return new Promise<HTMLIonLoadingElement>(async (value) => {
      value(loading);
    });
  }

  async showModal(options: ModalOptions): Promise<any> {
    let load = this.showLoading()
    let modal: HTMLIonModalElement = await this.modalController.create(options);
    modal.present();
    (await load).dismiss()  
    
    return new Promise(async (value) => {
      value((await modal.onDidDismiss()).data)
    })
  }

  compareObjets(objet_base:object, objet_compare:object){      
    for (let [key, val] of Object.entries(objet_base)) {
      // si esta propiedad existe 
      if(objet_compare.hasOwnProperty(key)){
        // si el valor de la llave en el objeto comparador es diferente
        if (objet_compare[key] !== val) {
          // si el valor de la llave es de tipo objeto,
          // aplicar recursividad a la funcion, asi hacemos un sondeo profundo a las propiedades
          if (typeof objet_compare[key] == 'object'){
            return this.compareObjets(objet_compare[key],val)              
          }
          console.error(`Propiedad ${key}: El valor ${objet_compare[key]} no es equivalente a ${val}`);  
          return false;
        }
      }
      // si esta propiedad no existe
      else{
        console.error(key,`propiedad no existe en el objeto comparador`);          
        return false;
      }
    }
    return true
  }

  async menuControl():Promise<MenuController>{
    return this.menuController;
  }
  
  typeOf(value:any,base:string){
    return typeof value == base ? true : false
  }
}
