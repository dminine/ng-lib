import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


export abstract class SubscriptionBaseComponent implements OnDestroy {
  protected subscription: Subscription = new Subscription();

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
