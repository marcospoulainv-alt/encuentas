import { Injectable, signal, computed } from '@angular/core';
import { Poll, PollOption } from '../models/poll.model';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private pollState = signal<Poll | null>(null);

  currentPoll = this.pollState.asReadonly();
  
  totalVotes = computed(() => {
    const poll = this.pollState();
    if (!poll) return 0;
    return poll.options.reduce((acc, option) => acc + option.votes, 0);
  });

  createPoll(question: string, options: string[]) {
    if (!question || options.length < 2) return;

    const newPoll: Poll = {
      id: this.generateId(),
      question,
      options: options.map(text => ({ text, votes: 0 })),
    };
    this.pollState.set(newPoll);
  }

  addVote(pollId: string, optionIndex: number) {
    this.pollState.update(poll => {
      if (poll && poll.id === pollId && poll.options[optionIndex]) {
        const newOptions = [...poll.options];
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          votes: newOptions[optionIndex].votes + 1,
        };
        return { ...poll, options: newOptions };
      }
      return poll;
    });
  }
  
  resetPoll() {
    this.pollState.set(null);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
