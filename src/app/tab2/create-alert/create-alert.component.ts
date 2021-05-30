import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';

import { GlobalFieldService } from './../../services/global-field.service';

import { LOCALSTORAGE } from './../../common/global-vars';

@Component({
  selector: 'app-create-alert',
  templateUrl: './create-alert.component.html',
  styleUrls: ['./create-alert.component.scss'],
})
export class CreateAlertComponent implements OnInit {
  marketDetails: any = [];
  targetPrice: any;
  okButtonDisabled: boolean;
  alertForm: FormGroup;
  _storage: any;
  favourite: boolean;
  favouriteList: any = [];
  showKeyboard: boolean;
  marketDetailsSub: Subscription;

  @Input() currency: any = {};

  constructor(
    private modalController: ModalController,
    private fieldService: GlobalFieldService,
    private fb: FormBuilder,
    private storage: Storage
  ) {}

  async initStorage() {
    this._storage = await this.storage.create();
  }

  ngOnInit() {
    this.targetPrice = Number(this.currency.sell).toFixed();

    this.alertForm = this.fb.group({
      alertInput: [this.targetPrice, Validators.required],
    });

    this.okButtonDisabled = false;

    this.initStorage().then((e) => {
      this._storage?.get(LOCALSTORAGE.FAVOURITES).then((res) => {
        this.favouriteList = res ? JSON.parse(res) : [];

        if (
          this.favouriteList.length > 0 &&
          this.favouriteList.includes(this.currency.name)
        ) {
          this.favourite = true;
        } else {
          this.favourite = false;
        }
      });
    });

    this.marketDetailsSub = this.fieldService
      .getMarketDetails()
      .subscribe((result) => {
        for (let item in result) {
          if (item == this.currency.name) {
            this.currency = {
              ...this.currency,
              ...result[item],
              status:
                Number(result[item].day_percentage_change) > 0
                  ? 'success'
                  : 'danger',
              day_percentage_change:
                Number(result[item].day_percentage_change) > 0
                  ? '+' + Number(result[item].day_percentage_change)
                  : Number(result[item].day_percentage_change),
            };

            break;
          }
        }
      });
  }

  valueChanged(e) {
    if (!e.target.value) {
      this.okButtonDisabled = true;
    } else {
      this.okButtonDisabled = false;
    }
  }

  formSubmitEvent() {
    event.preventDefault();

    this.modalController.dismiss({
      currency: this.currency.name,
      target: this.alertForm.get('alertInput').value,
    });
  }

  updateFav() {
    let tempArr = [];

    if (this.favourite) {
      // remove the item from the list
      tempArr = this.favouriteList.filter((item) => item != this.currency.name);
    } else {
      this.favouriteList.push(this.currency.name);
      tempArr = this.favouriteList;
    }

    // now set the list on the storage
    this._storage.set(LOCALSTORAGE.FAVOURITES, JSON.stringify(tempArr));
    this.favourite = !this.favourite;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    if (this.marketDetailsSub) {
      this.marketDetailsSub.unsubscribe();
    }
  }
}
