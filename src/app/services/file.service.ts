import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private apiUrl = 'http://127.0.0.1:5000/';

  private currentPath = new BehaviorSubject<string>('');
  currentPath$ = this.currentPath.asObservable();

  setPath(path: string) {
    this.currentPath.next(path);
    console.log('Path set to: ' + path);
  }

  constructor(private http: HttpClient) { }

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
}