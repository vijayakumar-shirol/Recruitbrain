import { Component, Input, Output, EventEmitter, OnInit, forwardRef, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LocationService } from '../../../services/location.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-location-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative location-input-container">
      <div class="input-wrapper">
        <i class="bi bi-geo-alt text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></i>
        <input
          type="text"
          class="form-input pl-10 w-full"
          [placeholder]="placeholder"
          [(ngModel)]="value"
          (input)="onInput($event)"
          (focus)="showSuggestions = true"
          [class.disabled]="disabled"
          [disabled]="disabled"
          autocomplete="off"
        />
        <i *ngIf="value && !disabled" 
           class="bi bi-x-circle-fill text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-gray-500"
           (click)="clear()">
        </i>
      </div>

      <!-- Suggestions Dropdown -->
      <div *ngIf="showSuggestions && suggestions.length > 0" 
           class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        <div *ngFor="let city of suggestions"
             (click)="selectCity(city)"
             class="px-4 py-2 hover:bg-primary-50 hover:text-primary-700 cursor-pointer text-sm text-gray-700 transition-colors flex items-center gap-2">
          <i class="bi bi-geo-alt-fill text-gray-400 text-xs"></i>
          {{ city }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-input {
      padding-top: 0.625rem;
      padding-bottom: 0.625rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .form-input.disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }
    
    /* Scrollbar for suggestions */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationInputComponent),
      multi: true
    }
  ]
})
export class LocationInputComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = 'Search city...';
  @Output() locationSelected = new EventEmitter<string>();

  value: string = '';
  suggestions: string[] = [];
  showSuggestions = false;
  disabled = false;

  private searchSubject = new Subject<string>();

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private locationService: LocationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.locationService.search(query))
    ).subscribe(results => {
      this.suggestions = results;
      this.showSuggestions = true;
    });
  }

  onInput(event: any) {
    const inputValue = event.target.value;
    this.value = inputValue;
    this.onChange(inputValue);
    this.onTouched();

    if (inputValue.length >= 2) {
      this.searchSubject.next(inputValue);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  selectCity(city: string) {
    this.value = city;
    this.onChange(city);
    this.showSuggestions = false;
    this.locationSelected.emit(city);
  }

  clear() {
    this.value = '';
    this.onChange('');
    this.suggestions = [];
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }
}
