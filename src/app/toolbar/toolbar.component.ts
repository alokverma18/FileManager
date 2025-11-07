import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FileManagerService } from '../services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, MatButtonModule, HttpClientModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {

  constructor(
              private http: HttpClient,
              private fileManagerService: FileManagerService,
              private snackBar: MatSnackBar
            ) {}

  currentPath!: string;
  isDarkTheme: boolean = false;

  ngOnInit() {
    this.fileManagerService.currentPath$.subscribe(path => {
      if (this.currentPath !== path) {
        this.currentPath = path;
      }
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  file: File | null = null;

  goBack() {
    console.log("Hello : " + this.currentPath);
    const pathParts = this.currentPath.split('\\');
    console.log(pathParts);
    pathParts.pop();
    this.fileManagerService.setPath(pathParts.join('\\'));

  }

  createFolder() {
    const folder = prompt('Enter folder name');
    if (!folder) {
      return;
    }
    this.fileManagerService.createFolder(this.currentPath + "\\" + folder).subscribe(
      data => {
          this.snackBar.open('Folder created', 'Okay!', {
            verticalPosition: 'top',
            duration: 2000,
          });
        },
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

