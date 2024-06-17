import { Injectable } from '@angular/core';
import { Subscription as DefaultSubscription } from 'rxjs';

import { Student } from '../models/student';
import { UtilService } from './util.service';
import { Subscription } from '../models/subscription';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private subscriptions: {tag: string; sub: DefaultSubscription}[] = [];

  constructor() {}

  // STUDENT
  set setUser(data: Student) {
    localStorage.setItem('user', JSON.stringify(data));
  }
  get getUser(): Student {
    return JSON.parse(localStorage.getItem('user'));
  }
  removeUser() {
    localStorage.removeItem('user');
  }

  // SUBSCRIPTION
  set setSubscriptions(data: Subscription[]) {
    localStorage.setItem('subscriptions', JSON.stringify(data));
  }
  get getSubscriptions(): Subscription[] {
    return UtilService.transformTimestampToDate(JSON.parse(localStorage.getItem('subscriptions')));
  }
  removeSubscriptions() {
    localStorage.removeItem('subscriptions');
  }

  // OBSERVABLE
  set addObservable(data: {tag: string; sub: DefaultSubscription}) {
    const index = this.subscriptions.findIndex(sub => sub.tag === data.tag);
    if (index >= 0) {
      this.subscriptions[index].sub.unsubscribe();
      this.subscriptions.splice(index, 1);
    }
    this.subscriptions.push(data);
  }

  clearObservables() {
    for (const subscribe of this.subscriptions) subscribe.sub.unsubscribe();
    this.subscriptions = [];
  }
}
