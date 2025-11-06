import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PollService } from '../../services/poll.service';

@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class PresenterComponent {
  pollService = inject(PollService);
  location = inject(Location);

  question = signal('¿Cuál es tu framework favorito?');
  options = signal(['Angular', 'React', 'Vue', 'Svelte']);
  linkCopied = signal(false);

  poll = this.pollService.currentPoll;
  totalVotes = this.pollService.totalVotes;

  // Color palette inspired by the user's image and Tailwind's palette
  private readonly colors = ['#22d3ee', '#c084fc', '#fb923c', '#f472b6', '#84cc16', '#ef4444', '#f59e0b', '#10b981'];

  pollResults = computed(() => {
    const poll = this.poll();
    const total = this.totalVotes();

    // Default state for the legend before any votes are cast
    const legend = (poll ? poll.options : []).map((opt, i) => ({
      ...opt,
      percentage: 0,
      color: this.colors[i % this.colors.length],
    }));

    if (!poll || total === 0) {
      return {
        gradient: 'conic-gradient(#e2e8f0 0% 100%)',
        legend,
      };
    }

    const legendItems = poll.options.map((option, index) => {
      const percentage = (option.votes / total) * 100;
      return {
        ...option,
        percentage,
        color: this.colors[index % this.colors.length],
      };
    });
    
    // For a visually pleasing gradient, sort items by percentage
    const sortedForGradient = [...legendItems].sort((a, b) => b.percentage - a.percentage);

    let cumulativePercentage = 0;
    const gradientStops = sortedForGradient
      .filter(item => item.percentage > 0)
      .map(item => {
        const start = cumulativePercentage;
        cumulativePercentage += item.percentage;
        const end = cumulativePercentage;
        return `${item.color} ${start}% ${end}%`;
      }).join(', ');

    return {
      gradient: `conic-gradient(${gradientStops || '#e2e8f0 0% 100%'})`,
      legend: legendItems, // Use original order for legend
    };
  });

  qrCodeUrl = computed(() => {
    const poll = this.poll();
    if (!poll) return '';
    const pollUrl = window.location.origin + this.location.prepareExternalUrl(`/vote/${poll.id}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pollUrl)}`;
  });
  
  pollUrl = computed(() => {
     const poll = this.poll();
     if (!poll) return '';
     return window.location.origin + this.location.prepareExternalUrl(`/vote/${poll.id}`);
  });

  addOption() {
    this.options.update(opts => [...opts, '']);
  }

  removeOption(index: number) {
    this.options.update(opts => opts.filter((_, i) => i !== index));
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
  
  updateOption(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.options.update(opts => {
        const newOpts = [...opts];
        newOpts[index] = inputElement.value;
        return newOpts;
    });
  }

  createPoll() {
    const validOptions = this.options().filter(opt => opt.trim() !== '');
    if (this.question().trim() && validOptions.length >= 2) {
      this.pollService.createPoll(this.question(), validOptions);
    }
  }

  resetPoll() {
    this.pollService.resetPoll();
  }

  copyUrlToClipboard(): void {
    const url = this.pollUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.linkCopied.set(true);
        setTimeout(() => this.linkCopied.set(false), 2000);
      });
    }
  }
}