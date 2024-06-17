import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

import { ComponentType } from '@angular/cdk/portal';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { NgxImageCompressService } from 'ngx-image-compress';

import { DeleteComponent } from 'src/app/shared/components/delete/delete.component';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private date: DatePipe,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private imageCompress: NgxImageCompressService
  ) { }

  message(
    text: string,
    color?: 'success' | 'warn',
    action?: string,
    duration?: number,
    horizontal?: 'start' | 'center' | 'end',
    vertical?: 'top' | 'bottom'
  ): void {
    this.snackBar.open(text, action || 'ok', {
      duration: duration || 4000,
      panelClass: color ? `mat-${color}` : null,
      horizontalPosition: horizontal || 'end',
      verticalPosition: vertical || 'top'
    });
  }

  loading(msg: string): MatDialogRef<LoadingComponent> {
    return this.dialog.open(LoadingComponent, {
      width: '30vw',
      data: {msg},
      disableClose: true
    });
  }

  form(component: ComponentType<unknown>, object: any, options: MatDialogConfig = null): Promise<any> {
    let maxWidth = '95vw';
    if (window.innerWidth > 960) maxWidth = '50vw';
    return new Promise(resolve => {
      const dialog = this.dialog.open(component, {
        maxWidth,
        ...options,
        data: object
      });
      dialog.afterClosed().subscribe(async (result: any) => {
        if (result) resolve(result);
      });
    });
  }

  detail(component: ComponentType<unknown>, object: any, options: MatDialogConfig = null): void {
    let maxWidth = '95vw';
    if (window.innerWidth > 960) maxWidth = '50vw';
    this.dialog.open(component, {
      maxWidth,
      data: object,
      minWidth: '30vw',
      ...options,
      panelClass: `dialog-view${options && options.panelClass ? ` ${options.panelClass}` : ''}`
    });
  }

  delete(action: 'enable' | 'disable' | 'delete'): Promise<any> {
    return new Promise(resolve => {
      const dialog = this.dialog.open(DeleteComponent, {
        maxWidth: '95vw',
        panelClass: 'dialog-delete',
        data: {action}
      });
      dialog.afterClosed().subscribe(async (remove: boolean) => {
        if (remove) resolve(remove);
      });
    });
  }

  formatDate(value: any, format: string): string {
    return this.date.transform(value, format);
  }

  uploadImage(file: File): Promise<{path: string; file: File}> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.addEventListener('load', async (event: any) => {
        const path = event.target.result as string;
        resolve({path, file});
      });
      reader.readAsDataURL(file);
    });
  }

  uploadCompress(base64: string): Promise<{base64: string, file: Blob}> {
    return new Promise(resolve => {
      const orientation = -1;
      this.imageCompress.compressFile(base64, orientation, 50, 50).then(result => {
        // CONVERT BASE64 TO FILE
        const byteString = window.atob(result.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) int8Array[i] = byteString.charCodeAt(i);
        const file = new Blob([int8Array], { type: 'image/png' });
        resolve({base64: result, file});
      });
    });
  }

  removeAccent(value: string) {
    const from = 'àáäaãâèéëêìíïîòóöoõôùúüûñç·/_,:;';
    const to   = 'aaaaaaeeeeiiiioooooouuuunc------';
    for (let i = 0; i < from.length; i++)
      value = value.toLowerCase().replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    return value;
  }

  downloadCSV(name: string, content: string) {
    const filename = `${name}.csv`;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
