import { FirebaseAbstract } from '../abstract';
import { Assessment } from '../../models/assessment';
import { CollecionName } from '../../enums/collection-name.enum';

class AssessmentRepository extends FirebaseAbstract<Assessment> {
  constructor() {
    super(CollecionName.Assessments);
  }
}

export default new AssessmentRepository();
