import { FirebaseAbstract } from '../abstract';
import { Question } from '../../models/assessment';
import { CollecionName } from '../../enums/collection-name.enum';

class AssessmentQuestionRepository extends FirebaseAbstract<Question> {
  constructor() {
    super(CollecionName.AssessmentQuestions);
  }
}

export default new AssessmentQuestionRepository();
