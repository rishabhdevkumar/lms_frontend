import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { StudentHeaderComponent } from "../student/components/student-header/student-header.component";
import { FooterComponent } from "../student/components/footer/footer.component";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, StudentHeaderComponent, FooterComponent],
})
export class HomePage {
  constructor() {}
}
