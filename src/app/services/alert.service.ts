import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  channelId: string = null;

  constructor(private platform: Platform) {
    if (platform.is('hybrid')) {
      this.channelId = String(Date.now());

      LocalNotifications.createChannel({
        id: this.channelId,
        name: 'CurrencyAlerts',
        importance: 5,
        description: 'Currency alerts',
        sound: 'notification.mp3',
        visibility: 1,
        vibration: true,
        lights: true,
      });
    }
  }

  async requestPermission() {
    await LocalNotifications.requestPermissions();
  }

  async isAllowedNotification() {
    return await LocalNotifications.checkPermissions();
  }

  async alert(title, body) {
    const randomId = Date.now() + 69;

    return await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: randomId,
          schedule: { at: new Date(Date.now() + 500) },
          attachments: null,
          actionTypeId: '',
          extra: null,
          channelId: this.channelId,
        },
      ],
    });
  }
}
