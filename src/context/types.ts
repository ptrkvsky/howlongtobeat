export type Mode = `LIGHT` | `DARK`;

export type DarkModeContextType = {
  mode: Mode;
  toggleMode: () => void;
};
