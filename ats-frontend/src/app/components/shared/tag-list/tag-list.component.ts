import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag } from '../../../models/tag.model';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2">
      <span *ngFor="let tag of tags" 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            [style.background-color]="tag.color + '15'"
            [style.color]="tag.color"
            [style.border-color]="tag.color + '40'">
        {{ tag.name }}
        <button *ngIf="editable" 
                (click)="onRemove(tag)" 
                class="ms-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-black/10 transition-colors">
          <i class="bi bi-x text-[10px]"></i>
        </button>
      </span>
      <button *ngIf="editable" 
              (click)="onAdd()" 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
        <i class="bi bi-plus me-1"></i> Add Tag
      </button>
    </div>
  `
})
export class TagListComponent {
  @Input() tags: Tag[] = [];
  @Input() editable: boolean = false;
  @Output() remove = new EventEmitter<Tag>();
  @Output() add = new EventEmitter<void>();

  onRemove(tag: Tag) {
    this.remove.emit(tag);
  }

  onAdd() {
    this.add.emit();
  }
}
