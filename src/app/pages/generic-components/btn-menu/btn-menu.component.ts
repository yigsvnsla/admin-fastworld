import { Component, OnInit } from '@angular/core';
import { SIZE_TO_MEDIA } from '@ionic/core/dist/collection/utils/media';

@Component({
  selector: 'app-btn-menu',
  templateUrl: './btn-menu.component.html',
  styleUrls: ['./btn-menu.component.scss'],
})
export class BtnMenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  public toggleMenu(){
    const splitPane = document.querySelector('ion-split-pane')
    if (window.matchMedia(SIZE_TO_MEDIA[splitPane.when] || splitPane.when).matches){
      splitPane.classList.toggle('split-pane-visible')
    }
  }

}
