import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { StudentHeaderComponent } from "../student/components/student-header/student-header.component";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule, StudentHeaderComponent],
})
export class HomePage {
  constructor() {}
}
