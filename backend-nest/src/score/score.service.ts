import { Injectable } from '@nestjs/common';
import type { RequestUser } from '../common/request-user';

export type ScoreEvent = {
  id: string;
  userId: string;
  action: string;
  points: number;
  createdAt: string;
};

@Injectable()
export class ScoreService {
  private readonly events: ScoreEvent[] = [];

  summaryFor(user: RequestUser) {
    const events = this.events.filter((event) => event.userId === user.id);
    return {
      total: events.reduce((sum, event) => sum + event.points, 0),
      events: events.map(({ userId: _userId, ...event }) => event),
    };
  }

  award(user: RequestUser, action: string, points: number) {
    const event: ScoreEvent = {
      id: `score_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      userId: user.id,
      action,
      points,
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(event);
    return event;
  }
}
