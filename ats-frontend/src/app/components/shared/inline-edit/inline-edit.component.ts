import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inline-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inline-edit-container group" [class.editing]="isEditing">
      <!-- Display Mode -->
      <div *ngIf="!isEditing" 
           (click)="enableEdit()" 
           class="cursor-pointer flex items-center gap-2 py-1 -ms-1 px-1 rounded hover:bg-slate-50 transition-colors">
        
        <!-- Value Present -->
        <ng-container *ngIf="value !== null && value !== '' && value !== undefined; else emptyState">
          <ng-content></ng-content> <!-- Custom display content via transclusion -->
          <!-- Default text display if no content projected and value is simple -->
          <!-- Default text display removed to prevent double rendering with projection -->
          
          <i class="bi bi-pencil-fill text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </ng-container>

        <!-- Empty State -->
        <ng-template #emptyState>
          <span class="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
            <i class="bi bi-plus-lg"></i> Add {{ label }}
          </span>
        </ng-template>
      </div>

      <!-- Edit Mode -->
      <div *ngIf="isEditing" class="flex items-start gap-2 animate-in fade-in zoom-in duration-200">
        <div class="flex-1">
          <input *ngIf="type === 'text' || type === 'email' || type === 'tel' || type === 'url' || type === 'number'" 
                 [type]="type" 
                 [(ngModel)]="editedValue" 
                 (keydown.enter)="save()"
                 (keydown.escape)="cancel()"
                 class="w-full text-sm font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none bg-transparent px-1 py-0.5"
                 [placeholder]="placeholder || 'Enter ' + label"
                 autoFocus>
          
          <textarea *ngIf="type === 'textarea'"
                    [(ngModel)]="editedValue"
                    rows="3"
                    class="w-full text-sm font-bold text-slate-800 border-2 border-indigo-100 rounded-lg focus:outline-none focus:border-indigo-500 bg-white p-2"
                    [placeholder]="placeholder || 'Enter ' + label"></textarea>
                    
          <select *ngIf="type === 'select'"
                  [(ngModel)]="editedValue"
                  (change)="save()"
                  class="w-full text-sm font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none bg-transparent px-1 py-0.5">
             <option *ngFor="let opt of options" [value]="opt.value">{{ opt.label }}</option>
          </select>
          
          <input *ngIf="type === 'date'"
                 type="date"
                 [(ngModel)]="editedValue"
                 (keydown.enter)="save()"
                 class="w-full text-sm font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none bg-transparent px-1 py-0.5">
        </div>

        <div class="flex gap-1 shrink-0">
          <button (click)="save()" class="w-6 h-6 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors shadow-sm">
            <i class="bi bi-check-lg text-xs"></i>
          </button>
          <button (click)="cancel()" class="w-6 h-6 rounded bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors">
            <i class="bi bi-x-lg text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InlineEditComponent implements OnInit {
  @Input() value: any;
  @Input() label: string = 'Value';
  @Input() type: 'text' | 'textarea' | 'select' | 'date' | 'email' | 'tel' | 'url' | 'number' = 'text';
  @Input() placeholder: string = '';
  @Input() options: {label: string, value: any}[] = [];
  
  @Output() saveValue = new EventEmitter<any>();

  isEditing = false;
  editedValue: any;
  hasProjectedContent = false; // logic to detect transclusion would be complex, simplifying for now

  ngOnInit() {
    // Basic check if user is projecting content (wrapper usage)
    // For simplicity, we'll assume if they use the component like <app-inline-edit>...</app-inline-edit>, 
    // they are projecting content. But angular doesn't easily expose this in simple inputs.
    // Instead, we will always show 'value' if type is simple, unless overridden.
    // Actually, let's keep it simple: WE ALWAYS DISPLAY 'value' unless it's empty.
    // Transclusion is tricky with *ngIf toggling.
  }

  enableEdit() {
    this.editedValue = this.value;
    this.isEditing = true;
    
    // Auto-focus logic can be added here with ViewChild
    setTimeout(() => {
        const input = document.querySelector('.inline-edit-container input, .inline-edit-container textarea, .inline-edit-container select') as HTMLElement;
        if(input) input.focus();
    });
  }

  save() {
    if (this.editedValue !== this.value) {
      this.saveValue.emit(this.editedValue);
    }
    this.isEditing = false;
  }

  cancel() {
    this.isEditing = false;
  }
}
