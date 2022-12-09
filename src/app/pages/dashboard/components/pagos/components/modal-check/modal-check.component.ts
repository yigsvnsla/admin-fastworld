import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-check',
  templateUrl: './modal-check.component.html',
  styleUrls: ['./modal-check.component.scss'],
})
export class ModalCheckComponent implements OnInit {

  @Input() id: any;
  @Input() business: any;
  @Input() resume: {
    total: string,
    value: number,
    left: number
  }

  constructor(private modal: ModalController) { }

  ngOnInit() { }


  async onExit(obj?: any) {
    this.modal.dismiss(obj)
  }

}
