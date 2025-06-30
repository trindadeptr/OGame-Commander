import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TaskService, Task } from '../services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
  imports: [CommonModule]
})
export class TaskDetailComponent implements OnInit {
  task?: Task;
  constructor(private route: ActivatedRoute, private taskService: TaskService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskService.get(id).subscribe(t => this.task = t);
    }
  }
}
