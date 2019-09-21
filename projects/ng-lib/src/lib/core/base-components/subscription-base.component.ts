import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HashMap } from '../../types';
import { generateId } from '../utils';

export interface SubscriptionOutput {
  name: string;
  subscription: Subscription;
}

export abstract class SubscriptionBaseComponent implements OnDestroy {
  protected subscriptionMap: HashMap<Subscription> = {};
  protected subscription: Subscription = new Subscription();

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addSubscription(subscription: Subscription): SubscriptionOutput {
    const name = generateId(4);

    if (this.subscriptionMap[name]) {
      return this.addSubscription(subscription);
    }

    return this.setSubscription(name, subscription);
  }

  setSubscription(name: string, subscription: Subscription): SubscriptionOutput {
    if (this.subscriptionMap[name]) {
      this.subscriptionMap[name].unsubscribe();
    }

    this.subscriptionMap[name] = this.subscription.add(subscription);

    return { name, subscription: this.subscription[name] };
  }

  removeSubscription(name: string): void {
    if (this.subscriptionMap[name]) {
      this.subscription.remove(this.subscriptionMap[name]);
      this.subscriptionMap[name].unsubscribe();
      delete this.subscriptionMap[name];
    }
  }
}
