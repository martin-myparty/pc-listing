import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FavoriteComponent = {
  id: string;
  name: string;
  price: number;
  company: string;
  image: string;
  category: string;
  type: 'gpu' | 'cpu' | 'motherboard' | 'ram';
};

interface FavoritesStore {
  favorites: FavoriteComponent[];
  addFavorite: (component: FavoriteComponent) => void;
  removeFavorite: (componentId: string) => void;
  isFavorite: (componentId: string) => boolean;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (component) => 
        set((state) => ({
          favorites: [...state.favorites, component]
        })),
      removeFavorite: (componentId) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== componentId)
        })),
      isFavorite: (componentId) =>
        get().favorites.some((item) => item.id === componentId),
    }),
    {
      name: 'favorites-storage',
    }
  )
); 