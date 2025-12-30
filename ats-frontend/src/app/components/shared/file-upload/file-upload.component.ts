import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Upload Area -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors"
           (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        
        <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden">
        
        <div class="space-y-2">
          <div class="text-4xl">📎</div>
          <div class="text-sm text-gray-600">
            <button (click)="fileInput.click()" class="text-primary-600 font-semibold hover:text-primary-700">
              Click to upload
            </button> 
            or drag and drop
          </div>
          <div class="text-xs text-gray-400">PDF, DOC, DOCX up to 10MB</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-primary-600 h-2.5 rounded-full" [style.width.%]="uploadProgress"></div>
      </div>

      <!-- File List -->
      <div class="space-y-2">
        <div *ngFor="let file of attachments" class="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 rounded text-gray-500">📄</div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ file.fileName }}</p>
              <p class="text-xs text-gray-500">{{ formatSize(file.size) }} • {{ file.uploadedAt | date }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button (click)="onQuickView(file)" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
              <i class="bi bi-eye"></i> Quick View
            </button>
            <button (click)="downloadFile(file)" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
              Download
            </button>
            <button (click)="deleteFile(file)" class="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete
            </button>
          </div>
        </div>
        
        <div *ngIf="attachments.length === 0" class="text-center py-4 text-gray-500 text-sm">
          No documents attached yet.
        </div>
      </div>
    </div>
  `
})
export class FileUploadComponent implements OnInit {
  @Input() relatedType!: string;
  @Input() relatedId!: number;
  @Output() quickView = new EventEmitter<any>();
  
  attachments: any[] = [];
  uploadProgress = 0;
  
  private apiUrl = 'http://localhost:8080/api/attachments';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAttachments();
  }

  loadAttachments() {
    this.http.get<any[]>(`${this.apiUrl}/${this.relatedType}/${this.relatedId}`)
      .subscribe(data => this.attachments = data);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  onDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedType', this.relatedType);
    formData.append('relatedId', this.relatedId.toString());

    this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress = 0;
          this.loadAttachments();
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Upload failed!');
        this.uploadProgress = 0;
      }
    });
  }

  downloadFile(file: any) {
    window.open(`${this.apiUrl}/download/${file.id}`, '_blank');
  }

  deleteFile(file: any) {
    if(confirm('Are you sure?')) {
      this.http.delete(`${this.apiUrl}/${file.id}`).subscribe(() => {
        this.loadAttachments();
      });
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onQuickView(file: any) {
    this.quickView.emit(file);
  }
}
