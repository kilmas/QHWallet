module.exports = {
  root: true,
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true
  },
  "extends": [
    "@react-native-community",
    "airbnb",
    "prettier",
    "prettier/react",
    "plugin:jest/recommended"
  ],
  "plugins": [
    "react",
    "jsx-a11y",
    "import",
    "prettier"
  ],
  "globals": {
    "__DEV__": true,
    "isNaN": true
  },
};
