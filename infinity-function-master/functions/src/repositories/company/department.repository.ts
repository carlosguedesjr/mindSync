import { FirebaseAbstract } from '../abstract';
import { Department } from '../../models/company';
import { CollecionName } from '../../enums/collection-name.enum';

class CompanyDepartmentRepository extends FirebaseAbstract<Department> {
  constructor() {
    super(CollecionName.CompanyDepartments);
  }
}

export default new CompanyDepartmentRepository();
