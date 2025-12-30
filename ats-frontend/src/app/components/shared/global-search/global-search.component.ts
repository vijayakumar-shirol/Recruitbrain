import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { GlobalSearchService, GlobalSearchResult } from '../../../services/global-search.service';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent],
  template: `
    <div class="relative w-full max-w-xl mx-auto" #searchContainer>
      <!-- Search Input -->
      <div class="relative group">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
          <i class="bi bi-search"></i>
        </span>
        <input
          type="text"
          [(ngModel)]="query"
          (ngModelChange)="onSearchInput()"
          (focus)="showResults = results.length > 0"
          placeholder="Search candidates, jobs, or clients..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all font-sans text-sm"
        >
        <span *ngIf="loading" class="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 animate-pulse">
          Searching...
        </span>
      </div>

      <!-- Results Dropdown -->
      <div *ngIf="showResults" class="absolute mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] transition-all transform origin-top">
        <div class="max-h-[400px] overflow-y-auto py-2">
          <div *ngFor="let result of results" 
               (click)="navigateToResult(result)"
               class="flex items-center px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors group">
            
            <div class="flex-shrink-0">
              <app-avatar 
                [name]="result.title" 
                [imageUrl]="result.imageUrl" 
                [size]="36" 
                [type]="getAvatarType(result.type)">
              </app-avatar>
            </div>
            
            <div class="ml-3 flex-1">
              <p class="text-sm font-semibold text-gray-900 group-hover:text-primary">{{ result.title }}</p>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-blue-100 text-blue-700': result.type === 'CANDIDATE',
                        'bg-green-100 text-green-700': result.type === 'JOB',
                        'bg-purple-100 text-purple-700': result.type === 'CLIENT'
                      }">
                  {{ result.type }}
                </span>
                <span class="text-xs text-gray-400 font-medium truncate max-w-[150px]">{{ result.subtitle }}</span>
              </div>
            </div>
            
            <span class="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <i class="bi bi-arrow-right"></i>
            </span>
          </div>
          
          <div *ngIf="results.length === 0 && query.length >= 3" class="px-4 py-6 text-center">
            <p class="text-gray-400 text-sm">No results found for "{{ query }}"</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    input::placeholder { font-weight: 400; color: #9ca3af; }
  `]
})
export class GlobalSearchComponent {
  query: string = '';
  results: GlobalSearchResult[] = [];
  showResults: boolean = false;
  loading: boolean = false;
  private searchSubject = new Subject<string>();

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  constructor(private searchService: GlobalSearchService, private router: Router) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) {
          this.loading = false;
          return of([]);
        }
        this.loading = true;
        return this.searchService.search(query);
      })
    ).subscribe(results => {
      this.results = results;
      this.loading = false;
      this.showResults = this.query.length >= 3;
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.query);
  }

  getAvatarType(type: string): 'candidate' | 'client' | 'job' | 'user' {
    switch(type) {
      case 'CANDIDATE': return 'candidate';
      case 'CLIENT': return 'client';
      case 'JOB': return 'job';
      default: return 'user';
    }
  }

  navigateToResult(result: GlobalSearchResult) {
    this.showResults = false;
    this.query = '';
    this.results = [];
    
    let path = '';
    switch(result.type) {
      case 'CANDIDATE': path = `/candidates/${result.id}`; break;
      case 'JOB': path = `/jobs/${result.id}`; break;
      case 'CLIENT': path = `/clients/${result.id}`; break;
    }
    this.router.navigateByUrl(path);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.showResults = false;
    }
  }
}
