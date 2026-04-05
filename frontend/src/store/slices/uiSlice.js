export const createUiSlice = (set) => ({
  popup: { type: null, data: null },
  loading: false,
  setLoading: (loading) => set({ loading }),
  showPopup: (type, data) => set({ popup: { type, data } }),
  closePopup: () => set({ popup: { type: null, data: null } }),
});
