import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { generateId } from '../core';

export interface DnlFireUploadTask extends AngularFireUploadTask {
  getDownloadURL(): Observable<string>;
  getFilePath(): string;
}

@Injectable({
  providedIn: 'root'
})
export class DnlFireUploader {
  constructor(private afStorage: AngularFireStorage) {}

  private static generateDir(): string {
    const now = new Date();
    return `temp/${now.getFullYear()}/${now.getMonth() + 1}`;
  }

  private static generateFileName(data: File | Blob | string): string {
    let name: string;
    let ext = '.';

    if (data instanceof File) {
      const splitName = data.name.split('.');
      name = DnlFireUploader.generateName(splitName[0]);
      ext += splitName[splitName.length - 1];

    } else if (data instanceof Blob) {
      name = DnlFireUploader.generateName(generateId(4));
      if (data.type === 'unknown') {
        ext = '';
      } else {
        ext += data.type.split('/')[1];
      }

    } else if (typeof data === 'string') {
      name = DnlFireUploader.generateName(generateId(4));
      ext = '';

    } else {
      throw new Error('data argument type is incorrect');
    }

    return `${name}${ext}`;
  }

  private static generateName(name: string): string {
    return `${Date.now().toString(16)}-${name}`;
  }

  upload(data: File | Blob | string, dir?: string, fileName?: string): DnlFireUploadTask {
    if (!data) {
      throw new Error('data argument is required');
    }

    if (!dir) {
      dir = DnlFireUploader.generateDir();
    }

    if (!fileName) {
      fileName = DnlFireUploader.generateFileName(data);
    }

    const filePath = `${dir}/${fileName}`;
    let task;

    if (typeof data === 'string') {
      const ref = this.afStorage.ref(filePath);
      task = ref.putString(data);

    } else {
      task = this.afStorage.upload(filePath, data, { contentType: data.type });
    }

    return {
      ...task,
      getDownloadURL: () => from(task).pipe(
        switchMap(() => this.afStorage.ref(filePath).getDownloadURL())
      ),
      getFilePath: () => filePath
    };
  }

  getDownloadUrl(filePath: string): Observable<string> {
    return this.afStorage.ref(filePath).getDownloadURL();
  }

}
