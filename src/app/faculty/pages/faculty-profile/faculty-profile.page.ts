import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-faculty-profile',
  templateUrl: './faculty-profile.page.html',
  styleUrls: ['./faculty-profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FacultyProfilePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
