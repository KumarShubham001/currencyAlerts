import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CoinServiceService } from './services/coin-service.service';
import { AlertService } from './services/alert.service';
import { GlobalFieldService } from './services/global-field.service';

import { LOCALSTORAGE, ROUTES } from './common/global-vars';

// for Background task
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { BackgroundTask } from '@robingenz/capacitor-background-task';

// cordova plugin
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  marketDetailsList: any;
  _storage: any;
  alertList: any;
  getMarketDetailsSub: Subscription;
  currNotification: any;
  fetchInterval: any;
  platform: Platform;

  constructor(
    private storage: Storage,
    private coinService: CoinServiceService,
    private alertService: AlertService,
    private fieldService: GlobalFieldService,
    private router: Router,
    platform: Platform,
    private backgroundMode: BackgroundMode
  ) {
    this.platform = platform;
  }

  ngOnInit() {
    this.coinService.updateINRMarketDetails();

    // check for android or web-browser
    if (this.platform.is('hybrid')) {
      // override the back button of the android device to move the app in the background rather than closing it
      this.backgroundMode.overrideBackButton();

      this.initStorage().then((e) => {
        this.fetchInterval = setInterval(() => {
          if (this.getMarketDetailsSub) this.getMarketDetailsSub.unsubscribe();

          this._storage.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
            if (res) {
              this.alertList = JSON.parse(res);

              // get the market details
              this.getMarketDetailsSub = this.fieldService
                .getMarketDetails()
                .subscribe((list) => {
                  if (list) this.checkValidity({ ...list });
                });
            }
          });
        }, 2000);
      });

      App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          return;
        }

        // The app state has been changed to inactive.
        // Start the background task by calling `beforeExit`.
        const taskId = await BackgroundTask.beforeExit(async () => {
          // Run your code...
          // Finish the background task as soon as everything is done.
          // BackgroundTask.finish({ taskId });

          clearInterval(this.fetchInterval);

          this.fetchInterval = setInterval(() => {
            if (this.getMarketDetailsSub)
              this.getMarketDetailsSub.unsubscribe();

            this._storage.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
              if (res) {
                this.alertList = JSON.parse(res);

                // get the market details
                this.getMarketDetailsSub = this.fieldService
                  .getMarketDetails()
                  .subscribe((list) => {
                    if (list) this.checkValidity({ ...list });
                  });
              }
            });
          }, 3000);
        });
      });
    } else {
      this.initStorage().then((e) => {
        this.fetchInterval = setInterval(() => {
          if (this.getMarketDetailsSub) this.getMarketDetailsSub.unsubscribe();

          this._storage.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
            if (res) {
              this.alertList = JSON.parse(res);

              // get the market details
              this.getMarketDetailsSub = this.fieldService
                .getMarketDetails()
                .subscribe((list) => {
                  if (list) this.checkValidity({ ...list });
                });
            }
          });
        }, 2000);
      });
    }

    // route to tabs
    this.router.navigate([ROUTES.CURRENCY]);
  }

  async initStorage() {
    this._storage = await this.storage.create();
  }

  checkValidity(list: any) {
    // create array
    const currencyList: any = [];
    for (let key in list) {
      currencyList.push({
        ...list[key],
        name: key,
      });
    }

    this.alertList.forEach((alert) => {
      // alert past price
      const pastPrice = this.marketDetailsList
        ? this.marketDetailsList.filter(
            (item) => item.name == alert.currency
          )[0].sell
        : 0;

      const currPrice = currencyList.filter(
        (item) => item.name == alert.currency
      )[0].sell;

      if (
        (Number(pastPrice) < Number(alert.target) &&
          Number(alert.target) < Number(currPrice)) ||
        (Number(pastPrice) > Number(alert.target) &&
          Number(alert.target) > Number(currPrice))
      ) {
        if (this.currNotification != alert.currency) {
          // show alert

          this.alertService.isAllowedNotification().then((e) => {
            if (e.display != 'granted') {
              this.alertService.requestPermission().then((e) => {
                console.log(e);
                this.notify(alert);
              });
            } else {
              this.notify(alert);
            }
          });

          this.currNotification = alert.currency;
        }
      }
    });

    // update the past list with current details for next iteration
    this.marketDetailsList = [...currencyList];
  }

  notify(alert) {
    this.alertService
      .alert(
        alert.currency,
        alert.currency + ' has reached target price of Rs. ' + alert.target
      )
      .then((e) => {
        console.log(
          alert.currency + ' has reached target price of Rs. ' + alert.target
        );

        // remove that alert from the alert list
        this.removeAlert(alert);
      });
  }

  removeAlert(alert) {
    this._storage.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
      if (res) {
        let alertList = JSON.parse(res);
        alertList = [
          ...alertList.filter(
            (item) =>
              item.currency != alert.currency ||
              (item.currency == alert.currency &&
                Number(item.target) != Number(alert.target))
          ),
        ];

        // set this new alert
        this._storage?.set(LOCALSTORAGE.ALERT_LIST, JSON.stringify(alertList));
      }
    });
  }
}
