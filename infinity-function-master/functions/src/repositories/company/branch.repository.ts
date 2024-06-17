import { Branch } from '../../models/company';
import { FirebaseAbstract } from '../abstract';
import { CollecionName } from '../../enums/collection-name.enum';

class CompanyBranchRepository extends FirebaseAbstract<Branch> {
  constructor() {
    super(CollecionName.CompanyBranches);
  }
}

export default new CompanyBranchRepository();
