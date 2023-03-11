import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { ToolsService } from 'src/app/services/tools.service';
import { PrompUserComponent } from './components/promp-user/promp-user.component';
import { userModel } from './components/resume/resume.component';

@Component({
  selector: 'app-finanzas',
  templateUrl: './finanzas.page.html',
  styleUrls: ['./finanzas.page.scss'],
})
export class FinanzasPage implements OnInit {

  date = format(new Date(), 'yyyy-MM-dd')
  mode: 'all' | 'providers' | 'drivers' = 'all'
  user: userModel | null;

  constructor(private tools: ToolsService) {

  }


  ngOnInit() {

  }

  onChangeDate(event) {
    const { value } = event.detail
    this.date = String(value);
    console.log(this.date)
  }

  toggleView(target: 'all' | 'providers' | 'drivers') {
    if (target == 'all') {
      this.mode = target;
      this.user = null;
      return;
    }
    this.tools.showModal({
      component: PrompUserComponent,
      componentProps: {
        target
      }
    }).then(res => {
      if (!res) {
        return;
      }
      this.mode = target;
      this.user = res;
    })
  }

}
