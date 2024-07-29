import { Component, EventEmitter, Input, Output } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FileManagerService } from '../services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, HttpClientModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {

  constructor(private http: HttpClient, private fileManagerService: FileManagerService) {}

  currentPath!: string;

  ngOnInit() {
    this.fileManagerService.currentPath$.subscribe(path => {
      if (this.currentPath !== path) {
        this.currentPath = path;
        console.log('ToolBar: Updating currentPath and loading contents.');
      }
    });
  }

  file: File | null = null;

  goBack() {
    console.log("Hello : " + this.currentPath);
    const pathParts = this.currentPath.split('\\');
    console.log(pathParts);
    pathParts.pop();
    this.fileManagerService.setPath(pathParts.join('/'));

  }
  
  createFolder() {
    const folder = prompt('Enter folder name');
    this.fileManagerService.createFolder(this.currentPath + folder).subscribe(
      data => this.refresh(),
      error => console.error
    );
  }

  uploadFile() {
    // Logic to upload a file
  }

  onFileSelected(event: any) {
    console.log('Clicked');
    if(event.target.files.length > 0) {
      this.file = event.target.files[0];
      console.log(this.file);
      if (this.file) {
        this.fileManagerService.uploadFile(this.file, this.currentPath).subscribe(
          data => 
            {
              this.refresh()
              console.log(data)
            },
          error => 
            {
              console.log(error);
              alert('Error uploading file');
            }
            
        );
      }
    }
  }



  refresh() {

  }
}
