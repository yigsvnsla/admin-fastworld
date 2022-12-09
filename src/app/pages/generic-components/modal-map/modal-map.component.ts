import { Component, OnInit, ViewChild } from '@angular/core';
import { MapGeocoder } from '@angular/google-maps';
import { IonInput, IonSearchbar, ModalController } from '@ionic/angular';
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
  @ViewChild('searchbar') private searchbar: IonSearchbar
  @ViewChild('searchInput') public searchInput: IonInput
  public autocompletePredictions: google.maps.places.AutocompletePrediction[]
  public googleAutocompleteService: google.maps.places.AutocompleteService
  private sessionToken: google.maps.places.AutocompleteSessionToken;
  public markerOptions: google.maps.MarkerOptions;
  public mapOptions: google.maps.MapOptions;
  public apiLoaded: Promise<HTMLIonLoadingElement>
  public apiMap$: Observable<boolean>;
  public myUbication: Ubication

  public addressList: boolean = false

  constructor(
    private conectionsService: ConectionsService,
    private toolsService: ToolsService,
    private modalController: ModalController,
    private mapGeocoder: MapGeocoder,

  ) {
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

  searchInputFocus($event) {
    this.addressList = true
    this.searchInput.value = ''
    console.log($event);

  }

  searchInputBlur($event) {
    console.log($event);
  }

  public loadMap() {
    if (window?.google) {
      this.apiMap$ = of(true)
      this.googleAutocompleteService = new google.maps.places.AutocompleteService();
      this.sessionToken = new google.maps.places.AutocompleteSessionToken();
      this.markerOptions.position = this.mapOptions.center;
    } else {
      this.apiMap$ = this.conectionsService
        .getGoogleMapsApi()
        .pipe(
          tap(api => {
            console.log(google);
            this.googleAutocompleteService = new google.maps.places.AutocompleteService();
            this.sessionToken = new google.maps.places.AutocompleteSessionToken();
            this.markerOptions.position = this.mapOptions.center;
          })
        )
    }
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

              this.searchInput.value = this.myUbication.address
              console.log(this.myUbication );

            })
        }
      })
  }

  public mapZoomChanged() {
    this.googleMap.panTo(this.myUbication.position);
  }

  // public async searchAddresChange($event: Event) {


  // this.myUbication.address = ($event as CustomEvent).detail.value;

  // if (($event as CustomEvent).detail.value != '') {

  //   let { predictions } = (await this.googleAutocompleteService.getPlacePredictions({
  //     input: ($event as CustomEvent).detail.value,
  //     sessionToken: this.sessionToken,
  //     language: 'es-419',
  //     componentRestrictions: { country: 'EC' },
  //   }))

  //   this.autocompletePredictions = predictions
  // }
  // }

  public selectAddress(prediction: google.maps.GeocoderResult) {
    // this.conectionsService
    //   .mapGeocode({ placeId: prediction.place_id, region: 'EC' })
    //   .subscribe(result => {

        console.log(prediction);

        this.myUbication.address = prediction.formatted_address

        this.myUbication.position = prediction.geometry.location.toJSON()
        this.markerOptions.position = prediction.geometry.location.toJSON()
        this.mapOptions.center = prediction.geometry.location.toJSON()
        this.mapOptions.zoom = this.mapOptions.maxZoom
        this.googleMap.panTo(this.myUbication.position);
        this.autocompletePredictions = []
        this.searchInput.value = this.myUbication.address

            this.addressList = false

      // })
  }

  public searchAddresCancel(elementRef: any) {
    this.autocompletePredictions = []
  }

  public mapDragend() {
    this.conectionsService
      .mapGeocode({ location: this.googleMap.getCenter().toJSON() })
      .subscribe(_geoCodeResults => {
        console.log(_geoCodeResults);

        const { formatted_address, place_id, geometry } = _geoCodeResults[0]
        const { location } = geometry;
        this.myUbication.address = formatted_address;
        this.myUbication.placeId = place_id;
        this.myUbication.position = location.toJSON()
        this.markerOptions.position = this.googleMap.getCenter().toJSON()
        this.searchInput.value = this.myUbication.address

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



  private debounceTimer
  public autocompleteItems: google.maps.GeocoderResult[] = []
  onSearchChange(e: any) {

    let address = (e as CustomEvent).detail.value;

    if (this.addressList && this.searchInput.value != '') {
      // console.log(address);
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        if (address != '') {
          this.mapGeocoder
            .geocode({ address })
            .subscribe(async ({ results, status }) => {
              switch (status) {
                case google.maps.GeocoderStatus.OK:
                  if (results.length == 1) {
                    this.myUbication.address = results[0].formatted_address
                    this.myUbication.position = results[0].geometry.location.toJSON()
                    this.markerOptions.position = results[0].geometry.location.toJSON()
                    this.mapOptions.center = results[0].geometry.location.toJSON()
                    this.mapOptions.zoom = this.mapOptions.maxZoom
                    this.googleMap.panTo(this.myUbication.position);
                    this.autocompletePredictions = []
                    this.addressList = false
                    const element = await this.searchInput.getInputElement()
                    element.blur()
                    console.log(results);
                    return
                  }

                  this.autocompleteItems = results
                  console.log(this.autocompleteItems);
                  break;
                case google.maps.GeocoderStatus.ERROR:
                  console.error('error map geocoder');
                  break;
                case google.maps.GeocoderStatus.ZERO_RESULTS:
                  // this.searchBar.value = ""
                  this.autocompleteItems = []
                  this.toolsService.showAlert({
                    header: 'Sin Resultados 🤷‍♂️',
                    subHeader: 'Es posible que la direccion no exista o este mal escrita',
                    cssClass: 'alert-warn',
                    buttons: ['ok']
                  })
                  break;
              }
            })
        }
      }, 3000);
    }
  }

  public onExit() {
    this.modalController.dismiss()
  }

}
