import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i class="bi bi-search text-gray-400"></i>
      </div>
      <input
        type="text"
        [(ngModel)]="searchTerm"
        (ngModelChange)="onSearchChange($event)"
        [placeholder]="placeholder"
        class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
      />
    </div>
  `,
  styles: []
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Output() search = new EventEmitter<string>();

  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.search.emit(term);
    });
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }
}
