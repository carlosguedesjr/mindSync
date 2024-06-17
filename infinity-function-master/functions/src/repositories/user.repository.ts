import { User } from '../models/user';
import { FirebaseAbstract } from './abstract';
import IPagination from '../interfaces/ipagination';
import { CollecionName } from '../enums/collection-name.enum';

class UserRepository extends FirebaseAbstract<User> {
  constructor() {
    super(CollecionName.Users);
  }

  async paginate(page: number, perPage: number) {
    const offset = (page - 1) * perPage;

    const { size, docs } = await this.collection()
      .limit(perPage)
      .offset(offset)
      .get();
    
    const pagination: IPagination = {
      page,
      perPage,
      pageCount: docs.length,
      totalCount: size
    };

    return {
      pagination,
      users: docs.map(doc => this.toObject(doc))
    };
  }
}

export default new UserRepository();
