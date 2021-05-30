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
  marketDetails: any;
  fetchCoinSub: Subscription;
  alertIntervalSub: any;

  constructor(
    private storage: Storage,
    private fieldService: GlobalFieldService,
    public actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    this._storage = await this.storage.create();

    this.fetchCoinDetails();
    this.fetchAlertList();
  }

  fetchCoinDetails() {
    this.fetchCoinSub = this.fieldService
      .getMarketDetails()
      .subscribe((result) => {
        if (result) {
          this.marketDetails = result;
        }
      });
  }

  async fetchAlertList() {
    this.alertIntervalSub = setInterval(() => {
      this._storage?.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
        if (res) {
          const alertList = JSON.parse(res);
          this.alertList = alertList;

          if (
            this.marketDetails &&
            this.alertList &&
            this.alertList.length > 0
          ) {
            this.alertList.forEach((element) => {
              element['currValue'] = this.marketDetails[element.currency].sell;
              element['change'] =
                Number(
                  this.marketDetails[element.currency].day_percentage_change
                ) > 0
                  ? '+' +
                    this.marketDetails[element.currency].day_percentage_change
                  : this.marketDetails[element.currency].day_percentage_change;
              element['status'] =
                this.marketDetails[element.currency].day_percentage_change > 0
                  ? 'success'
                  : 'danger';
            });
          }
        }
      });
    }, 500);
  }

  doRefresh(event) {
    if (this.fetchCoinSub) {
      this.fetchCoinSub.unsubscribe();
    }
    this.fetchCoinDetails();

    clearInterval(this.alertIntervalSub);
    this.fetchAlertList().then((res) => {
      event.target.complete();
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
    const alertList = [...this.alertList].filter(
      (item) =>
        item.currency != e.currency ||
        (item.currency == e.currency && Number(item.target) != Number(e.target))
    );
    this._storage.set(LOCALSTORAGE.ALERT_LIST, JSON.stringify(alertList));
  }

  ngOnDestroy(): void {
    clearInterval(this.alertIntervalSub);
    this.fetchCoinSub.unsubscribe();
  }
}
