import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  isLoading: boolean;
  constructor(private loadingController: LoadingController) {}

  async show(message: string, duration?: number) {
    this.isLoading = true;

    const loading = await this.loadingController.create({
      cssClass: 'custom-loader',
      message: message,
      duration: duration,
    });
    await loading.present();
  }

  async hide() {
    if (this.isLoading && (await this.loadingController.getTop())) {
      this.isLoading = false;
      return await this.loadingController
        .dismiss()
        .then(() => console.log('Loading Dismissed'));
    }
  }
}
