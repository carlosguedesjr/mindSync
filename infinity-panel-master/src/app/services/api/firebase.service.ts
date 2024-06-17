import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AddTreatLetters } from '../addTreatLetters.service';
import { SnackBarService } from '../barSnack.service';
import { Student } from 'src/app/models/student';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  student: Student;

  constructor(
    private addTreatLetter: AddTreatLetters,
    private snackBarServ: SnackBarService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ){    
  }

  getAllIdNameEmail() {
    return this.firestore.collection(
      'students',
      ref => ref.where('company', '!=', null))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            id: a.payload.doc.id,
            name: a.payload.doc.get('name'),
            email: a.payload.doc.get('email'),
            image: a.payload.doc.get('image'),
            company: a.payload.doc.get('company')
          }
          return { ...data };
        })))
  }

  // getAllStudents() {
  //   return this.firestore.collection(
  //     'students',
  //     ref => ref.where('company', '!=', null))
  //     .snapshotChanges()
  //     .pipe(
  //       map(actions => actions.map(a => {
  //         const dataAll = {
  //           id: a.payload.doc.id,
  //           name: a.payload.doc.get('name'),
  //           email: a.payload.doc.get('email'),
  //           company: a.payload.doc.get('company'),
  //           _area: a.payload.doc.get('areaId'),
  //           _post: a.payload.doc.get('postId'),
  //           _branch: a.payload.doc.get('branchId'),
  //           _company: a.payload.doc.get('companyId'),
  //           _department: a.payload.doc.get('departmentId'),
  //         }
  //         return { ...dataAll };
  //       })))
  // }

  getByNameStundet(nameStudent: string) {
    return this.firestore.collection(
      'students',
      ref => ref.where('name', '==', nameStudent))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            id: a.payload.doc.id,
            name: a.payload.doc.get('name'),
            email: a.payload.doc.get('email'),
            company: a.payload.doc.get('company')
          }
          return { ...data };
        })))
  }

  getbyIdStudent(idStudent: number) {
    return this.firestore.collection(
      'students',
      ref => ref.where('company', '!=', null))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            id: a.payload.doc.id,
            name: a.payload.doc.get('name'),
            email: a.payload.doc.get('email'),
            company: a.payload.doc.get('company')
          }
          return { ...data };
        })))
  }

  getByIdCompanyArea(areaId) {
    let item = this.firestore.collection(
      'company-areas',
      ref => ref.where('areaId', '==', areaId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            name: a.payload.doc.get('name'),
            departmentId: a.payload.doc.get('departmentId'),
          }
          return { ...data };
        })))

  }

  getByIdcompanyPosts(postId) {
    return this.firestore.collection(
      'company-posts',
      ref => ref.where('company-posts', '==', postId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            name: a.payload.doc.get('name'),
            level: a.payload.doc.get('level'),
            areaId: a.payload.doc.get('areaId')
          }
          return { ...data };
        })))
  }

  getByIdBranch(branchId) {
    return this.firestore.collection(
      'company-branches',
      ref => ref.where('company-branches', '==', branchId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            name: a.payload.doc.get('name'),
            companyId: a.payload.doc.get('companyId')
          }
          return { ...data };
        })))
  }

  getByIdCompany(branchId) {
    return this.firestore.collection(
      'company-branches',
      ref => ref.where('company-branches', '==', branchId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            name: a.payload.doc.get('name'),
            image: a.payload.doc.get('image')
          }
          return { ...data };
        })))
  }

  getByIdDepartament(branchId) {
    return this.firestore.collection(
      'company-departments',
      ref => ref.where('company-departments', '==', branchId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = {
            name: a.payload.doc.get('name'),
            image: a.payload.doc.get('image')
          }
          return { ...data };
        })))
  }

  saveDocxAndSendMail(name: string, email: string, attachments: any) {

    const lowerName = this.addTreatLetter.underscoreLetters(name);
    const storageRef = this.storage.ref(`mails/${lowerName}`+'.docx');
    const uploadTask = storageRef.put(attachments);

    uploadTask.snapshotChanges().subscribe(
      snapshot => {
        if (snapshot.state === 'success') {
          // Recuperar a URL de download
          storageRef.getDownloadURL()
          .pipe(take(1))
          .subscribe(downloadUrl => {
            // Usar a URL de download para enviar o e-mail ou realizar outras ações
            this.sendStudentMail(name, email, downloadUrl);
            console.log('Download URL:', downloadUrl);
          });
        }
      },
      error => {
        // Capturar o erro
        console.error('Erro de Upload:', error);
      }
    );
  }

  async sendStudentMail(name: string, email: string, linkToDownload: string) {    
    // Adicionar um novo documento para disparar o Email
    await this.firestore.collection('mail')
      .doc('studentMail')
      .set({
        to: email,  //  ['sys.everton@gmail.com'],
        message: {
          subject: 'Relatório Infinity',
          html: `<code>
          <p> Olá <b>${name || ''}</b>! </p>
          <br/>
          
          Estamos enviando o seu relatório para a apreciação.
          
          <p>Seu relatório está disponível para <a href="${linkToDownload}">download neste link</a>.</p>
          
          <br/>
          <p><img src="https://infinity-neurobusiness.web.app/assets/image/logo.png" alt="Logotipo da Infinity" width="120" height="80"><p/>
          <p><i>Admin Infinity<i/><p/>
          </code>
        `
        },
      }).then((res) => {
        console.log('Mail Status: ', res);
        this.snackBarServ.showSnackBar('Envio concluído!', 'Entendi');
      });
  }
  
}

