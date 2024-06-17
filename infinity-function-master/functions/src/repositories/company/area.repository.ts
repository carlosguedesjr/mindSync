import { Area } from '../../models/company';
import { FirebaseAbstract } from '../abstract';
import { CollecionName } from '../../enums/collection-name.enum';

class CompanyAreaRepository extends FirebaseAbstract<Area> {
  constructor() {
    super(CollecionName.CompanyAreas);
  }
}

export default new CompanyAreaRepository();
