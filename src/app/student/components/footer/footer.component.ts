import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class FooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
