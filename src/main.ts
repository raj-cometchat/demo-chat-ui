import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CometChat } from '@cometchat-pro/chat';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// import {HomeComponent} from './app/pages/home/home.component'



if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  // cometchat
  // cometchat init
  // let router : Router
let appID = '198232259084bcd9';
let region = 'us';
let appSetting = new CometChat.AppSettingsBuilder()

  .subscribePresenceForAllUsers()
  .setRegion(region)
  .build();
CometChat.init(appID, appSetting).then(
  () => {
    console.log('Initialization completed successfully');
    // location.href="./logout/logout.component.html"

  },
  (error) => {
    console.log('Initialization failed with error:', error);
  }
);
