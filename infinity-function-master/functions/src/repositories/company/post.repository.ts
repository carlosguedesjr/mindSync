import { Post } from '../../models/company';
import { FirebaseAbstract } from '../abstract';
import { CollecionName } from '../../enums/collection-name.enum';

class CompanyPostRepository extends FirebaseAbstract<Post> {
  constructor() {
    super(CollecionName.CompanyPosts);
  }
}

export default new CompanyPostRepository();
