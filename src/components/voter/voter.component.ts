import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../models/poll.model';

@Component({
  selector: 'app-voter',
  templateUrl: './voter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class VoterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollService = inject(PollService);

  poll = this.pollService.currentPoll;
  pollId: string | null = null;
  hasVoted = signal(false);
  isLoading = signal(true);

  votedStorageKey = computed(() => `voted-on-poll-${this.pollId}`);

  ngOnInit() {
    this.pollId = this.route.snapshot.paramMap.get('pollId');
    const currentPoll = this.poll();

    if (!this.pollId || !currentPoll || this.pollId !== currentPoll.id) {
      // In a real app, you might fetch the poll here.
      // In this simulation, if the poll isn't active in the service, it doesn't exist.
      this.router.navigate(['/']);
      return;
    }
    
    // Check local storage if user has already voted in this session
    if (localStorage.getItem(this.votedStorageKey())) {
      this.hasVoted.set(true);
    }
    
    this.isLoading.set(false);
  }

  vote(optionIndex: number) {
    if (this.hasVoted() || !this.pollId) return;

    this.pollService.addVote(this.pollId, optionIndex);
    this.hasVoted.set(true);
    localStorage.setItem(this.votedStorageKey(), 'true');
  }
}
