import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddTreatLetters {

  constructor(
  ){
  }

  // Criar Letras maúsculas para os nomes
  capitalizeFirstLetters(name: string) {
    const arr = name.split(' ');
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(' ');
  }

  // Junta as letras com underline e torna-as em minúsculas
  underscoreLetters(name: string) {
    const arr = name.split(' ');
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toLowerCase() + arr[i].slice(1);
    }
    return arr.join('_');
  }
}
