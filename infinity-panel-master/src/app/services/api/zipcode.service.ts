import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';

interface Zipcode {
  uf: string;
  cep: string;
  bairro: string;
  localidade: string;
  logradouro: string;
  complemento: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZipcodeService {

  constructor(
    private http: HttpClient
  ) { }

  get(zipcode: string): Promise<Zipcode> {
    return new Promise((resolve, reject) => {
      this.http.get(`https://viacep.com.br/ws/${zipcode}/json/`).toPromise().then(res => {
        if (res) resolve(res as Zipcode);
        else reject();
      });
    });
  }
}
