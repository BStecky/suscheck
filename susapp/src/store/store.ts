import { create } from "zustand";

interface Token {
  id: string;
  tokenAddress: string;
  sus: boolean;
}

interface Store {
  tokens: Token[];
  searchResults: Token[];
  addTokens: (newTokens: Token[]) => void;
  setSearchResults: (results: Token[]) => void;
}

const useStore = create<Store>((set) => ({
  tokens: [],
  searchResults: [],
  addTokens: (newTokens) =>
    set((state) => ({ tokens: [...state.tokens, ...newTokens] })),
  setSearchResults: (results) => set({ searchResults: results }),
}));

export default useStore;
