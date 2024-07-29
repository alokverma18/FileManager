import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import { FileManagerService } from '../services/file.service';
import { FileElement } from '../element';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  providers: [FileManagerService]
})
export class SidebarComponent implements OnInit {
  @Output() folderSelected = new EventEmitter<string>();
  folders: FileElement[] = [];
  currentPath: string = '';

  constructor(private fileManagerService: FileManagerService) {}

  ngOnInit() {
    this.fileManagerService.currentPath$.subscribe(path => {
      this.currentPath = path;
    });
    this.loadFolderContents(this.currentPath);
  }

  loadFolderContents(path: string) {
    this.fileManagerService.setPath(path);
    this.fileManagerService.getFolderContents(path).subscribe(
      data => {
        this.folders = data
      },
      error => console.error(error)
    );
  }

  
  navigateTo(item: FileElement) {
    if (item.type === 'folder') {
      this.currentPath += `/${item.name}`;
      this.loadFolderContents(item.path);
    } else {
      console.log('File clicked');
    }
  }
}
