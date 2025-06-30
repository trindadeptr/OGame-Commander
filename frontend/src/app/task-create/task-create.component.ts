import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-create',
  standalone: true,
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css'],
  imports: [CommonModule, FormsModule]
})
export class TaskCreateComponent {
  type = 'CHECK_ACTIVITY';
  botId = '';
  universeId = '';

  constructor(private taskService: TaskService, private router: Router) {}

  create() {
    const task = {type: this.type, botId: this.botId, universeId: this.universeId};
    this.taskService.create(task).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => alert('Failed to create task')
    });
  }
}
