import { Access } from '../models/access';
import { FirebaseAbstract } from './abstract';
import { CollecionName } from '../enums/collection-name.enum';

class AccessContentRepository extends FirebaseAbstract<Access> {
  constructor() {
    super(CollecionName.AccessContents);
  }
}

export default new AccessContentRepository();
