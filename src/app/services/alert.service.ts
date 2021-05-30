import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
// import { Plugins } from '@capacitor/core';
// const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  channelName: string;
  constructor() {
    LocalNotifications.createChannel({
      id: 'CurrencyAlerts',
      name: 'CurrencyAlerts',
      importance: 5,
      description: 'Currency alerts',
      sound: 'notification.mp3',
      visibility: 1,
      vibration: true,
      lights: true,
    });
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
          // sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
          smallIcon: 'drawable-hdpi-icon',
          channelId: 'CurrencyAlerts',
        },
      ],
    });
  }
}
