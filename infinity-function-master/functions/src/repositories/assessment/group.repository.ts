import { FirebaseAbstract } from '../abstract';
import { Group } from '../../models/assessment';
import { CollecionName } from '../../enums/collection-name.enum';

class AssessmentGroupRepository extends FirebaseAbstract<Group> {
  constructor() {
    super(CollecionName.AssessmentGroups);
  }
}

export default new AssessmentGroupRepository();
