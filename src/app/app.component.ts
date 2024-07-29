import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { FileManagerService } from './services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FileManagerComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [FileManagerService]
})
export class AppComponent {
  constructor(private fileManagerService: FileManagerService, private http: HttpClient) {}
  title = 'FileManager';
}
