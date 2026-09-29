import { test, expect } from "@playwright/test";

test("creates a draft, evaluates real conditions and restores it after reload", async ({
  page,
}) => {
  await page.goto("/overview");
  await page.getByRole("button", { name: "Tạo kịch bản", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Tên kịch bản *", exact: true })
    .fill("Rà soát kế hoạch sử dụng tiền");
  await page
    .getByRole("textbox", { name: "Mục đích của kịch bản *", exact: true })
    .fill(
      "Chủ động trao đổi và ghi nhận kế hoạch sử dụng tài sản của khách hàng.",
    );
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page
    .getByRole("button", { name: "Dùng công thức trình diễn", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Xem thử đối tượng", exact: true })
    .click();
  await expect(page.getByText("33", { exact: true })).toBeVisible();
  await page
    .getByRole("spinbutton", { name: "Giá trị điều kiện", exact: true })
    .fill("500000000");
  await page
    .getByRole("button", { name: "Xem thử đối tượng", exact: true })
    .click();
  await expect(page.getByText("16", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Thiết lập kịch bản", exact: true }),
  ).toBeVisible();
});

test("viewer cannot create a scenario", async ({ page }) => {
  await page.goto("/overview");
  await page
    .getByRole("combobox", { name: "Vai trò trình diễn" })
    .selectOption("Viewer");
  await expect(
    page.getByRole("button", { name: "Tạo kịch bản", exact: true }),
  ).toHaveCount(0);
  await page.goto("/scenarios/new");
  await expect(
    page.getByRole("heading", { name: "Quản lý kịch bản" }),
  ).toBeVisible();
});

test("search state is retained in the URL and after reload", async ({
  page,
}) => {
  await page.goto("/scenarios");
  await page
    .getByRole("textbox", { name: "Tìm tên hoặc mã kịch bản", exact: true })
    .fill("SMS-0015");
  await expect(
    page.getByRole("row").filter({ hasText: "SMS-0015" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Tìm tên hoặc mã kịch bản",
      exact: true,
    }),
  ).toHaveValue("SMS-0015");
});
