import { Injectable } from '@angular/core';
import Docxtemplater from 'docxtemplater';
import * as PizZip from 'pizzip';

@Injectable({
  providedIn: 'root'
})
export class DocxTemplaterService {

  constructor(
  ){
  }

  generateDocxFromTemplate(template: ArrayBuffer, data: any): Blob {
    
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip);

    doc.setData(data);
    doc.render();

    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    return blob;
  }
}
