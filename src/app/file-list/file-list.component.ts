import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FileManagerService } from '../services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {MatInputModule} from '@angular/material/input';
import { FileElement } from '../element';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatFormFieldModule, MatInputModule, CommonModule, HttpClientModule],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css',
})
export class FileListComponent implements OnInit {
  currentPath!: string;

  pathParts!: string[];

  items: FileElement[] = [];
  allItems: FileElement[] = [];

  constructor(private fileManagerService: FileManagerService) {}

  ngOnInit() {
    this.fileManagerService.currentPath$.subscribe(path => {
      console.log('List: Path observed:', path);
      if (this.currentPath !== path) {
        console.log('List: Updating currentPath and loading contents.');
        this.currentPath = path;
        this.loadFolderContents(path);
      }
    });
  }


  loadFolderContents(path: string) {
    this.fileManagerService.setPath(path);
    this.fileManagerService.getFolderContents(path).subscribe(
      data => {
        this.items = data,
        this.allItems = data
      },
      error => console.error(error)
    );
  }

  search(event: any) {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.items = this.allItems.filter((item: FileElement) => item.name.toLowerCase().startsWith(query));
    } else {
      this.items = this.allItems;  // Reset to the full list when search query is empty
    }
  }

  navigateTo(item: FileElement) {
    if (item.type === 'folder') {
      this.currentPath += `/${item.name}`;
      this.loadFolderContents(item.path);
    } else {
      this.downloadFile(item);
    }
    console.log(this.pathParts);
  }

  navigateToPath(index: number) {
    this.pathParts = this.currentPath.split('\\');
    this.loadFolderContents(this.pathParts.slice(0, index + 1).join('\\'));
  }

  downloadFile(item: FileElement) {
    const filePath = item.path;
    this.fileManagerService.downloadFile(filePath).subscribe(
      data => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error => console.error(error)
    );
  }
}
