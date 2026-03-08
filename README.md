# MovieKu (Frontend)

MovieKu is a modern, responsive web application built to browse, manage, and discover movies. It provides a rich user experience with features ranging from a dynamic movie browsing interface to comprehensive user and admin dashboards.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 🌟 Key Features

### Public Features
- **Dynamic Home Page**: Auto-sliding hero section featuring the top popular movies with cross-fading backdrops.
- **Movie Catalog**: Browse, sort, and filter a vast collection of movies.
- **Movie Details**: View comprehensive information about a movie, including ratings, release dates, genres, and overviews.

### User Features
- **Authentication**: Secure email/password login and registration, plus Google OAuth integration.
- **Wishlist**: Save favorite movies to watch later.
- **My Movies**: Create, edit, and delete personal custom movie entries.

### Admin Features
- **Analytics Dashboard**: Visual data representation of metrics like movies per day, user signups, wishlist activities (Column Charts) and movie distribution by genre (Pie Chart). Includes date range filtering.
- **User Management**: Add new users/admins, edit details, and soft-delete/reactivate user accounts.
- **Movie Management**: Full CRUD operations for the platform's global movie database.
- **TMDB Synchronization**: Pull popular movie data from The Movie Database (TMDB) with options to sync full or partial data, limit page numbers, and gracefully stop ongoing syncs.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   git clone https://github.com/haiser1/fe_movie_ku.gi
   cd fe-movie-ku
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and configure the API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   *(Update the URL to match where your backend is running.)*

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
This command runs the TypeScript compiler and uses Vite to bundle the application into the `dist` folder.

To preview the production build locally:
```bash
npm run preview
```

## 🏗️ Project Structure

- `src/components/`: Reusable UI components (buttons, dialogs, forms, layout elements). Includes both custom components and `shadcn/ui` components.
- `src/pages/`: Page-level components corresponding to application routes (e.g., HomePage, AdminUsersPage, MoviesPage).
- `src/stores/`: Zustand state management stores (Auth, Movies, Admin, Wishlist, etc.).
- `src/lib/`: Utility functions, including the configured Axios API client.
- `src/types/`: TypeScript interface and type definitions.
- `src/App.tsx`: Main application routing and configuration.
