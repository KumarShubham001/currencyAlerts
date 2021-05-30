import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalFieldService } from './../services/global-field.service';

import { ROUTES } from './../common/global-vars';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.scss'],
})
export class ServerErrorComponent implements OnInit {
  constructor(
    private router: Router,
    private fieldService: GlobalFieldService
  ) {}

  ngOnInit() {}

  tryAgain() {
    this.router.navigate([ROUTES.HOME]);
  }
}