// getAllIdNameEmail() {
//   return this.firestore.collection(
//     'students',
//     ref => ref.where('company', '!=', null)).snapshotChanges()
//     .pipe(
//       map(actions => actions.map(a => {
//         const data1 = {
//           id: a.payload.doc.id,
//           name: a.payload.doc.get('name'),
//           email: a.payload.doc.get('email'),
//           company: a.payload.doc.get('company')
//         }
//         return { ...data1 };
//       })))
// }

// getStudentComplet(idStudent: any, idCompany){
//   this.student.company._area = this.getByIdCompanyArea(idCompany);
//   this.student.company._post = this.getByIdCompanyArea(idCompany);
//   this.student.company._branch = this.getByIdCompanyArea(idStudent);
//   this.student.company._company = this.getByIdCompanyArea(idCompany);
//   this.student.company._department = this.getByIdCompanyArea(idStudent);
// }

// getByIdCompanyArea(idCompany): any{
//   return this.firestore.collection(
//     'company-areas',
//     ref => ref.where('student.company.areaId', '==', null)).snapshotChanges()
//     .pipe(
//       map(actions => actions.map(a => {
//         const data1 = {
//           id: a.payload.doc.id,
//           name: a.payload.doc.get('name'),
//           email: a.payload.doc.get('email'),
//           company: a.payload.doc.get('company')
//         }
//         return { ...data1 };
//       })))
// }



// async all(request: Request, response: Response) {
//   const students = await StudentRepository.getAll();

//   for (const student of students) {
//     if (student.company) {
//       if (student.company.areaId) student.company._area = await CompanyAreaRepository.getById(student.company.areaId);
//       if (student.company.postId) student.company._post = await CompanyPostRepository.getById(student.company.postId);
//       if (student.company.branchId) student.company._branch = await CompanyBranchRepository.getById(student.company.branchId);
//       if (student.company.companyId) student.company._company = await CompanyRepository.getById(student.company.companyId);
//       if (student.company.departmentId) student.company._department = await CompanyDepartmentRepository.getById(student.company.departmentId);
//     }
//   }

//   students.sort((a, b) => a.name.localeCompare(b.name));

//   return response.json({
//     success: true,
//     students
//   })
// }




//   etData(userId: string){
//     return this.fbs.collection(
//         this.trackerData,
//         ref=> ref.where('UserId','==',userId)
//     ).snapshotChanges().pipe(
//         map(action => {
//             const data = action.payload.data();
//             const id = action.payload.id;
//             return { id, ...data };
//         })
//     );
// }
