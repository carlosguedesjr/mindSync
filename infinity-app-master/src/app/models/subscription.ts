import { Base } from '../models/base';

export class Subscription extends Base {
  access: Access;
  student: Student;

  mbaIds: string[];
  courseIds: string[];
  assessmentIds: string[];

  constructor() {
    super();
    this.mbaIds = [];
    this.courseIds = [];
    this.assessmentIds = [];
    this.access = new Access();
    this.student = new Student();
  }
}

class Access {
  id: string;
  code: string;
}

class Student {
  id: string;
  name: string;
}
