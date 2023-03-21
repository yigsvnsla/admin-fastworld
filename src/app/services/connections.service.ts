import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToolsService } from './tools.service';
import { CookiesService } from './cookies.service';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import {
  retry,
  catchError,
  debounceTime,
  map,
  tap,
  takeUntil
} from 'rxjs/operators';
import { SigInResponseI, SingInRequestI, SingUpI, SingUpResponseI } from '../interfaces/auth.interface';
import { MapDirectionsService, MapGeocoder } from '@angular/google-maps';
import { Socket } from 'ngx-socket-io';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';


@Injectable({
  providedIn: 'root',
})
export class ConectionsService {
  // API path
  public readonly api: string = 'https://s1.fastworld.app/api';

  constructor(
    private toolsService: ToolsService,
    private cookiesService: CookiesService,
    private httpClient: HttpClient,
    private router: Router,
    private mapGeocoder: MapGeocoder,
    private localStorageService: LocalStorageService,
    private mapDirectionsService: MapDirectionsService,
  ) {

  }

  // Http Options
  httpHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${(this.cookiesService.get(environment['admin_cookie_tag']))}`,
      }),
    };
  }
  // Handle API errors
  errorHandler(httpErrorResponse: HttpErrorResponse) {

    if (httpErrorResponse.error instanceof ArrayBuffer) {
      let text = new TextDecoder('utf-8')
      const { details, message } = JSON.parse(text.decode(httpErrorResponse.error)).error
      this.toolsService.showAlert({
        cssClass: 'alert-danger',
        header: `🚫 Error ${httpErrorResponse.status}`,
        message: details.message,
        subHeader: message,
        buttons: ['ok'],
      });
    }

    if (httpErrorResponse.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', httpErrorResponse.error.message);
    }
    else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.toolsService.showAlert({
        cssClass: 'alert-danger',
        header: `🚫 Error ${httpErrorResponse.error.error.status}`,
        subHeader: httpErrorResponse.error.error.message,
        message: httpErrorResponse.error.error.details?.message,
        buttons: ['ok'],
      });
      console.error(`Backend returned code ${httpErrorResponse.status},body was: ${JSON.stringify(httpErrorResponse.error)}`);
    }
    return throwError(httpErrorResponse);
  }

  // Methods
  public get<t>(path: string, skip: boolean = false) {
    let request = this.httpClient
      .get<t>(`${this.api}/${path}`, this.httpHeaders())

    return skip ? request : request
      .pipe(
        catchError((err) => this.errorHandler(err))
      );
  }

  public post(path: string, body: any) {
    return this.httpClient
      .post<any>(`${this.api}/${path}`, body, this.httpHeaders())
      .pipe(
        catchError((err) => this.errorHandler(err))
      );
  }

  public delete(path: string) {
    return this.httpClient
      .delete<any>(`${this.api}/${path}`, this.httpHeaders())
      .pipe(
        catchError((err) => this.errorHandler(err))
      );
  }

  public put(path: string, body: any) {
    return this.httpClient
      .put<any>(`${this.api}/${path}`, body, this.httpHeaders())
      .pipe(
        catchError((err) => this.errorHandler(err))
      );
  }

  /*
    Authentications methods
  */

  public signUp(formBody: SingUpI, scope: string) {
    return this.httpClient
      .post<SingUpResponseI>(`${this.api}/auth/${scope}/signup`, formBody)
      .pipe(
        debounceTime(500),
        catchError((err) => this.errorHandler(err))
      );
  }

  public signIn(credentials: SingInRequestI) {
    return this.httpClient
      .post<SigInResponseI>(`${this.api}/auth/admin/signin`, credentials)
      .pipe(
        debounceTime(500),
        tap(async res => {
          console.log(res);

          this.cookiesService.set(environment['admin_cookie_tag'], res.jwt);
          (await this.localStorageService.remove(environment['admin_user_tag']));
          (await this.localStorageService.set(environment['admin_user_tag'], res.user));
          this.router.navigateByUrl('dashboard');
        }),
        catchError((err) => this.errorHandler(err))
      )
  }

  public logOut(): void {
    this.cookiesService.remove(environment.admin_cookie_tag);
    this.localStorageService.remove(environment.admin_user_tag)
    this.router.navigateByUrl('auth');
  }

  // stream methods

  public postStream(path: string, obj) {
    return this.httpClient
      .post(`${this.api}/${path}`, obj, {
        headers: {
          'Authorization': `Bearer ${(this.cookiesService.get(environment['admin_cookie_tag']))}`
        },
        responseType: 'arraybuffer'
      })
      .pipe(
        catchError((err) => this.errorHandler(err))
      )
  }


  // maps methods
  public getGoogleMapsApi() {
    return this.httpClient
      .jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyA4xXPNs8mpyQYKv_6Bxb-A7TLwb9LRZQY&libraries=places&language=es', 'callback')
      .pipe(
        map((x) => true),
        catchError((e) => of(false)),
      );
  }

  public mapDirections(request: google.maps.DirectionsRequest) {
    return this.mapDirectionsService
      .route(request)
      .pipe(
        map(mapDirectionsResponse => {
          const { result, status } = mapDirectionsResponse;
          if (status != google.maps.DirectionsStatus.OK) {
            const translateErrorMessageHandler = (status: google.maps.DirectionsStatus) => {
              switch (status) {
                case google.maps.DirectionsStatus.NOT_FOUND:
                  return `[ ${status} ] Al menos una de las ubicaciones especificadas en el origen, destino o waypoints de la solicitud no se pudo geocodificar.`
                case google.maps.DirectionsStatus.ZERO_RESULTS:
                  return `[ ${status} ] Indica que no se pudo encontrar ninguna ruta entre el origen y el destino.`
                case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED:
                  return `[ ${status} ] Indica que se proporcionaron demasiados campos "DirectionsWaypoint" en el archivo DirectionsRequest`
                case google.maps.DirectionsStatus.INVALID_REQUEST:
                  return `[ ${status} ]	Indica que lo proporcionado DirectionsRequestno es válido`
                case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                  return `[ ${status} ]	La página web ha superado el límite de solicitudes en un período de tiempo demasiado corto.`
                case google.maps.DirectionsStatus.REQUEST_DENIED:
                  return `[ ${status} ]	La página web no puede usar el servicio de indicaciones.`
                case google.maps.DirectionsStatus.UNKNOWN_ERROR:
                  return `[ ${status} ]	No se pudo procesar una solicitud de "Directions" debido a un error del servidor. La solicitud puede tener éxito si lo intenta de nuevo.`
              }
            }
            this.toolsService.showAlert({
              header: "Error 🚫",
              cssClass: 'alert-danger',
              subHeader: `code: ${status}`,
              message: translateErrorMessageHandler(status),
              buttons: ['Aceptar']
            })
            throwError(`mapGeocoderResponse : ${status}`)
          } else { return result }
        })
      )
  }

  public mapGeocode(request: google.maps.GeocoderRequest) {
    return this.mapGeocoder
      .geocode(request)
      .pipe(
        map(mapGeocoderResponse => {
          const { results, status } = mapGeocoderResponse
          if (status != google.maps.GeocoderStatus.OK) {
            const translateErrorMessageHandler = (status: google.maps.GeocoderStatus) => {
              switch (status) {
                case 'ERROR':
                  return `[ ${status} ]	Hubo un problema al contactar con los servidores de Google.`
                case 'INVALID_REQUEST':
                  return `[ ${status} ]	Este GeocoderRequest no era válido.`
                case 'OVER_QUERY_LIMIT':
                  return `[ ${status} ]	La página web ha superado el límite de solicitudes en un período de tiempo demasiado corto.`
                case 'REQUEST_DENIED':
                  return `[ ${status} ]	La página web no puede usar el geocodificador.`
                case 'UNKNOWN_ERROR':
                  return `[ ${status} ]	No se pudo procesar una solicitud de geocodificación debido a un error del servidor. La solicitud puede tener éxito si lo intenta de nuevo.`
                case 'ZERO_RESULTS':
                  return `[ ${status} ] No se encontró ningún resultado para esto GeocoderRequest`
              }
            }
            this.toolsService.showAlert({
              header: "Error 🚫",
              cssClass: 'alert-danger',
              subHeader: `code: ${status}`,
              message: translateErrorMessageHandler(status),
              buttons: ['Aceptar']
            })
            throwError(`mapGeocoderResponse : ${status}`)
          } else { return results }
        })
      )
  }


  public geolocation(geolocationCallback: (x: GeolocationPosition | undefined) => any) {
    if (navigator.geolocation) {
      navigator.geolocation
        .getCurrentPosition(
          (geolocationPosition: GeolocationPosition) => {
            return geolocationCallback(geolocationPosition)
          },
          (geolocationPositionError: GeolocationPositionError) => {
            switch (geolocationPositionError.code) {
              case geolocationPositionError.PERMISSION_DENIED:
                this.toolsService.showAlert({
                  header: "Ubicacion bloqueada",
                  cssClass: 'alert-danger',
                  subHeader: "Permiso denegado",
                  message: "Los permisos para obtener la ubicacion y manejar el mapa, estan denegados por el usuario o dispositivo",
                  buttons: ['Aceptar']
                })
                break;
              case geolocationPositionError.POSITION_UNAVAILABLE:
                this.toolsService.showAlert({
                  header: "Posicion no disponible",
                  subHeader: "Mapa no disponible",
                  cssClass: 'alert-warn',
                  message: "Ha ocurrido algun problema con el dispositivo movil",
                  buttons: ['Aceptar']
                })
                break;
            }
            console.error(geolocationPositionError);
            return geolocationCallback(undefined)
          }, {
          enableHighAccuracy: true,
        })
    }
  }

}
/**
 * socket.io
 */
@Injectable({
  providedIn: 'root',
})
export class SocketService extends Socket {
  constructor() {
    super({
      url: 'https://s1.fastworld.app',
      options: {
        autoConnect: false,
        query: {
          origin: 'admin'
        }
      }
    });
  }


  public set setAuth(token: string) {
    this.ioSocket.auth = { token: token }
  }

}
export class Source extends DataSource<any | undefined>{
  public source: any[] = Array.from<any>({ length: 0 });
  private itemsChanges$: BehaviorSubject<any> = new BehaviorSubject([]);
  private destroy$: Subject<boolean> = new Subject();

  private path: string
  private pagination: {
    page: number
    pageSize?: number
    pageCount?: number
    total?: number
  }

  public loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private _conectionsService: ConectionsService,
  ) {

    super()
  }

  private async getData(path: string) {
    let pagination = path.includes('?') ? `&pagination[page]=${this.getPagination.page}` : `?pagination[page]=${this.getPagination.page}`
    return await this._conectionsService
      .get<any>(path + pagination)
      .toPromise()
  }

  private get getPagination(): {
    page: number
    pageSize?: number
    pageCount?: number
    total?: number
  } { return this.pagination }

  private set setPagination(v: {
    page: number
    pageSize?: number
    pageCount?: number
    total?: number
  }) {
    this.pagination = v;
  }

  public set setPath(v: string) {
    this.path = v;
    this.itemsChanges$ = new BehaviorSubject<(string | undefined)[]>(this.source);
    this.setPagination = { page: 1 }
    this.loading = new BehaviorSubject<boolean>(false)
    this.getInformation()
  }

  public isEmpty() {
    return this.source.length == 0
  }

  public clear() {
    this.source = [];
    this.setPagination = { page: 1 }
  }

  private async getInformation() {
    this.loading.next(true)
    const { data, meta } = await this.getData(this.path)
    const { page, pageSize, pageCount, total } = meta.pagination
    this.pagination = meta.pagination
    if (page <= 1) {
      this.source = Array.from<any>({ length: 0 });
    }
    this.source.splice(page * pageSize, pageSize, ...data);
    this.itemsChanges$.next(this.source);
    this.loading.next(false)
  }

  public connect(collectionViewer: CollectionViewer) {
    collectionViewer.viewChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((range) => {
        const currentPage = Math.floor(range.end / this.pagination.pageSize) + 1;
        if (currentPage > this.pagination.page) {
          this.pagination.page = currentPage;
          this.getInformation()
        }
      })
    return this.itemsChanges$
  }
  public disconnect(collectionViewer: CollectionViewer): void {
    this.destroy$.next(true)
  }


}
