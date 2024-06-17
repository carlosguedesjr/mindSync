import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { FirebaseAbstract } from './abstract';
import { Student } from 'src/app/models/student';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends FirebaseAbstract<Student> {

  static collectionName = 'students';

  constructor(
    private _api: ApiService,
    protected db: AngularFirestore,
    private afStorage: AngularFireStorage
  ) {
    super(db, StudentService.collectionName);
  }

  async getAll(): Promise<Student[]> {
    return this._api.get('students').then(res => res.students);
  }
  
 
  // async getAll(): Promise<Student[]> {
  //   return this._api.get('students_relatorio_mindleader_individual_completo').then(res => res.students);
  // }
  async add(data: Student): Promise<string> {
    return this._api.post('students', data).then(res => res.student.id);
  }

  async update(id: string, data: Partial<Student>): Promise<void> {
    return this._api.put(`students/${id}`, data).then(_ => null);
  }

  uploadImage(id: string, file: Blob | File): Promise<string> {
    return new Promise(resolve => {
      const url = `${StudentService.collectionName}/${id}.png`;
      this.afStorage.ref(url).put(file).then(async (res) => {
        const imageUrl = await res.ref.getDownloadURL();
        await this.update(id, {image: imageUrl});
        resolve(imageUrl);
      });
    });
  }

  deleteImage(id: string): Promise<boolean> {
    return new Promise(resolve => {
      const url = `${StudentService.collectionName}/${id}.png`;
      this.afStorage.ref(url).delete().subscribe(async _ => {
        await this.update(id, {image: null});
        resolve(true);
      });
    });
  }
}
