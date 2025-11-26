import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  constructor(public router: Router) { }

  ngOnInit() {
    this.router.navigate(['dashboard/home']);
  }
}
