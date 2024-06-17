import { FirebaseAbstract } from '../abstract';
import { Instruction } from '../../models/assessment';
import { CollecionName } from '../../enums/collection-name.enum';

class AssessmentInstructionRepository extends FirebaseAbstract<Instruction> {
  constructor() {
    super(CollecionName.AssessmentInstructions);
  }
}

export default new AssessmentInstructionRepository();
