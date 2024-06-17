export class CivilStatus {
  id: string;
  name: string;

  static get all() {
    return  [
      {id: 'married', name: 'Casado(a)'},
      {id: 'divorced', name: 'Divorciado(a)'},
      {id: 'single', name: 'Solteiro(a)'},
      {id: 'widower', name: 'Viúvo(a)'}
    ] as CivilStatus[];
  }
}
