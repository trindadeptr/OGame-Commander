# OGame Commander Frontend

A modern Angular 20 frontend application for the OGame Commander automation system. This application provides a comprehensive web interface for managing OGame bots, tasks, users, and universes.

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (USER/ADMIN)
- Protected routes with guards
- Automatic token management

### 📋 Task Management
- **Task List**: Advanced filtering, pagination, and status tracking
- **Task Detail**: Comprehensive view with parameters, results, and error handling
- **Task Creation**: Form-based task creation with validation
- Support for task types: CHECK_ACTIVITY, SPY_PLAYER
- Real-time status updates

### 🤖 Bot Management
- **Bot Overview**: Grid view with status indicators
- **Real-time Status**: Active/Inactive bot monitoring
- **Statistics Dashboard**: Bot activity and universe distribution
- **Last Seen Tracking**: Time since last bot activity

### 👥 User Management (Admin Only)
- **User CRUD**: Create, update, and manage users
- **Role Management**: Toggle between USER and ADMIN roles
- **Status Control**: Enable/disable user accounts
- **Access Tracking**: Monitor user activity

### 🌌 Universe Management (Admin Only)
- **Universe Configuration**: Manage OGame universe settings
- **Discord Integration**: Webhook configuration for notifications
- **URL Management**: OGame universe URL tracking

## 🎨 Design & UX

### Modern UI Components
- **Tailwind CSS v4**: Latest utility-first CSS framework
- **Responsive Design**: Mobile-first approach with responsive grids
- **Status Badges**: Color-coded indicators for various states
- **Loading States**: Smooth loading spinners and indicators
- **Error Handling**: User-friendly error messages and validation

### Navigation
- **Responsive Navbar**: Collapsible mobile menu
- **Role-based Navigation**: Different menu items based on user role
- **Active Route Highlighting**: Visual indication of current page

## 🛠 Technical Stack

- **Framework**: Angular 20 with standalone components
- **Styling**: Tailwind CSS v4
- **Forms**: Reactive Forms with validation
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading
- **State Management**: Services with RxJS observables
- **Build System**: Angular CLI with esbuild

## 📦 Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- Backend API running on `http://localhost:8080`

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
# or
ng serve --proxy-config proxy.conf.json --open
```

The application will open automatically at `http://localhost:4200/`

### 3. Default Login Credentials
- **Username**: `admin`
- **Password**: `thisisjustanexamplepassword`

## 🔧 Configuration

### Proxy Configuration
The frontend is configured to proxy API requests to the backend:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false
  }
}
```

### Tailwind CSS v4 Setup
The project uses Tailwind CSS v4 with PostCSS configuration:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                 # Core services, guards, models
│   │   ├── guards/           # Authentication & authorization guards
│   │   ├── models/           # TypeScript interfaces & types
│   │   └── services/         # HTTP services for API communication
│   ├── features/             # Feature modules
│   │   ├── auth/             # Authentication (login)
│   │   ├── bots/             # Bot management
│   │   ├── tasks/            # Task management
│   │   ├── users/            # User management
│   │   └── universes/        # Universe management
│   ├── layout/               # Layout components
│   │   └── navbar/           # Navigation component
│   └── app.component.ts      # Root component
├── styles.css                # Global styles with Tailwind
└── index.html                # HTML entry point
```

## 🎯 Key Components

### Authentication
- **LoginComponent**: Secure login form with validation
- **AuthGuard**: Protects authenticated routes
- **AdminGuard**: Restricts admin-only features

### Task Management
- **TaskListComponent**: Filterable task overview with pagination
- **TaskDetailComponent**: Detailed task view with results
- **TaskCreateComponent**: Task creation form

### Bot Management
- **BotListComponent**: Bot overview with statistics

### User Management
- **UserListComponent**: Admin user management interface

## 🔌 API Integration

The frontend integrates with the backend API through:

- **AuthService**: Authentication and JWT token management
- **TaskService**: Task CRUD operations and filtering
- **BotService**: Bot monitoring and status retrieval
- **UserService**: User management (admin only)
- **UniverseService**: Universe configuration (admin only)

## 🚀 Building for Production

```bash
npm run build
```

Builds the app for production to the `dist/` directory with optimizations:
- Code splitting and lazy loading
- Minification and tree shaking
- Performance optimizations

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run e2e
```

## 🔍 Development

### Code Generation
```bash
# Generate new component
ng generate component feature/component-name

# Generate new service
ng generate service core/services/service-name

# Generate new guard
ng generate guard core/guards/guard-name
```

### Code Quality
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Strong typing throughout the application
- **Angular Best Practices**: Following Angular style guide

## 🌟 Features in Detail

### Responsive Design
- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interactions

### Real-time Updates
- Automatic data refreshing
- Loading states for better UX
- Error handling with retry mechanisms

### Security
- JWT token-based authentication
- Route protection with guards
- XSS protection with sanitization

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular CLI Reference](https://angular.dev/tools/cli)
