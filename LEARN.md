# FileManager - LEARN

Short guide to run, debug and apply common UI fixes for this Angular FileManager project.

## Prerequisites
- Windows 10/11
- Node.js (16+ recommended)
- npm
- Angular CLI (optional, for `ng` commands)
- Python (3.x recommended)

## Setup & Run
1. Open PowerShell or Command Prompt in project root `FileManager`.
2. Set up backend:
   - Navigate to `Python/` folder: `cd Python`
   - Install dependencies: `pip install -r requirements.txt`
   - Run the backend: `python fileAPI.py`
3. Set up frontend:
   - Navigate back to root: `cd ..`
   - Install dependencies: `npm install`
   - Run dev server: `npx ng serve --open` or `npm start`

## Key files
- `src/styles.css` - global styles, fonts, CSS variables for themes
- `src/index.html` - root HTML
- `src/app/toolbar/toolbar.component.ts` - theme toggle and current path logic
- `src/app/toolbar/toolbar.component.css` - toolbar-specific styles
- `src/app/sidebar/sidebar.component.css` - sidebar hover and layout
- `src/app/file-list/file-list.component.css` - row spacing, list layout
- `angular.json` - build/dev configuration
- `Python/fileAPI.py` - backend API for file operations
- `Python/requirements.txt` - Python dependencies

## Architecture
The project consists of:
- **Frontend**: Angular application with Material Design components for UI.
- **Backend**: Python Flask API (assumed from fileAPI.py) handling file system operations.
- Communication between frontend and backend via HTTP requests.

## What more can be done (for learning)
- Add user authentication and authorization.
- Enhance search and filtering capabilities.
- Add support for multiple file types and previews.
- Add unit and integration tests for backend.

## Notes
- All file and path mentions above are enclosed in backticks, e.g. `src/styles.css`.
- Keep styles centralized in `src/styles.css` via CSS variables for consistency.
- Adjust the snippets to match project selectors (class names may differ).
