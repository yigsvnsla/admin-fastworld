import { LocalStorageService } from './../../services/local-storage.service';
import { Component, OnInit } from '@angular/core';
import { ConectionsService, SocketService } from 'src/app/services/connections.service';
import { CookiesService } from 'src/app/services/cookies.service';
import { ToolsService } from 'src/app/services/tools.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})



export class DashboardPage implements OnInit {


  public sectionMenu: routerMenu[]

  private encomiendaRoutes : routerMenu[]
  private usersRouters : routerMenu[]


  constructor(
    private toolsService: ToolsService,
    private conectionsService: ConectionsService,
    private cookiesService: CookiesService,
    private socketService: SocketService,
    private localStorageService:LocalStorageService
  ) {

  }


  ngOnInit() {

    this.socketService.setAuth = this.cookiesService.get(environment['admin_cookie_tag']).replace(/"/g,'')
    this.socketService.connect()

    this.socketService.on('connect',(arg, callback) =>{
      console.log('Connect socket');

    })
  }

 async ionViewDidEnter() {



  const {admin} = await this.localStorageService.get(environment.admin_user_tag)




  if (admin.role == 'administrador'){
    this.encomiendaRoutes = [{
      title:'Encomiendas',
      url:'encomiendas',
      options:[{
        title:'Activas',
        url:'activas',
        icon:'cube'
      },{
        title:'Historial',
        url:'historial',
        icon:'list'
      },{
        title:'Seguimiento',
        url:'seguimiento',
        icon:'location'
      }]
    }]

    this.usersRouters = [{
      title:'Usuarios',
      url:'usuarios',
      options:[{
        title:'crear',
        url:'crear',
        icon:'person'
      },{
        title:'clientes',
        url:'clientes',
        icon:'people'
      },{
        title:'motorizados',
        url:'conductores',
        icon:'bicycle'
      },{
        title:'encargados',
        url:'encargados',
        icon:'person-circle'
      }
      /* ,{
        title:'empleados',
        url:'employed',
        icon:'people-circle'
      } */
    ]
    }]
    this.sectionMenu = [...this.encomiendaRoutes,... this.usersRouters]
  }
  if (admin.role == 'encargado'){
    this.encomiendaRoutes = [{
      title:'Encomiendas',
      url:'encomiendas',
      options:[{
        title:'Activas',
        url:'activas',
        icon:'cube'
      },{
        title:'Historial',
        url:'historial',
        icon:'list'
      },{
        title:'Seguimiento',
        url:'seguimiento',
        icon:'location'
      }]
    }]

    this.usersRouters = [{
      title:'Usuarios',
      url:'usuarios',
      options:[{
        title:'clientes',
        url:'clientes',
        icon:'people'
      },
      /* ,{
        title:'empleados',
        url:'employed',
        icon:'people-circle'
      } */
    ]
    }]
    this.sectionMenu = [...this.encomiendaRoutes,... this.usersRouters]
  }

 }

  onLogOut(){
    this.conectionsService.logOut()
  }

}

interface routerMenu{
  title: string,
  url: string,
  icon?: string,
  options?: routerMenu[]
}
