import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tag } from '../../../models/tag.model';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'app-tag-select-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content max-w-md" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 leading-tight">Manage Tags</h2>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Existing Tags -->
          <div>
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Available Tags</h3>
            <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              <button *ngFor="let tag of allTags" 
                      (click)="toggleTag(tag)"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all"
                      [style.background-color]="isTagSelected(tag) ? tag.color + '20' : 'transparent'"
                      [style.color]="tag.color"
                      [style.border-color]="isTagSelected(tag) ? tag.color : '#e5e7eb'"
                      [class.shadow-sm]="isTagSelected(tag)">
                {{ tag.name }}
                <i class="ms-1.5 bi" [class.bi-check-lg]="isTagSelected(tag)" [class.bi-plus]="!isTagSelected(tag)"></i>
              </button>
              <div *ngIf="allTags.length === 0" class="text-xs text-gray-400 italic">No tags created yet.</div>
            </div>
          </div>

          <!-- Create New Tag -->
          <div class="pt-6 border-t border-gray-100">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Create New Tag</h3>
            <div class="flex gap-3 items-end">
              <div class="flex-1">
                <input type="text" [(ngModel)]="newTagName" 
                       placeholder="Tag name..." 
                       class="w-100 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              </div>
              <div>
                <input type="color" [(ngModel)]="newTagColor" 
                       class="h-9 w-9 p-0.5 border border-gray-200 rounded-lg cursor-pointer">
              </div>
              <button (click)="createTag()" 
                      [disabled]="!newTagName"
                      class="h-9 px-4 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest">
                Create
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button (click)="onClose()" class="btn-primary w-full py-2.5">
            Done
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 5px;
      padding: 2rem;
      width: 95%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--primary-hover-color); }
  `]
})
export class TagSelectModalComponent implements OnInit {
  @Input() selectedTags: Tag[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() tagsChanged = new EventEmitter<Tag[]>();

  allTags: Tag[] = [];
  newTagName: string = '';
  newTagColor: string = '#6366f1';

  constructor(private tagService: TagService) {}

  ngOnInit() {
    this.loadAllTags();
  }

  loadAllTags() {
    this.tagService.getAllTags().subscribe(tags => {
      this.allTags = tags;
    });
  }

  toggleTag(tag: Tag) {
    if (this.isTagSelected(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
    } else {
      this.selectedTags = [...this.selectedTags, tag];
    }
    this.tagsChanged.emit(this.selectedTags);
  }

  isTagSelected(tag: Tag): boolean {
    return this.selectedTags.some(t => t.id === tag.id);
  }

  createTag() {
    if (!this.newTagName) return;
    
    const newTag: Tag = {
      name: this.newTagName,
      color: this.newTagColor
    };

    this.tagService.createTag(newTag).subscribe(tag => {
      this.allTags.push(tag);
      this.toggleTag(tag);
      this.newTagName = '';
    });
  }

  onClose() {
    this.close.emit();
  }
}
