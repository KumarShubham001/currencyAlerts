import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { GlobalFieldService } from './../services/global-field.service';
import { LOCALSTORAGE } from './../common/global-vars';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  _storage: any;
  alertList: any = [];
  fetchCoinSub: Subscription;
  alertIntervalSub: any;

  constructor(
    private storage: Storage,
    private fieldService: GlobalFieldService,
    public actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    this._storage = await this.storage.create();
    this.fetchAlertList();
  }

  async fetchAlertList() {
    this.alertIntervalSub = setInterval(() => {
      if (this.fetchCoinSub) {
        this.fetchCoinSub.unsubscribe();
      }

      this._storage?.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
        if (res) {
          const alertList = JSON.parse(res);
          this.alertList = alertList;

          this.fetchCoinDetails();
        }
      });
    }, 1000);
  }

  doRefresh(event) {
    if (this.fetchCoinSub) {
      this.fetchCoinSub.unsubscribe();
    }

    clearInterval(this.alertIntervalSub);

    this.fetchAlertList().then((res) => {
      event.target.complete();
    });
  }

  fetchCoinDetails() {
    this.fetchCoinSub = this.fieldService
      .getMarketDetails()
      .subscribe((result) => {
        if (result) {
          this.alertList.forEach((element) => {
            element['currValue'] = result[element.currency].sell;
            element['change'] =
              Number(result[element.currency].day_percentage_change) > 0
                ? '+' + result[element.currency].day_percentage_change
                : result[element.currency].day_percentage_change;
            element['status'] =
              result[element.currency].day_percentage_change > 0
                ? 'success'
                : 'danger';
          });
        }
      });
  }

  async presentActionSheet(data) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Remove alert for ' + data.currency + ' ?',
      cssClass: 'custom-ActionSheet',
      buttons: [
        {
          text: 'Remove',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteFromStorage(data);
          },
        },
      ],
    });
    await actionSheet.present();
  }

  deleteFromStorage(e) {
    const alertList = this.alertList.filter((item) => item != e);
    this._storage.set(LOCALSTORAGE.ALERT_LIST, JSON.stringify(alertList));
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    clearInterval(this.alertIntervalSub);
    this.fetchCoinSub.unsubscribe();
  }
}
