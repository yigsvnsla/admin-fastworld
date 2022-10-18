import { Component, OnInit } from '@angular/core';
import { ConectionsService } from 'src/app/services/connections.service';
import { CookiesService } from 'src/app/services/cookies.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})



export class DashboardPage implements OnInit {

  public sectionMenu: routerMenu[]

  private encomiendaRoutes : routerMenu[]
  private usersRouters : routerMenu[]

  private adminRoute: routerMenu[] = [
    {
      title: 'Administracion',
      url: 'administracion',
      options: [
        {
          title: 'Planes',
          url: 'planes',
          icon: 'list',
        }, {
          title: 'Lotes',
          url: 'lotes',
          icon: 'grid',
        }, {
          title: 'Vehículos',
          url: 'vehiculos',
          icon: 'car',
        }
      ]
    }, {
      title: 'Usuarios',
      url: 'usuarios',
      options: [
        {
          title: 'Afiliados',
          url: 'administrar',
          icon: 'people-circle',
        }
      ]
    }, {
      title: 'Polizas',
      url: 'polizas',
      options: [{
        title: 'Administrar',
        url: '',
        icon: 'list',
      },
      {
        title: 'Crear',
        url: 'crear',
        icon: 'create',
      }
      ]
    }
  ]

  constructor(
    private toolsService: ToolsService,
    private conectionsService: ConectionsService,
    private cookiesService: CookiesService
  ) {
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
        url:'managers',
        icon:'person-circle'
      },{
        title:'empleados',
        url:'employed',
        icon:'people-circle'
      }]
    }]

  }

  ngOnInit() {
    this.sectionMenu = [...this.encomiendaRoutes,... this.usersRouters]
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
