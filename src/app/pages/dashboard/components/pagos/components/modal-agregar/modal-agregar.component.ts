import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputCustomEvent, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-agregar',
  templateUrl: './modal-agregar.component.html',
  styleUrls: ['./modal-agregar.component.scss'],
})
export class ModalAgregarComponent implements OnInit {

  @Input() title: string = 'Pagar'
  @Input() comment: boolean = true;

  formBase: FormGroup

  constructor(private builder: FormBuilder, private modal: ModalController) { }

  ngOnInit() {
    this.formBase = this.builder.nonNullable.group({
      value: ['$0.00', [Validators.required]],
      comment: ['', [this.comment ? Validators.required : Validators.nullValidator]]
    })
  }


  public ionChangesInputCurrency(_$event: Event) {
    const $event = (_$event as InputCustomEvent)
    let value = $event.detail.value;
    const decimal: string = ',';
    const thousand: string = '.';
    if (RegExp(/$/g).test($event.detail.value)) $event.detail.value.replace('$', '');
    if ($event.detail.value == '') this.formBase.get(['value']).setValue(value = '0' + decimal + '00');
    value = value + '';
    value = value.replace(/[\D]+/g, '');
    value = value + '';
    value = value.replace(/([0-9]{2})$/g, decimal + '$1');
    var parts = value.toString().split(decimal);
    if (parts[0] == '') parts[0] = '0';
    parts[0] = parseInt(parts[0]).toString();
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
    value = parts.join(decimal);
    this.formBase.get(['value']).setValue('$' + value)
  }

  exit() {
    this.modal.dismiss(this.formBase.value)
  }

  validate(event) {
    if(!this.formBase.invalid) this.exit()
  }

}
