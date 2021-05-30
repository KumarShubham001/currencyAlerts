1. Move the notification.mp3 from assets/mp3 to the android, the file should be in res/raw folder

2. Generate and copy the resources for android
Run npm install cordova-res --save-dev
Create 1024x1024px icon at resources/icon.png
Create 2732x2732px splash at resources/splash.png
Add "resources": "cordova-res ios && cordova-res android && node scripts/resources.js" to scripts in package.json
Copy resources.js file to scripts/resources.js
scripts/resources.js
Run npm run resources

3. if lint error comes
Add android {
    lintOptions {
        abortOnError false
    }

in build.gradle under android folder

4. For notification icon
visit https://romannurik.github.io/AndroidAssetStudio/icons-notification.html

upload svg with padding 15% and download the zip
extract the zip and copy the icon inside drawable-xxxhdpi to android\app\src\main\res\drawable

Add
"plugins": {
		"LocalNotifications": {
			"smallIcon": "ic_stat_onesignal_default"
		}
	}
in capacitor.config.json

restart the project