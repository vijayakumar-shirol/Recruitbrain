import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent as Cropper, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, Cropper],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white rounded-[5px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 class="text-xl font-bold text-gray-800">{{ title }}</h3>
          <button (click)="cancel.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col items-center">
          <div class="w-full bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 mb-4">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="true"
              [aspectRatio]="aspectRatio"
              format="png"
              (imageCropped)="imageCropped($event)"
              (imageLoaded)="imageLoaded($event)"
              (cropperReady)="cropperReady()"
              (loadImageFailed)="loadImageFailed()"
              class="max-h-[500px]"
            ></image-cropper>
          </div>

          <div *ngIf="croppedImage" class="mt-4 flex flex-col items-center">
            <p class="text-sm text-gray-500 mb-2">Preview:</p>
            <div class="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <img [src]="croppedImage" alt="Cropped preview" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-white">
          <button 
            (click)="cancel.emit()" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            [disabled]="!croppedImage"
            (click)="saveImage()" 
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ImageCropperComponent {
  @Input() imageChangedEvent: any = '';
  @Input() title: string = 'Crop Image';
  @Input() aspectRatio: number = 1 / 1;
  @Output() cropped = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  croppedImage: any = '';

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl || event.base64;
  }

  imageLoaded(image: LoadedImage) {
    // show cropper
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
    alert('Failed to load image. Please try another file.');
    this.cancel.emit();
  }

  saveImage() {
    if (this.croppedImage) {
      this.cropped.emit(this.croppedImage);
    }
  }
}
