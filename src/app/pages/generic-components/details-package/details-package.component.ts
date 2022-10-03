import { delay, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ConectionsService } from 'src/app/services/connections.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-details-package',
  templateUrl: './details-package.component.html',
  styleUrls: ['./details-package.component.scss'],
})
export class DetailsPackageComponent implements OnInit {

  @Input() public id : number
  
  public package : Observable<any>

  constructor(
    private conectionsService:ConectionsService,
    private modalController:ModalController
  ) { }

  public ngOnInit(): void {

    this.loadPackage()
    console.log(this.id);
    
    
    
  }
  
  private async loadPackage(){
    
    this.package = this.conectionsService.get<any>(`client/packages/${this.id}?populate=*`).pipe(delay(1000),map(res=>res.data),tap(console.log),)
  }

  public async onExit(){
    (await this.modalController.getTop()).dismiss()
  }

}
