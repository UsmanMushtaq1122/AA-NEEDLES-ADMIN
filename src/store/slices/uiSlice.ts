import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarCollapsed: boolean;
  globalSearchOpen: boolean;
  notificationsOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  globalSearchOpen: false,
  notificationsOpen: false,
  activeModal: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleGlobalSearch: (state) => {
      state.globalSearchOpen = !state.globalSearchOpen;
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, toggleGlobalSearch, toggleNotifications, setActiveModal } = uiSlice.actions;
export default uiSlice.reducer;
