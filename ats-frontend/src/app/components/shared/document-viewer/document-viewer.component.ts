import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ document?.fileName }}</h2>
          <button (click)="close()" class="close-button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Document Preview Area -->
        <div class="preview-container">
          <!-- PDF Preview -->
          <iframe 
            *ngIf="isPDF()" 
            [src]="getSafeUrl()" 
            class="preview-iframe"
            frameborder="0">
          </iframe>

          <!-- Office Document Preview (Google Docs Viewer) -->
          <iframe 
            *ngIf="isOfficeDoc()" 
            [src]="getGoogleDocsViewerUrl()" 
            class="preview-iframe"
            frameborder="0">
          </iframe>

          <!-- Image Preview -->
          <div *ngIf="isImage()" class="image-preview">
            <img [src]="getDownloadUrl()" [alt]="document?.fileName" class="preview-image">
          </div>

          <!-- Unsupported Format -->
          <div *ngIf="!isPDF() && !isOfficeDoc() && !isImage()" class="unsupported-format">
            <i class="bi bi-file-earmark-x text-6xl text-gray-400 mb-4"></i>
            <p class="text-lg font-semibold text-gray-700 mb-2">Preview not available</p>
            <p class="text-sm text-gray-500 mb-4">This file type cannot be previewed directly.</p>
            <a [href]="getDownloadUrl()" target="_blank" class="download-button">
              <i class="bi bi-download me-2"></i>
              Download File
            </a>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <a [href]="getDownloadUrl()" target="_blank" class="btn-download">
            <i class="bi bi-download me-2"></i>Download
          </a>
          <button (click)="close()" class="btn-close-footer">Close</button>
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
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 5px;
      width: 100%;
      max-width: 1200px;
      height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 1rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .preview-container {
      flex: 1;
      overflow: hidden;
      position: relative;
      background: #f9fafb;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .image-preview {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow: auto;
    }

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .unsupported-format {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .download-button {
      display: inline-flex;
      align-items: center;
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 0.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .download-button:hover {
      background: var(--primary-hover-color);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-download {
      display: inline-flex;
      align-items: center;
      background: var(--primary-color);
      color: white;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .btn-download:hover {
      background: var(--primary-hover-color);
    }

    .btn-close-footer {
      background: white;
      color: #6b7280;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      border: 1px solid #d1d5db;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .btn-close-footer:hover {
      background: #f9fafb;
      border-color: #9ca3af;
      color: #374151;
    }
  `]
})
export class DocumentViewerComponent {
  @Input() document: any;
  @Output() closed = new EventEmitter<void>();

  private apiUrl = 'http://localhost:8080/api/attachments';

  constructor(private sanitizer: DomSanitizer) {}

  close() {
    this.closed.emit();
  }

  getDownloadUrl(): string {
    return `${this.apiUrl}/download/${this.document?.id}`;
  }

  getSafeUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getDownloadUrl());
  }

  getGoogleDocsViewerUrl(): SafeResourceUrl {
    const documentUrl = encodeURIComponent(this.getDownloadUrl());
    const url = `https://docs.google.com/viewer?url=${documentUrl}&embedded=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isPDF(): boolean {
    const fileName = this.document?.fileName?.toLowerCase() || '';
    return fileName.endsWith('.pdf');
  }

  isOfficeDoc(): boolean {
    const fileName = this.document?.fileName?.toLowerCase() || '';
    const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    return officeExtensions.some(ext => fileName.endsWith(ext));
  }

  isImage(): boolean {
    const fileName = this.document?.fileName?.toLowerCase() || '';
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.endsWith(ext));
  }
}
