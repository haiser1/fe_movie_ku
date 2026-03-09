// TypeScript interfaces derived from OpenAPI spec

export interface Genre {
    id: string;
    name: string;
}

export interface MovieImage {
    id: string;
    image_type: "poster" | "backdrop";
    image_url: string;
    width?: number | null;
    height?: number | null;
}

export interface MovieVideo {
    id: string;
    video_type: "trailer" | "teaser";
    site: "youtube" | "vimeo";
    video_key: string;
    official?: boolean;
}

export interface Movie {
    id: string;
    api_id: string | null;
    source: "tmdb" | "user" | "admin";
    title: string;
    overview: string | null;
    release_date: string | null;
    popularity: number | null;
    rating: number | null;
    is_featured: boolean;
    status: "active" | "archived";
    created_by: string | null;
    genres: Genre[];
    images: MovieImage[];
    videos: MovieVideo[];
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface MovieFilters {
    search?: string;
    genre_id?: string;
    source?: string;
    sort?: string;
    order?: "asc" | "desc";
    page?: number;
    per_page?: number;
}

// Auth
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    profile_picture: string | null;
    oauth_provider: string | null;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

// Wishlist
export interface Wishlist {
    id: string;
    movie_id: string;
    movie?: Movie;
    scheduled_watch_date: string | null;
    reminder_sent: boolean;
    created_at: string;
}

export interface WishlistCreateRequest {
    movie_id: string;
    scheduled_watch_date?: string;
}

export interface WishlistUpdateRequest {
    scheduled_watch_date?: string;
}

// User Movie Requests
export interface MovieCreateRequest {
    title: string;
    overview?: string;
    release_date?: string;
    genre_ids?: string[];
}

export interface MovieUpdateRequest {
    title?: string;
    overview?: string;
    release_date?: string;
    genre_ids?: string[];
}

// Custom Auth
export interface RegisterUserRequest {
    name: string;
    email: string;
    password?: string;
}

export interface LoginUserPasswordRequest {
    email: string;
    password?: string;
}

// Admin Dashboard
export interface DashboardAnalytics {
    summary: {
        total_movies: number;
        total_movies_all: number;
        total_users: number;
        total_users_all: number;
        total_wishlists: number;
        total_wishlists_all: number;
        average_rating: number;
        top_genre: string;
        latest_movie: {
            id: string;
            title: string;
            created_at: string;
        } | null;
    };
    column_charts: {
        movies_per_day: Array<{ date: string; count: number }>;
        users_per_day: Array<{ date: string; count: number }>;
        wishlists_per_day: Array<{ date: string; count: number }>;
        rating_distribution: Array<{ range: string; count: number }>;
    };
    pie_charts: {
        movies_by_genre: Array<{ label: string; value: number; percentage: number }>;
        movies_by_source: Array<{ label: string; value: number; percentage: number }>;
        movies_by_status: Array<{ label: string; value: number; percentage: number }>;
        sync_by_status: Array<{ label: string; value: number; percentage: number }>;
    };
    date_range: {
        start_date: string;
        end_date: string;
    };
}

// Admin User Management
export interface AdminUserResponse {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    profile_picture: string | null;
    oauth_provider: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AdminCreateUserRequest {
    name: string;
    email: string;
    role?: "user" | "admin";
    profile_picture?: string | null;
}

export interface AdminUpdateUserRequest {
    name?: string;
    role?: "user" | "admin";
    profile_picture?: string | null;
}

// Admin Movie Management
export interface AdminMovieCreateRequest {
    title: string;
    overview?: string;
    release_date?: string;
    popularity?: number;
    rating?: number;
    is_featured?: boolean;
    status?: "active" | "archived";
    genre_ids?: string[];
}

export interface AdminMovieUpdateRequest {
    title?: string;
    overview?: string;
    release_date?: string;
    popularity?: number;
    rating?: number;
    is_featured?: boolean;
    status?: "active" | "archived";
    genre_ids?: string[];
}

// Sync
export interface SyncLog {
    id: string;
    sync_type: "full" | "changes";
    last_sync_at: string;
    last_synced_endpoint?: string | null;
    last_synced_page?: number | null;
    total_inserted: number;
    total_updated: number;
    status: "success" | "failed" | "in_progress" | "stopped";
    error_message?: string | null;
    created_at: string;
}
