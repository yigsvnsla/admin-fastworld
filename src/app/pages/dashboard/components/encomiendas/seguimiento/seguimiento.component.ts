import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConectionsService } from 'src/app/services/connections.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html'
})



export class SeguimientoComponent implements OnInit {

  /**
   * Copied variables
   */
   apiMap$: Observable<Boolean> = of(false)

  options = {
    keyboardShortcuts: false,
    disableDefaultUI: true,
    minZoom: 12,
    maxZoom: 18,
    zoom: 12,
    center: {
      lat: -2.1546273,
      lng: -79.8641237
    }
  }

  constructor(private conectionsService: ConectionsService) {

   }

  ngOnInit() {
    this.loadMap()
  }

  public loadMap(){
    this.apiMap$ = this.conectionsService
    .getGoogleMapsApi()
    .pipe(
      tap(api => {
        /* this.googleAutocompleteService = new google.maps.places.AutocompleteService();
        this.sessionToken = new google.maps.places.AutocompleteSessionToken();
        this.markerOptions.position = this.mapOptions.center; */
      })
    )
  }

}
