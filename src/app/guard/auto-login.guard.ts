import { CookiesService } from '../services/cookies.service';
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
    private cookieService:CookiesService,
    private router :Router
  ){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise<boolean>(
        async (resolve, reject) => {
          const userStoraged = await this.localStorageService.get(environment.admin_user_tag)
          const cookkie = this.cookieService.check(environment.admin_cookie_tag)
          if ( userStoraged == null  || !cookkie) {
            resolve(false)
            this.router.navigateByUrl('auth')
            return
          }

          if ( ( userStoraged as Object ).hasOwnProperty('admin') ){
            resolve(true)
            return
          }
          else {
            const foundUser = ( await this.conectionsService.get('admin/user/me').toPromise() as any)
            console.log(foundUser);

            if ( foundUser.hasOwnProperty('admin') && foundUser.admin ){
              await this.localStorageService.remove(environment.admin_user_tag)
              await this.localStorageService.set(environment.admin_user_tag, foundUser);
              resolve(true) ;
            }
            else {
              this.router.navigateByUrl('auth')
              resolve(false)
            }
          }

        }
      )
  }

}
