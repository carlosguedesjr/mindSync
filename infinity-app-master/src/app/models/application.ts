import { Base } from './base';
import { Question } from './assessment';

export class Application extends Base {
  init: Date;
  end?: Date;
  answers: Answer[];
  student: ApplicationStudent;

  mba?: MBA;
  course?: Course;
  assessment?: Assessment;

  constructor() {
    super();
    this.answers = [];
    this.init = new Date();
    this.student = new ApplicationStudent();
  }
}

export class Answer {
  datetime: Date;
  question: Question;

  alternative?: string;
  neuro: {
    intensity: number;
    satisfaction: number;
  };

  constructor() {
    this.datetime = new Date();
  }
}

class ApplicationStudent {
  id: string;
  name: string;
}

class MBA {
  id: string;
  name: string;
}

class Course {
  id: string;
  name: string;
}

class Assessment {
  id: string;
  name: string;
  accessId: string;
}
