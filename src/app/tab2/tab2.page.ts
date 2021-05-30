import { AfterViewInit, Component, OnInit } from '@angular/core';
// import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';

// import { Keyboard } from '@capacitor/keyboard';

import { GlobalFieldService } from './../services/global-field.service';
import { LoadingService } from './../services/loading.service';

import { LOCALSTORAGE } from './../common/global-vars';
import { CreateAlertComponent } from './create-alert/create-alert.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit, AfterViewInit {
  currSegment: string;
  currMarketDetails: any;
  filteredList: any;
  _storage: any;
  alertList: any;
  favouriteList: any;
  error: boolean = false;
  contentLoaded: boolean = false;
  fetchMarketSubs: Subscription;
  refreshSubs: Subscription;
  swipeAllowed: boolean = true;
  favIntervalSub: any;

  constructor(
    private fieldService: GlobalFieldService,
    private modalController: ModalController,
    private storage: Storage,
    private loadingService: LoadingService
  ) {}

  async ngOnInit() {
    this._storage = await this.storage.create();
    this.error = false;
    this.contentLoaded = false;
    this.currSegment = 'all';
    this.favouriteList = [];
  }

  ngAfterViewInit() {
    this.checkFavourites();
    this.fetchMartketDetails();
  }

  checkFavourites() {
    this.favIntervalSub = setInterval(() => {
      this._storage?.get(LOCALSTORAGE.FAVOURITES).then((res) => {
        this.favouriteList = res ? JSON.parse(res) : [];
      });
    }, 1000);
  }

  doRefresh(event) {
    this.currMarketDetails = [];
    this.error = false;
    this.contentLoaded = false;

    if (this.fetchMarketSubs) this.fetchMarketSubs.unsubscribe();

    this.refreshSubs = this.fieldService.getMarketDetails().subscribe(
      (result) => {
        event.target.complete();

        if (result) {
          this.currMarketDetails = [];

          for (let item in result) {
            const tempItem = {
              name: item,
              ...result[item],
              status:
                Number(result[item].day_percentage_change) > 0
                  ? 'success'
                  : 'danger',
              day_percentage_change:
                Number(result[item].day_percentage_change) > 0
                  ? '+' + result[item].day_percentage_change
                  : result[item].day_percentage_change,
            };
            this.currMarketDetails.push(tempItem);
          }

          this.filteredList.forEach((element, index) => {
            for (let item of this.currMarketDetails) {
              if (element.name == item.name) {
                this.filteredList[index] = { ...item };
                break;
              }
            }
          });

          this.contentLoaded = true;
        } else {
          this.error = true;
        }
      },
      (err) => {
        event.target.complete();
        this.error = true;
      }
    );
  }

  fetchMartketDetails() {
    // start the loading
    this.loadingService.show('Please wait. . .', 2000);
    this.error = false;
    this.filteredList = [];

    this.fetchMarketSubs = this.fieldService.getMarketDetails().subscribe(
      (result) => {
        if (result) {
          this.currMarketDetails = [];

          for (let item in result) {
            const tempItem = {
              name: item,
              ...result[item],
              status:
                Number(result[item].day_percentage_change) > 0
                  ? 'success'
                  : 'danger',
              day_percentage_change:
                Number(result[item].day_percentage_change) > 0
                  ? '+' + result[item].day_percentage_change
                  : result[item].day_percentage_change,
            };
            this.currMarketDetails.push(tempItem);
          }

          // sort the result based on the market value
          this.currMarketDetails = this.currMarketDetails.sort((a, b) =>
            a.name < b.name ? -1 : a.name < b.name ? 1 : 0
          );

          if (this.filteredList.length > 0) {
            this.filteredList.forEach((element, index) => {
              for (let item of this.currMarketDetails) {
                if (element.name == item.name) {
                  this.filteredList[index] = { ...item };
                  break;
                }
              }
            });
          } else {
            this.filteredList = [...this.currMarketDetails];
          }

          // Stop the loading
          this.loadingService.hide();
          this.contentLoaded = true;
        } else {
          // Stop the loading
          this.loadingService.hide();
          this.error = true;
        }
      },
      (err) => {
        // Stop the loading
        this.loadingService.hide();
        this.error = true;
      }
    );
  }

  updateResult(e) {
    const searchText = e.target.value.toLowerCase();

    if (searchText == '') {
      this.filteredList = [...this.currMarketDetails];
    } else {
      this.filteredList = [...this.currMarketDetails].filter((item) =>
        item.name.toLowerCase().includes(searchText)
      );
    }
  }

  async showModal(e) {
    const modal = await this.modalController.create({
      component: CreateAlertComponent,
      cssClass: 'customModal bottomHalfModal',
      componentProps: {
        currency: e,
      },
      swipeToClose: true,
      presentingElement: await this.modalController.getTop(), // Get the top-most ion-modal
    });
    await modal.present();

    await modal.onWillDismiss().then((e) => {
      if (e.data != undefined) {
        this.setAlert(e.data);
      }
    });
  }

  setAlert(data) {
    this._storage?.get(LOCALSTORAGE.ALERT_LIST).then((res) => {
      let alertList = res ? JSON.parse(res) : [];

      if (alertList && alertList.length > 0) {
        alertList.push(data);
      } else {
        alertList = [{ ...data }];
      }

      this._storage?.set(LOCALSTORAGE.ALERT_LIST, JSON.stringify(alertList));
    });
  }

  segmentChanged(ev: any) {
    this.contentLoaded = false;
    this.currSegment = ev.target.value;
    this.filteredList = [...this.currMarketDetails];
    this.contentLoaded = true;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    clearInterval(this.favIntervalSub);
    if (this.refreshSubs) this.refreshSubs.unsubscribe();
    if (this.fetchMarketSubs) this.fetchMarketSubs.unsubscribe();
  }
}
