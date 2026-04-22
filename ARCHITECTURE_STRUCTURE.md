# Clean Architecture Folder Structure

## Frontend (`frontend/`)

```text
frontend/
  public/
  src/
    assets/
    components/
      Header.jsx
      Layout.jsx
      ProtectedRoute.jsx
      Sidebar.jsx
    helpers/
    pages/
      Login.jsx
      Dashboard.jsx
      Ban.jsx
      NhanVien.jsx
    services/
      axiosClient.js
      authService.js
      banService.js
      nhanVienService.js
    stores/
      authStore.js
      store.js
    App.js
    index.js
```

## Backend (`backend/`)

```text
backend/
  src/
    app.js                     # express app + middleware + route binding
    server.js                  # app bootstrap
    config/
      constants.js
      database.js
    controllers/
      authController.js
      banController.js
      nhanVienController.js
    services/
      authService.js
      banService.js
      nhanVienService.js
    repositories/
      authRepository.js
      banRepository.js
      nhanVienRepository.js
    routes/
      authRoutes.js
      banRoutes.js
      nhanVienRoutes.js
  routes/                      # legacy compatibility routes
  db.js                        # legacy DB connection entry
  server.js                    # legacy server entry, now delegates to src/server.js
```

## Notes

- Current implementation keeps existing features and APIs unchanged.
- Legacy files are retained to avoid breaking existing code paths.
- This structure is ready for progressive migration to:
  - Frontend: React + TypeScript + Vite + Tailwind + Zustand + React Query
  - Backend: Node.js + Express + TypeScript + MySQL + session-based auth
