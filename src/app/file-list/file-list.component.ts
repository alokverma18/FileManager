import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FileManagerService } from '../services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
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

  menuStyle: any = {};

  constructor(private fileManagerService: FileManagerService) { }

  ngOnInit() {
    this.closeMenu();
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

  selectedElement!: FileElement;

  RightClickElement(event: MouseEvent, item?: FileElement) {
    console.log(event)
    if (event.which === 3) {
      console.log('Right click detected');
      event.preventDefault();
      const menuWidth = 200; // Width of the context menu
      const screenWidth = window.innerWidth;
      let left = event.clientX;

      // Adjust position if the menu would go off-screen
      if (left + menuWidth > screenWidth) {
        left = screenWidth - menuWidth;
      }

      this.menuStyle = {
        display: 'block',
        top: `${event.clientY}px`,
        left: `${left}px`
      };

      if( item ){
        this.selectedElement = item;
        console.log(item);
      }
    }
  }

  // RightClickElement(event: MouseEvent, item?: FileElement): void {
  //   if (event.which === 3) {
  //     event.preventDefault();
  //     this.closeMenu();
  //     this.closePasteMenu();
  
  //     // Check if the right-click is on a file element
  //     console.log(event.target as HTMLElement);
  //     (event.target as HTMLElement).id = 'file-grid';
  //     if ((event.target as HTMLElement).closest('.file-grid')) {
  //       this.menuStyle = {
  //         display: 'block',
  //         left: `${event.clientX}px`,
  //         top: `${event.clientY}px`
  //       };
  //     } else {
  //       this.pasteMenuStyle = {
  //         display: 'block',
  //         left: `${event.clientX}px`,
  //         top: `${event.clientY}px`
  //       };
  //     }
  //   }
  // }

  closeMenu() {
    this.menuStyle = {
      display: 'none'
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.contextmenu')) {
      this.closeMenu();
    }
  }


  downloadItem() {
    this.downloadFile(this.selectedElement);
  }

  deleteItem() {
    this.fileManagerService.deleteFile(this.selectedElement.path).subscribe(
      data => {
        this.loadFolderContents(this.currentPath);
      },
      error => console.error(error)
    );
  }

  renameItem() {
    const newName = prompt('Enter new name');
    if (!newName) {
      return;
    }
    this.fileManagerService.renameFile(this.selectedElement.path, newName).subscribe(
      data => {
        this.loadFolderContents(this.currentPath);
      },
      error => console.error(error)
    );
  }

  viewItem() {
    this.navigateTo(this.selectedElement);
    this.closeMenu();
  }

  copyItem() {
    this.copiedFileElement = this.selectedElement;
    console.log('Copied item:', this.copiedFileElement);
    this.closeMenu();
  }

  pasteMenuStyle: any = {
    display: 'none'
  };

  copiedFileElement: any; // Assuming you have a way to store the copied file element

  onRightClick(event: MouseEvent): void {
    console.log(event)
    if (event.which === 3) {

      console.log('Right click detected');
      event.preventDefault();
      const menuWidth = 200; // Width of the context menu
      const screenWidth = window.innerWidth;
      let left = event.clientX;

      // Adjust position if the menu would go off-screen
      if (left + menuWidth > screenWidth) {
        left = screenWidth - menuWidth;
      }

      this.pasteMenuStyle = {
        display: 'block',
        top: `${event.clientY}px`,
        left: `${left}px`
      };
    }
  }

  closePasteMenu(): void {
    this.pasteMenuStyle = { 
      display: 'none' 
    };
  }

  pasteItem(): void {
    // Implement your paste logic here
    console.log('Pasting item:', this.copiedFileElement);
    this.fileManagerService.copyFile(this.copiedFileElement.path, this.currentPath).subscribe(
      data => {
        this.loadFolderContents(this.currentPath);
      },
      error => console.error
    );
    this.closePasteMenu();
  }

}
