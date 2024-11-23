import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private apiUrl = 'https://filemanager-rgy7.onrender.com';

  private currentPath = new BehaviorSubject<string>('');
  currentPath$ = this.currentPath.asObservable();

  constructor(private http: HttpClient) {}

  setPath(path: string) {
    if (this.currentPath.value !== path) {
      this.currentPath.next(path);
    }
    console.log('Path set to: ' + path);
  }

  getFolderContents(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`, { params: { path } });
  }

  createFolder(path: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-folder`, { path });
  }

  uploadFile(file: File, targetPath: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetPath', targetPath);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  downloadFile(path: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, { params: { path }, responseType: 'blob' });
  }

  copyFile(source: string, destination: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/copy`, { source, destination });
  }

  moveFile(source: string, destination: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/move`, { source, destination });
  }

  deleteFile(path: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { path });
  }

  renameFile(path: string, newName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rename`, { path, newName });
  }

}
