import { FirebaseAbstract } from './abstract';
import { Subscription } from '../models/subscription';
import { CollecionName } from '../enums/collection-name.enum';

class SubscriptionRepository extends FirebaseAbstract<Subscription> {
  constructor() {
    super(CollecionName.Subscriptions);
  }
}

export default new SubscriptionRepository();
