import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashGroup } from './dash-group/dash-group';

@Component({
  selector: 'app-groups',
  imports: [CommonModule, DashGroup],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups {
}