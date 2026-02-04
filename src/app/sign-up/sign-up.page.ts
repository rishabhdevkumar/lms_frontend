import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StudentHeaderComponent } from "../student/components/student-header/student-header.component";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, StudentHeaderComponent]
})
export class SignUpPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
