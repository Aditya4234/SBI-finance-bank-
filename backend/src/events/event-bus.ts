import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'events';
import { DomainEvent, DomainEventPayload } from './events';
import { getContext } from '../context/app-context';

class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  emit(eventName: DomainEvent, data: Record<string, any>): void {
    const ctx = getContext();
    const payload: DomainEventPayload = {
      eventId: uuidv4(),
      eventName,
      correlationId: ctx.correlationId,
      timestamp: new Date(),
      data,
    };
    this.emitter.emit(eventName, payload);
  }

  on(eventName: DomainEvent, handler: (payload: DomainEventPayload) => void | Promise<void>): void {
    this.emitter.on(eventName, handler);
  }

  off(eventName: DomainEvent, handler: (payload: DomainEventPayload) => void | Promise<void>): void {
    this.emitter.off(eventName, handler);
  }

  removeAllListeners(eventName?: DomainEvent): void {
    if (eventName) {
      this.emitter.removeAllListeners(eventName);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

export const eventBus = new EventBus();
