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
  providers: [FileManagerService]
})
export class ToolbarComponent {

  constructor(private http: HttpClient, private fileManagerService: FileManagerService) {}

  @Input() currentPath: string = '';
  @Output() pathChanged = new EventEmitter<string>();

  file: File | null = null;

  goBack() {
    console.log("Hello" + this.currentPath);
    if (this.currentPath) {
      console.log(this.currentPath);
      const pathParts = this.currentPath.split('/');
      pathParts.pop(); // Remove the last part of the path
      const newPath = pathParts.join('/');
      this.pathChanged.emit(newPath);
    }
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
    this.fileManagerService.getFolderContents(this.currentPath).subscribe(
      data => this.pathChanged.emit(this.currentPath),
      error => console.error
    );
  }
}
