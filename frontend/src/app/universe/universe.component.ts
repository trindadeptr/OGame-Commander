import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniverseService, Universe } from '../services/universe.service';

@Component({
  selector: 'app-universe',
  standalone: true,
  templateUrl: './universe.component.html',
  styleUrls: ['./universe.component.css'],
  imports: [CommonModule, FormsModule]
})
export class UniverseComponent implements OnInit {
  universes: Universe[] = [];
  edit?: Universe;

  constructor(private service: UniverseService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.list().subscribe(u => this.universes = u);
  }

  editUniverse(u: Universe) {
    this.edit = {...u};
  }

  create() {
    if (this.edit) {
      this.service.save(this.edit).subscribe(() => { this.edit = undefined; this.load(); });
    }
  }
}
