import { CoreService } from './core.service';
import { Injectable } from '@angular/core';
import { GlobalFieldService } from './global-field.service';

import { OPERATION_TYPE } from './../common/global-vars';

@Injectable({
  providedIn: 'root',
})
export class CoinServiceService {
  constructor(
    private fieldService: GlobalFieldService,
    private coreService: CoreService
  ) {}

  updateINRMarketDetails() {
    const req = {};

    this.coreService
      .invokePostWithSession(OPERATION_TYPE.GET_INSTA_MARKET_DETAILS, req)
      .subscribe((response) => {
        this.fieldService.setMarketDetails(response.inr_market_details);
      });

    setInterval(() => {
      this.coreService
        .invokePostWithSession(OPERATION_TYPE.GET_INSTA_MARKET_DETAILS, req)
        .subscribe((response) => {
          this.fieldService.setMarketDetails(response.inr_market_details);
        });
    }, 2000);
  }
}
