import { Company } from '../../models/company';
import { FirebaseAbstract } from '../abstract';
import { CollecionName } from '../../enums/collection-name.enum';

class CompanyRepository extends FirebaseAbstract<Company> {
  constructor() {
    super(CollecionName.Companies);
  }
}

export default new CompanyRepository();
