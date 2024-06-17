import { Base } from './base';

export class Assessment extends Base {
  name!: string;
  duration!: number;
  groups: string[];
  instructions: string[];
  studentRequireds: string[];
  type!: 'neuro' | 'profile' | 'objective';

  _groups?: Group[];
  _questions?: Question[];
  _instructions?: Instruction[];

  constructor() {
    super();
    this.groups = [];
    this.instructions = [];
    this.studentRequireds = [];
  }

  static get getTypes() {
    return [
      {id: 'neuro', name: 'Neuro'},
      {id: 'profile', name: 'Perfil'},
      {id: 'objective', name: 'Objetivo'}
    ];
  }

  get getTypeName() {
    return Question.getTypes.find(type => type.id === this.type)?.name;
  }

  static get getStudentRequireds() {
    return [
      {id: 'name', name: 'Nome'},
      {id: 'email', name: 'E-mail'},
      {id: 'image', name: 'Imagem'},
      {id: 'phone', name: 'Telefone'},
      {id: 'genre', name: 'Gênero'},
      {id: 'childrens', name: 'Filhos'},
      {id: 'rg', name: 'RG'},
      {id: 'cpf', name: 'CPF'},
      {id: 'scholarity', name: 'Escolaridade'},
      {id: 'civilStatus', name: 'Estado Civil'},
      {id: 'dateBirth', name: 'Data de Nascimento'},
      {id: 'motherName', name: 'Nome da Mãe'},
      {id: 'spouseName', name: 'Nome do Cônjuge'},

      {id: 'address', name: 'Endereço'},
      {id: 'placeBirth', name: 'Nascionalidade'},
      {id: 'course', name: 'Curso Superior'},
      {id: 'company', name: 'Empresa'},
      {id: 'social', name: 'Redes Sociais'},
    ];
  }

  static getStudentRequiredName(id: string) {
    return Assessment.getStudentRequireds.find(item => item.id === id)?.name;
  }
}

export class Instruction extends Base {
  title!: string;
  text!: string;
  images: string[];

  constructor() {
    super();
    this.images = [];
  }
}

export class Group extends Base {
  name!: string;
  image!: string;
  questions: string[];

  _questions?: Question[];

  constructor() {
    super();
    this.questions = [];
  }
}

export class Question extends Base {
  title!: string;
  text!: string;
  point?: number;
  result?: string;
  images: string[];
  alternatives?: Alternative[];
  type!: 'neuro' | 'profile' | 'objective';

  constructor() {
    super();
    this.images = [];
  }

  static get getTypes() {
    return [
      {id: 'neuro', name: 'Neuro'},
      {id: 'profile', name: 'Perfil'},
      {id: 'objective', name: 'Objetivo'}
    ];
  }

  get getTypeName() {
    return Question.getTypes.find(type => type.id === this.type)?.name;
  }

  static get getNeuroResults() {
    return [
      {id: 'NB', name: 'NB'},
      {id: 'NA', name: 'NA'},
      {id: 'PB', name: 'PB'},
      {id: 'PA', name: 'PA'}
    ];
  }
}

export class Alternative {
  text!: string;
  type?: string;
  isCorrect?: boolean;

  static get getProfileTypes() {
    return [
      {id: 'dog', name: 'Cachorro'},
      {id: 'lion', name: 'Leão'},
      {id: 'monkey', name: 'Macaco'},
      {id: 'peacock', name: 'Pavão'}
    ];
  }
}
