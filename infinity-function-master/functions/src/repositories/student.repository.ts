import { Student } from '../models/student';
import { FirebaseAbstract } from './abstract';
import { CollecionName } from '../enums/collection-name.enum';

class StudentRepository extends FirebaseAbstract<Student> {
  constructor() {
    super(CollecionName.Students);
  }
}

export default new StudentRepository();
