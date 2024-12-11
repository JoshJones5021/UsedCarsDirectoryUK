import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [
    { username: 'admin', email: 'admin@example.com', full_name: 'Admin User' },
    { username: 'user1', email: 'user1@example.com', full_name: 'User One' }
  ];

  constructor() {}

  ngOnInit(): void {}
}