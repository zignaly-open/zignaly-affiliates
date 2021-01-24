import { withThemesProvider, DEFAULT_SETTINGS } from "themeprovider-storybook";
import { theme } from '../src/theme';
import RootProvider from "../src/RootProvider";

// Options:
const themes = [
  {
    name: 'Main Theme', // Required it's used for displaying the button label,
    ...theme
  }
];

export const decorators = [withThemesProvider(themes, DEFAULT_SETTINGS, RootProvider)];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}
