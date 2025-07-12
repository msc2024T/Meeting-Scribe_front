import { store } from "../store";

// Function to get the current Redux store state
export const getStoreState = () => store.getState();

// Function to get auth token from Redux store
export const getAuthTokenFromStore = (): string | null => {
  const state = getStoreState();
  return state.auth.accessToken;
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const state = getStoreState();
  return state.auth.isAuthenticated;
};
