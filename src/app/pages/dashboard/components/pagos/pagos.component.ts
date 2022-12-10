import { Component, OnInit, ViewChild } from '@angular/core';
import { ConectionsService, Source } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';
import { stringify } from 'qs'

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PagosComponent implements OnInit {

  @ViewChild('searchBar') searchBar: any

  path = 'basic/client'
  user = 8;


  constructor(private http: ConectionsService, private tools: ToolsService) { }
  /* DataSource initied */
  dataSource = new Source(this.http)

  ngOnInit() { }


  /* Searching method */
  handleSearch(event: any) {
    const { value } = event.detail
    if (value == '' || value.trim() == '') {
      this.dataSource.clear()
      return;
    }
    let query = this.buildQuery({
      filters: {
        $or: [
          !isNaN(value) ? this.buildObj('id', value) : {},
          this.buildObj('identification', value),
          this.buildObj('name.$containsi', value),
          this.buildObj('business.name.$containsi', value),
        ]
      }
    })
    query = this.path.includes('?') ? `&${query}` : `?${query}`
    this.dataSource.setPath = this.path + query
  }
  handleCrear(event) {
    this.dataSource.clear()
  }

  /*Click handler */
  onClickUser(id) {
    this.searchBar.value = ''
    this.dataSource.clear()
    this.user = id
  }

  /*Pages tools */
  buildObj(key, value) {
    let paths = key.split('.')
    let builded = value;
    if (paths.length > 1) {
      for (let i = paths.length - 1; i >= 0; i--) {
        builded = { [paths[i]]: builded }
      }
      return builded
    }
    return { [key]: value }
  }

  buildQuery(obj: any) {
    return stringify(obj)
  }



}


