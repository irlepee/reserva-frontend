import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-home',
  imports: [Footer, Header],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
