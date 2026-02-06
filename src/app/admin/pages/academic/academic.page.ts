import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: 'app-academic',
  templateUrl: './academic.page.html',
  styleUrls: ['./academic.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AcademicPage implements OnInit {
   activeTab = 'session';

  constructor() { }

  ngOnInit() {
  }

}
