# API Reference Documentation — RajSaurbh Tool Hub Pro 📡

All endpoints are served under the base prefix `/api`.

Standard Response Envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation description",
  "data": { ... }
}
```

Standard Error Envelope:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Detailed error message",
  "errors": []
}
```

---

## 1. System & Health

### `GET /api/health`
- **Access**: Public
- **Description**: Checks server status and MongoDB database connectivity.
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Server is running healthy",
  "database": "connected",
  "environment": "production",
  "timestamp": "2026-09-02T01:47:00.000Z"
}
```

---

## 2. Authentication & Profile (`/api/auth`)

### `POST /api/auth/register`
- **Access**: Public (Rate limited: 10 requests / 15 min)
- **Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "66d0c0000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `POST /api/auth/login`
- **Access**: Public (Rate limited: 10 requests / 15 min)
- **Body**:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "66d0c0000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `GET /api/auth/profile`
- **Access**: Private (`Authorization: Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "_id": "66d0c0000000000000000001",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "favoriteTools": ["passport-photo-studio"],
      "createdAt": "2026-09-01T12:00:00.000Z"
    }
  }
}
```

---

## 3. Tools Registry (`/api/tools`)

### `GET /api/tools`
- **Access**: Public
- **Query Params**:
  - `category` (optional, e.g. `photo`, `pdf`, `document`, `utility`)
  - `search` (optional keyword)
  - `featured` (optional `true`/`false`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "_id": "66d0...",
      "name": "Passport Photo Studio",
      "slug": "passport-photo-studio",
      "category": "photo",
      "description": "Multi-country passport & visa photo sheet generator",
      "icon": "Camera",
      "route": "/tools/passport-photo-studio",
      "isFeatured": true,
      "usageCount": 150
    }
  ]
}
```

### `GET /api/tools/:slug`
- **Access**: Public
- **Response `200 OK`**: Returns tool schema and details for the slug.

### `POST /api/tools`
- **Access**: Admin only (`Authorization: Bearer <token>` with `role: "admin"`)
- **Body**: Tool schema definitions.

### `PUT /api/tools/:id`
- **Access**: Admin only

### `DELETE /api/tools/:id`
- **Access**: Admin only

---

## 4. File Management (`/api/files`)

### `POST /api/files/upload`
- **Access**: Private (`Authorization: Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary file (JPEG, PNG, WEBP, PDF; max 10MB)
  - `toolName` (optional): Originating tool identifier
- **Response `201 Created`**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "_id": "66d0...",
      "filename": "passport-photo-sheet.pdf",
      "originalName": "image.jpg",
      "mimeType": "application/pdf",
      "size": 154200,
      "url": "https://res.cloudinary.com/... or /uploads/...",
      "toolName": "Passport Photo Studio",
      "createdAt": "2026-09-02T01:00:00.000Z"
    }
  }
}
```

### `GET /api/files`
- **Access**: Private
- **Query Params**: `search`, `mimeType`, `page`, `limit`
- **Response `200 OK`**: Paginated file listings for current user.

### `GET /api/files/:id`
- **Access**: Private
- **Response `200 OK`**: Single file metadata.

### `DELETE /api/files/:id`
- **Access**: Private
- **Response `200 OK`**: Deletes record and purges stored asset from Cloudinary / disk.

---

## 5. Processing History (`/api/history`)

### `GET /api/history`
- **Access**: Private
- **Query Params**: `search`, `toolSlug`, `status`, `page`, `limit`
- **Response `200 OK`**: List of activity history logs.

### `POST /api/history`
- **Access**: Private
- **Body**:
```json
{
  "toolName": "Image to PDF Converter",
  "toolSlug": "image-to-pdf",
  "action": "Converted 5 images into single PDF document",
  "status": "success",
  "metadata": {
    "pageCount": 5,
    "outputSize": "2.4 MB"
  }
}
```

### `DELETE /api/history`
- **Access**: Private
- **Description**: Clears all activity history for the authenticated user.

---

## 6. User Favorites (`/api/users`)

### `GET /api/users/favorites`
- **Access**: Private
- **Response `200 OK`**: Returns array of favorited tool objects.

### `POST /api/users/favorites/:toolId`
- **Access**: Private
- **Description**: Adds specified tool ID to user favorites.

### `DELETE /api/users/favorites/:toolId`
- **Access**: Private
- **Description**: Removes tool from favorites.

---

## 7. Notifications (`/api/notifications`)

### `GET /api/notifications`
- **Access**: Private
- **Response `200 OK`**: List of user notifications with unread counter.

### `PATCH /api/notifications/read-all`
- **Access**: Private
- **Description**: Marks all notifications as read.

### `PATCH /api/notifications/:id/read`
- **Access**: Private
- **Description**: Marks a specific notification as read.

### `DELETE /api/notifications/:id`
- **Access**: Private
- **Description**: Deletes a specific notification.

---

## 8. Admin Control Panel (`/api/admin`)

*All routes require `Authorization: Bearer <token>` with `role: "admin"`.*

### `GET /api/admin/stats`
- **Description**: System overview (total users, total files, total storage consumed, tool usage breakdown, recent activity).

### `GET /api/admin/users`
- **Query Params**: `search`, `role`, `status`, `page`, `limit`
- **Description**: User directory with ban/unban status and account metrics.

### `PATCH /api/admin/users/:id/role`
- **Access**: Private (Requires Admin)
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Promotes a user to `admin` or demotes an administrator to `user`. Protected against self-demotion and removal of the final administrator.
- **Request Body**:
```json
{
  "role": "admin"
}
```
*or*
```json
{
  "role": "user"
}
```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "User \"Rahul Sharma\" role successfully updated to \"admin\"",
      "data": {
        "user": {
          "_id": "66d66e850b1f3c3a44d82b01",
          "name": "Rahul Sharma",
          "email": "rahul@example.com",
          "role": "admin",
          "isBlocked": false,
          "isEmailVerified": true,
          "createdAt": "2026-09-01T10:00:00.000Z",
          "updatedAt": "2026-09-03T02:40:00.000Z"
        }
      }
    }
    ```
  - `400 Bad Request`:
    - Invalid role: `{"success": false, "message": "Invalid role. Valid roles are strictly \"user\" or \"admin\""}`
    - Invalid ObjectId: `{"success": false, "message": "Invalid user ID"}`
    - Self-demotion: `{"success": false, "message": "You cannot modify your own administrative role"}`
    - Last administrator demotion: `{"success": false, "message": "Cannot remove the last administrator."}`
    - Already assigned role: `{"success": false, "message": "User is already assigned the \"admin\" role"}`
  - `401 Unauthorized`: Missing, invalid, or expired JWT token.
  - `403 Forbidden`: Authenticated user does not have `admin` privileges.
  - `404 Not Found`: Target user ID does not exist in database.

### `PATCH /api/admin/users/:id/block`
- **Description**: Suspends a user account.

### `PATCH /api/admin/users/:id/unblock`
- **Description**: Restores access to a suspended account.

### `DELETE /api/admin/users/:id`
- **Description**: Cascading deletion of user account, associated files, and history. Protected against deletion of the last administrator.

### `GET /api/admin/files`
- **Description**: System-wide file audit with uploader identity and file storage sizes.

