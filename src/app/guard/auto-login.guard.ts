import { ConectionsService } from 'src/app/services/connections.service';
import { LocalStorageService } from './../services/local-storage.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate {

  constructor(
    private localStorageService:LocalStorageService,
    private conectionsService:ConectionsService,
    private router :Router
  ){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise<boolean>(
        async (resolve, reject) => {
          const userStoraged = await this.localStorageService.get(environment.admin_user_tag)
          console.log(userStoraged);
          if ( userStoraged == null ) {
            resolve(false)
            this.router.navigateByUrl('auth')
          }
          if ( ( userStoraged as Object ).hasOwnProperty('admin') && userStoraged.admin!= null  ){
            resolve(true)
          }
          else {
            const foundUser = ( await this.conectionsService.get('admin/user/me').toPromise() as any)
            if ( foundUser.hasOwnProperty('admin') && foundUser.admin ){
              this.localStorageService.set(environment.admin_user_tag,foundUser);
              resolve(true) ;
            }
            else {
              resolve(false)
              this.router.navigateByUrl('auth')
            }
          }

        }
      )
  }

}
