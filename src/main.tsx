import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import {
  FluentProvider,
  webLightTheme,
  type Theme,
} from "@fluentui/react-components";
import { App } from "./App";
import { StoreProvider } from "./store";
import "./styles.css";
import "./workspace.css";
const theme: Theme = {
  ...webLightTheme,
  fontFamilyBase: '"Segoe UI", Arial, sans-serif',
  fontSizeBase100: "12px",
  lineHeightBase100: "18px",
  fontSizeBase200: "13px",
  lineHeightBase200: "20px",
  colorBrandBackground: "#0A2762",
  colorBrandBackgroundHover: "#123979",
  colorBrandBackgroundPressed: "#061d4e",
  colorBrandForeground1: "#0A2762",
  colorBrandForeground2: "#0A2762",
  colorBrandStroke1: "#0A2762",
  colorCompoundBrandBackground: "#0A2762",
  colorCompoundBrandBackgroundHover: "#123979",
  colorCompoundBrandStroke: "#0A2762",
  colorCompoundBrandForeground1: "#0A2762",
  colorNeutralBackground1: "#FFFFFF",
  borderRadiusMedium: "6px",
};
createRoot(document.getElementById("root")!).render(
  <FluentProvider theme={theme}>
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "*",
          errorElement: (
            <div className="empty">
              <h1>Không thể hiển thị màn hình</h1>
              <p>Bản lưu gần nhất vẫn được giữ trên trình duyệt.</p>
              <button onClick={() => window.location.reload()}>
                Tải lại ứng dụng
              </button>
              <a href="/overview">Về tổng quan</a>
            </div>
          ),
          element: (
            <StoreProvider>
              <App />
            </StoreProvider>
          ),
        },
      ])}
    />
  </FluentProvider>,
);
