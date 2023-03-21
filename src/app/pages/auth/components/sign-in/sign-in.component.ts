import { ConectionsService } from './../../../../services/connections.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  public formLogin: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private conectionsService: ConectionsService
  ) { }

  ngOnInit() {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required,]],
      pass: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  public submit() {
    this.conectionsService.signIn(this.formLogin.value).subscribe();
  }

}
