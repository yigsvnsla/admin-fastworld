import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Ubication } from 'src/app/interfaces/ubication.interface';
import { ConectionsService } from 'src/app/services/connections.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-modal-map',
  templateUrl: './modal-map.component.html',
  styleUrls: ['./modal-map.component.scss'],
})
export class ModalMapComponent implements OnInit {

  @ViewChild('googleMap') private googleMap: google.maps.Map;

  public autocompletePredictions: google.maps.places.AutocompletePrediction[]
  public googleAutocompleteService: google.maps.places.AutocompleteService
  private sessionToken: google.maps.places.AutocompleteSessionToken;
  public markerOptions: google.maps.MarkerOptions;
  public mapOptions: google.maps.MapOptions;
  public apiLoaded: Promise<HTMLIonLoadingElement>
  public apiMap$: Observable<boolean>;
  public myUbication: Ubication

  constructor(
    private conectionsService: ConectionsService,
    private toolsService: ToolsService,
    private modalController:ModalController) {
    this.apiMap$ = of(false)
    this.autocompletePredictions = []
    this.myUbication = {
      address: '',
      position: null
    }
    this.mapOptions = {
      keyboardShortcuts: false,
      disableDefaultUI: true,
      minZoom: 12,
      maxZoom: 18,
      zoom: 12,
      center: {
        lat: -2.1546273,
        lng: -79.8641237
      }
    };

    this.markerOptions = {
      draggable: false
    }
  }

  ngOnInit() {
    this.loadMap()
  }

  ionViewDidEnter() {
    this.showMap()
  }

  public loadMap(){
    this.apiMap$ = this.conectionsService
    .getGoogleMapsApi()
    .pipe(
      tap(api => {
        this.googleAutocompleteService = new google.maps.places.AutocompleteService();
        this.sessionToken = new google.maps.places.AutocompleteSessionToken();
        this.markerOptions.position = this.mapOptions.center;
      })
    )
  }

  public showMap() {
    this.conectionsService
      .geolocation((geolocationPosition) => {
        if (geolocationPosition) {
          this.myUbication.position = { lat: geolocationPosition.coords.latitude, lng: geolocationPosition.coords.longitude };
          this.mapOptions.center = { lat: geolocationPosition.coords.latitude, lng: geolocationPosition.coords.longitude };
          this.markerOptions.position = { lat: geolocationPosition.coords.latitude, lng: geolocationPosition.coords.longitude };
          this.mapOptions.center = { lat: geolocationPosition.coords.latitude, lng: geolocationPosition.coords.longitude };
          this.googleMap.panTo(this.myUbication.position);
          this.mapOptions.zoom = 17
          this.conectionsService
            .mapGeocode({ location: this.myUbication.position })
            .subscribe(_geoCodeResults => {
              this.myUbication.address = _geoCodeResults[0].formatted_address
              this.myUbication.placeId = _geoCodeResults[0].place_id
            })
        }
      })
  }

  public mapZoomChanged(){
    this.googleMap.panTo(this.myUbication.position);
  }

  public async searchAddresChange($event: Event) {
    this.myUbication.address = ($event as CustomEvent).detail.value;
    if (($event as CustomEvent).detail.value != '') {

      let { predictions } = (await this.googleAutocompleteService.getPlacePredictions({
        input: ($event as CustomEvent).detail.value,
        sessionToken: this.sessionToken,
        language: 'es-419',
        componentRestrictions: { country: 'EC' },
      }))

      this.autocompletePredictions = predictions
    }
  }

  public selectAddress(prediction: google.maps.places.AutocompletePrediction) {
    this.conectionsService
      .mapGeocode({ placeId: prediction.place_id, region: 'EC' })
      .subscribe(result => {
        this.myUbication.position = result[0].geometry.location.toJSON()
        this.markerOptions.position = result[0].geometry.location.toJSON()
        this.mapOptions.center = result[0].geometry.location.toJSON()
        this.mapOptions.zoom = this.mapOptions.maxZoom
        this.googleMap.panTo(this.myUbication.position);
        this.autocompletePredictions = []
      })
  }

  public searchAddresCancel(elementRef: any) {
    this.autocompletePredictions = []
  }

  public mapDragend() {
    this.conectionsService
      .mapGeocode({ location: this.googleMap.getCenter().toJSON() })
      .subscribe(_geoCodeResults => {
        const {formatted_address, place_id, geometry} = _geoCodeResults[0]
        const {location} = geometry;
        this.myUbication.address = formatted_address;
        this.myUbication.placeId = place_id;
        this.myUbication.position = location.toJSON()
        this.markerOptions.position = this.googleMap.getCenter().toJSON()
      })
  }

  public mapDrag() {
    this.markerOptions.position = this.googleMap.getCenter().toJSON()

  }

  public centerMyUbication() {
    this.googleMap.panTo(this.myUbication.position);
    this.markerOptions.position = this.myUbication.position;
  }

  public selectUbication() {
    this.toolsService.showAlert({
      header: 'Confirmar Ubicación 🛰',
      subHeader: 'recuerde que para brindar un servicio eficiente verifique que la ubicación ingresada sea la correcta oh la mas proxima, si es asi presione confirmar',
      cssClass: 'alert-success',
      buttons: ['Cancelar', {
        text: 'confirmar',
        handler: () => {
          this.modalController.dismiss(this.myUbication)
        }
      }]
    })
  }

  public dismiss(){
    this.modalController.dismiss()

  }

}
