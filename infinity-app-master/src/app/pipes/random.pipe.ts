import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'random'
})
export class RandomPipe implements PipeTransform {

  transform(list: any[]): any[] {
    if (list) return list.sort((a, b) => Math.random() - 0.5);
    return list;
  }

}
