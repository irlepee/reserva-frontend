import { Component } from '@angular/core';
import { Footer } from '../../components/shared/footer/footer';
import { Header } from '../../components/shared/header/header';

@Component({
  selector: 'app-home',
  imports: [Footer, Header],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
