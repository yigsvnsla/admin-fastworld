
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConectionsService, SocketService } from 'src/app/services/connections.service';

interface Marker {
  position: google.maps.LatLngLiteral,
  option: google.maps.MarkerOptions,
  payload: any
}

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html'
})
export class SeguimientoComponent implements OnInit {


  @ViewChild('map') Map: google.maps.Map;

  public apiMap$: Observable<Boolean> = of(false)
  public markers: Marker[] = []
  public markers$: Observable<Marker[]>
  public mapOptions: google.maps.MapOptions = {
    keyboardShortcuts: false,
    disableDefaultUI: true,
    minZoom: 12,
    zoom: 12,
    center: {
      lat: -2.1546273,
      lng: -79.8641237
    }
  }
  constructor(
    private conectionsService: ConectionsService,
    private socketService: SocketService

  ) {

  }

  ngOnInit() {


    this.socketService.on('GPSUpdate', (update: any[]) => {
      update.forEach(val=> console.log(val))

      this.markers = update.map(this.createMarker)
      this.markers$ = of<Marker[]>(this.markers)

    })

    this.loadMap()
  }

  public trackByMarker(index:number, data:any){
    return data.payload.id
  }

  private createMarker(GPSUpdate: any): Marker {
    const {driver, coords} = GPSUpdate

    // if (_conection.location.latitude== undefined || _conection.location.longitude == undefined) console.log(`( ${_conection.email} ) sin ubicacion`);
    return {
      payload: driver,
      position: {
        lat: coords.latitude,
        lng: coords.longitude
      },
      option: {
        // map: this.Map,
        clickable: true,
        optimized: false,
        animation: google.maps.Animation.DROP,
        label: {
          text: `${driver.id}`,
          color: 'white',
          fontSize: '16px',
        }
      }
    }
  }



















  public ionViewWillLeave() {
    this.socketService.removeAllListeners('GPSUpdate')
  }

  public loadMap() {
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
