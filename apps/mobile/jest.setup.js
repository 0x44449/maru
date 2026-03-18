// react-native-safe-area-context mock
jest.mock("react-native-safe-area-context", () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => insets,
  };
});

// expo-image mock
jest.mock("expo-image", () => {
  const mockReact = require("react");
  const { View } = require("react-native");
  return {
    Image: (props) => mockReact.createElement(View, props),
  };
});
