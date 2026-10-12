import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as IonicIcons from 'ionicons/icons'

import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgxSonnerToaster],
})
export class AppComponent {
  constructor() {
    addIcons({...IonicIcons})
  }
}
