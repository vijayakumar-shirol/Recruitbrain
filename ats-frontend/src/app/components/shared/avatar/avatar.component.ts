import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [style.width.px]="size" 
      [style.height.px]="size" 
      [style.font-size.px]="size / 2.5"
      class="relative flex items-center justify-center rounded-full overflow-hidden border-2 border-white shadow-sm"
      [ngClass]="getBackgroundClass()"
    >
      <img 
        *ngIf="imageUrl" 
        [src]="imageUrl" 
        [alt]="name"
        class="w-full h-full object-cover"
        (error)="handleImageError()"
      />
      <span *ngIf="!imageUrl || imageError" class="font-semibold text-white uppercase">
        {{ getInitials() }}
      </span>
    </div>
  `,
  styles: [`
    :host {
      
    }
  `]
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() imageUrl: string | null | undefined = undefined;
  @Input() size: number = 40;
  @Input() type: 'candidate' | 'client' | 'job' | 'user' = 'user';

  imageError = false;

  getInitials(): string {
    if (!this.name) return '?';
    const parts = this.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  getBackgroundClass(): string {
    if (this.imageUrl && !this.imageError) return 'bg-gray-100';
    
    switch (this.type) {
      case 'candidate': return 'bg-blue-500';
      case 'client': return 'bg-purple-500';
      case 'job': return 'bg-emerald-500';
      case 'user': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  }

  handleImageError() {
    this.imageError = true;
  }
}
