import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FileManagerService } from '../services/file.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { FileElement } from '../element';
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatFormFieldModule, MatInputModule,
    CommonModule, HttpClientModule,
    CdkMenuTrigger, CdkMenu, CdkMenuItem
  ],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css',
})
export class FileListComponent implements OnInit {

  currentPath!: string;
  pathParts!: string[];

  items: FileElement[] = [];
  allItems: FileElement[] = [];

  viewMode: 'grid' | 'list' = 'grid';

  menuStyle: any = {};

  selectedFileElement: FileElement | null = null;
  copiedFileElement: FileElement | null = null;
  cutFileElement: FileElement | null = null;

  constructor(
    private fileManagerService: FileManagerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.fileManagerService.currentPath$.subscribe(path => {
      this.currentPath = path;
      this.loadFolderContents(path);
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
    this.closeMenu();
  }

  search(event: any) {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.items = this.allItems.filter((item: FileElement) => item.name.toLowerCase().startsWith(query));
    } else {
      this.items = this.allItems;
    }
  }

  navigateTo(item: FileElement) {
    if (item.type === 'folder') {
      this.currentPath += `/${item.name}`;
      this.loadFolderContents(item.path);
    } else {
      this.selectedFileElement = item;
      this.downloadItem();
    }
  }

  navigateToPath(index: number) {
    this.pathParts = this.currentPath.split('\\');
    this.loadFolderContents(this.pathParts.slice(0, index + 1).join('\\'));
  }

  downloadItem() {
    let  item = this.selectedFileElement;
    if (item) {
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
          // this.snackBar.open('Item Downloaded', 'Okay!', {
          //   verticalPosition: 'top',
          //   duration: 2000,
          // });
        },
        error => {
          console.error(error);
          // this.snackBar.open('Error downloading item', 'Okay!', {
          //   verticalPosition: 'top',
          //   duration: 2000,
          // });
        }
      );
    }
  }

  RightClickElement(event: MouseEvent, item?: FileElement) {
    if (event.which === 3) {
      event.preventDefault();
      const menuWidth = 200; // Width of the context menu
      const menuHeight = 240; // Height of the context menu
      const screenWidth = window.innerWidth;
      let left = event.clientX - 10;
      let top = event.clientY - 10;

      // Adjust position if the menu would go off-screen
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 25;
      }
      if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 25;
      }

      this.menuStyle = {
        display: 'block',
        top: top + window.scrollY + 'px',
        left: left + window.scrollX + 'px'
      };

      if (item) {
        this.selectedFileElement = item;
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

  deleteItem() {
    if (!this.selectedFileElement) {
      return;
    }
    this.fileManagerService.deleteFile(this.selectedFileElement.path).subscribe(
      data => {
        this.loadFolderContents(this.currentPath);
        this.snackBar.open('Item Deleted', 'Okay!', {
          verticalPosition: 'top',
          duration: 2000,
        });
      },
      error => {
        console.error(error)
        this.snackBar.open('Error deleting item', 'Okay!', {
          verticalPosition: 'top',
          duration: 2000,
        });
      }
    );
  }

  renameItem() {
    const newName = prompt('Enter new name');
    if (!newName || !this.selectedFileElement) {
      return;
    }
    this.fileManagerService.renameFile(this.selectedFileElement.path, newName).subscribe(
      data => {
        this.loadFolderContents(this.currentPath);
        this.snackBar.open('Item Renamed', 'Okay!', {
          verticalPosition: 'top',
          duration: 2000,
        });
      },
      error => {
        console.error(error)
        this.snackBar.open('Error renaming item', 'Okay!', {
          verticalPosition: 'top',
          duration: 2000,
        });
      }
    );
  }

  viewItem() {
    if (!this.selectedFileElement) {
      return;
    }
    this.navigateTo(this.selectedFileElement);
    this.closeMenu();
  }

  copyItem() {
    this.copiedFileElement = this.selectedFileElement;
    console.log('Copied item:', this.copiedFileElement);
    this.cutFileElement = null;
    this.closeMenu();
    this.snackBar.open('Item Copied', 'Okay!', {
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  cutItem() {
    this.cutFileElement = this.selectedFileElement;
    console.log('Cut item:', this.cutFileElement);
    this.copiedFileElement = null;
    this.closeMenu();
    this.snackBar.open('Item Cut', 'Okay!', {
      verticalPosition: 'top',
      duration: 2000,
    });
  }


  // pasteMenuStyle: any = {
  //   display: 'none'
  // };


  // onRightClick(event: MouseEvent): void {
  //   console.log(event)
  //   if (event.which === 3) {

  //     console.log('Right click detected');
  //     event.preventDefault();
  //     const menuWidth = 200; // Width of the context menu
  //     const screenWidth = window.innerWidth;
  //     let left = event.clientX;

  //     // Adjust position if the menu would go off-screen
  //     if (left + menuWidth > screenWidth) {
  //       left = screenWidth - menuWidth;
  //     }

  //     this.pasteMenuStyle = {
  //       display: 'block',
  //       top: `${event.clientY}px`,
  //       left: `${left}px`
  //     };
  //   }
  // }

  // closePasteMenu(): void {
  //   this.pasteMenuStyle = {
  //     display: 'none'
  //   };
  // }

  pasteItem(): void {
    if (this.cutFileElement) {
      console.log('Moving item:', this.cutFileElement);
      this.fileManagerService.moveFile(this.cutFileElement.path, this.currentPath).subscribe(
        data => {
          this.loadFolderContents(this.currentPath);
          this.snackBar.open('Item Pasted', 'Okay!', {
            verticalPosition: 'top',
            duration: 2000,
          });
        },
        error => {
          console.error;
          this.snackBar.open('Error pasting item', 'Okay!', {
            verticalPosition: 'top',
            duration: 2000,
          });
        }
      );
    }
    else if (this.copiedFileElement) {
      console.log('Pasting item:', this.copiedFileElement);
      this.fileManagerService.copyFile(this.copiedFileElement.path, this.currentPath + '\\' + this.copiedFileElement.name).subscribe(
        data => {
          this.loadFolderContents(this.currentPath);
          this.snackBar.open('Item Pasted', 'Okay!', {
            verticalPosition: 'top',
            duration: 2000,
          });
        },
        error => {
          console.error;
          this.snackBar.open('Error pasting item', 'Okay!', {
            verticalPosition: 'top',
            duration: 2000,
          });
        }
      );
    }
    // this.closePasteMenu();
  }


  sortByName() {
    this.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  sortBySize() {
    this.items.sort((a, b) => a.size - b.size);
  }

  sortByDateCreated() {
    this.items.sort((a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime());
  }

  sortByDateModified() {
    this.items.sort((a, b) => new Date(a.date_modified).getTime() - new Date(b.date_modified).getTime());
  }


  changeViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
}
