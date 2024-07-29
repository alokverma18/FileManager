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
})
export class SidebarComponent implements OnInit {
  folders: FileElement[] = [];
  currentPath!: string;
  isCollapsed: Boolean = false;

  constructor(private fileManagerService: FileManagerService) {}

  ngOnInit() {
    this.fileManagerService.currentPath$.subscribe(path => {
      console.log('Sidebar: Path observed:', path);
      if (this.currentPath !== path) {
        console.log('Sidebar: Updating currentPath and loading contents.');
        this.loadFolderContents(path);
      }
    });
  }

  loadFolderContents(path: string) {
    this.fileManagerService.getFolderContents(path).subscribe(
      data => {
        this.folders = data
      },
      error => console.error(error)
    );
    this.fileManagerService.setPath(path);
  }

  
  navigateTo(item: FileElement) {
    if (item.type === 'folder') {
      this.currentPath += `/${item.name}`;
      this.loadFolderContents(item.path);
    } else {
      console.log('File clicked');
    }
  }


  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
