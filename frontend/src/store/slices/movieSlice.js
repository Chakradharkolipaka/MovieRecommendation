export const createMovieSlice = (set) => ({
  recommendations: [],
  movies: [],
  users: [],
  stats: null,
  setRecommendations: (recommendations) => set({ recommendations }),
  setMovies: (movies) => set({ movies }),
  setUsers: (users) => set({ users }),
  setStats: (stats) => set({ stats }),
});
