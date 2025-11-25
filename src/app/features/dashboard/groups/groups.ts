import { Component } from '@angular/core';
import { GroupService } from '../../../core/services/group-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-groups',
  imports: [CommonModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups {
  constructor(private groupService: GroupService) { }

  groups: any = [];

  ngOnInit() {
    this.groupService.getGroups()
      .then(data => {
        this.groups = data;
        console.log(data);
      })
      .catch(err => {
        console.log(err);
        this.groups = [];
      });
  }
}
