export class Genre {
  id: string;
  name: string;

  static get all() {
    return  [
      {id: 'fem', name: 'Feminino'},
      {id: 'masc', name: 'Masculino'},
      {id: 'other', name: 'Outro'},
    ] as Genre[];
  }
}
