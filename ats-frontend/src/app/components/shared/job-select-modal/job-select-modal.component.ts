import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-job-select-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-select-modal.component.html',
  styleUrls: ['./job-select-modal.component.scss']
})
export class JobSelectModalComponent implements OnInit {
  @Input() excludeIds: number[] = [];
  @Output() closeParams = new EventEmitter<void>();
  @Output() jobSelected = new EventEmitter<Job>();

  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  searchTerm: string = '';
  selectedJob: Job | null = null;
  loading: boolean = false;

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs.filter(j => j.status === 'OPEN' && !this.excludeIds.includes(j.id!)); 
        this.filteredJobs = this.jobs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.loading = false;
      }
    });
  }

  filterJobs() {
    if (!this.searchTerm) {
      this.filteredJobs = this.jobs;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredJobs = this.jobs.filter(job => 
      job.title.toLowerCase().includes(term) || 
      job.client.name.toLowerCase().includes(term) ||
      (job.location && job.location.toLowerCase().includes(term))
    );
  }

  selectJob(job: Job) {
    this.selectedJob = job;
  }

  close() {
    this.closeParams.emit();
  }

  confirm() {
    if (this.selectedJob) {
      this.jobSelected.emit(this.selectedJob);
    }
  }
}
