import { create } from "zustand";

export interface Token {
  id: string;
  tokenAddress: string;
  sus: boolean;
  tokenName: string;
  tokenSymbol: string;
  tokenImage: string;
  tokenSupply: number;
  freezeAuthorityAddress: string;
  mintAuthorityAddress: string;
  decimals: number;
  description: string;
}

interface Store {
  tokens: Token[];
  searchResults: Token[];
  isLoading: boolean;
  isSearching: boolean;
  addTokens: (newTokens: Token[]) => void;
  setSearchResults: (results: Token[]) => void;
  setLoading: (loading: boolean) => void;
  setIsSearching: (searching: boolean) => void;
}

const useStore = create<Store>((set) => ({
  tokens: [],
  searchResults: [],
  isLoading: false,
  isSearching: false, // Initialize as false
  addTokens: (newTokens) =>
    set((state) => ({ tokens: [...state.tokens, ...newTokens] })),
  setSearchResults: (results) => set({ searchResults: results }),
  setLoading: (loading) => set({ isLoading: loading }),
  setIsSearching: (searching) => set({ isSearching: searching }),
}));

export default useStore;
