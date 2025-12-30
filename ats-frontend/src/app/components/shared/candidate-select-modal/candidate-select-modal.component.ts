import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Candidate } from '../../../models/candidate.model';
import { CandidateService } from '../../../services/candidate.service';

@Component({
  selector: 'app-candidate-select-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-select-modal.component.html',
  styleUrls: ['./candidate-select-modal.component.scss']
})
export class CandidateSelectModalComponent implements OnInit {
  @Input() excludeIds: number[] = [];
  @Output() closeParams = new EventEmitter<void>();
  @Output() candidatesSelected = new EventEmitter<Candidate[]>();

  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  searchTerm: string = '';
  selectedCandidates: Candidate[] = [];
  loading: boolean = false;

  constructor(private candidateService: CandidateService) {}

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.loading = true;
    this.candidateService.getAllCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates.filter(c => !this.excludeIds.includes(c.id!));
        this.filteredCandidates = this.candidates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.loading = false;
      }
    });
  }

  filterCandidates() {
    if (!this.searchTerm) {
      this.filteredCandidates = this.candidates;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCandidates = this.candidates.filter(c => 
      c.firstName.toLowerCase().includes(term) || 
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }

  toggleSelection(candidate: Candidate) {
    const index = this.selectedCandidates.findIndex(c => c.id === candidate.id);
    if (index > -1) {
      this.selectedCandidates.splice(index, 1);
    } else {
      this.selectedCandidates.push(candidate);
    }
  }

  isSelected(candidate: Candidate): boolean {
    return this.selectedCandidates.some(c => c.id === candidate.id);
  }

  close() {
    this.closeParams.emit();
  }

  confirm() {
    if (this.selectedCandidates.length > 0) {
      this.candidatesSelected.emit(this.selectedCandidates);
    }
  }
}
