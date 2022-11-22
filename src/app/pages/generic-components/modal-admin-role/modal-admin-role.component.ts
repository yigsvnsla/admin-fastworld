import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ConectionsService } from 'src/app/services/connections.service';
import { ToolsService } from 'src/app/services/tools.service';

@Component({
  selector: 'app-modal-admin-role',
  templateUrl: './modal-admin-role.component.html',
  styleUrls: ['./modal-admin-role.component.scss'],
})
export class ModalAdminRoleComponent implements OnInit {

  /* Get id of user to fetch basic information, after register from admin panel */
  @Input() user: number

  basic: any = {};
  formAdmin: FormGroup

  /* loading handler */
  loading: boolean = false;

  constructor(private modal: ModalController,
    private connection: ConectionsService,
    private tools: ToolsService,
    private builder: FormBuilder) { }

  ngOnInit() {
    this.formAdmin = this.builder.group({
      name: ['', Validators.required],
      role: ['admin', Validators.required]
    })
  }


  close(value?: any) {
    this.modal.dismiss(value)
  }

  async submit() {
    this.loading = true;
    try {
      let response = await this.connection.post(`user/admin/${this.user}`, this.formAdmin.value).toPromise();
      this.close(response)
    } catch (error) {
      console.log("Error on modal", error)
    } finally {
      this.loading = false;
    }
  }




}
