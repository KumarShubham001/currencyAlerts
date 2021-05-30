import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalFieldService {
  private coinList: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private marketDetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private coinDetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private serverError: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor() {}

  isServerError() {
    return this.serverError.asObservable();
  }

  setServerError(status) {
    return this.serverError.next(status);
  }

  getCoinList() {
    return this.coinList.asObservable();
  }

  setCoinList(list: any) {
    this.coinList.next(list);
  }

  getMarketDetails() {
    return this.marketDetails.asObservable();
  }

  setMarketDetails(list: any) {
    this.marketDetails.next(list);
  }

  getCoinDetails() {
    return this.coinDetails.asObservable();
  }

  setCoinDetails(list: any) {
    this.coinDetails.next(list);
  }
}
