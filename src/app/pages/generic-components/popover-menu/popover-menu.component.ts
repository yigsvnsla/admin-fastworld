import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SIZE_TO_MEDIA } from '@ionic/core/dist/collection/utils/media';

@Component({
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss'],
})
export class PopOverMenuComponent implements OnInit {

    @Input() public trigger:string

  constructor() { }

  ngOnInit() {
      
  }



}
