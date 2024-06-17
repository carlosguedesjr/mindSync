import { FirebaseAbstract } from './abstract';
import { Application } from '../models/application';
import { CollecionName } from '../enums/collection-name.enum';

class ApplicationRepository extends FirebaseAbstract<Application> {
  constructor() {
    super(CollecionName.Applications);
  }
}

export default new ApplicationRepository();
