import { Component } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { FileListComponent } from '../file-list/file-list.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FileManagerService } from '../services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [ToolbarComponent, FileListComponent, SidebarComponent, HttpClientModule],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.css',
  providers: [FileManagerService]
})
export class FileManagerComponent {
  constructor(private http: HttpClient, private fileManagerService: FileManagerService) {}
}
