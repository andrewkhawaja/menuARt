# AR Food Menu Backend

This directory contains the Flask backend server for the AR Food Menu application, which provides API endpoints for menu management and file uploads.

## Features

- RESTful API for menu CRUD operations
- File upload support for images and 3D models (.glb/.gltf)
- Firebase integration for database and storage
- Real-time updates for menu changes

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Generate a service account key and save it as `serviceAccountKey.json` in this directory
   - Update the Firebase configuration in `app.py` with your project details

3. Run the server:
   ```
   python app.py
   ```

## API Endpoints

- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add a new menu item
- `PUT /api/menu/<item_id>` - Update a menu item
- `DELETE /api/menu/<item_id>` - Delete a menu item
- `POST /api/upload` - Upload a file (image or 3D model)

## Testing

Run the test script to verify API functionality:
```
python test_api.py
```
