import { test, expect } from "@playwright/test";

test("dashboard counts and drilldowns follow customer file and journey", async ({
  page,
}) => {
  await page.goto("/overview");
  await expect(
    page.getByRole("combobox", { name: "Tệp khách hàng", exact: true }),
  ).toHaveValue("all");
  await expect(
    page
      .getByRole("tablist", { name: "Hành trình khách hàng" })
      .getByRole("tab"),
  ).toHaveText([
    "1Onboarding5",
    "2Cash in3",
    "3Trading4",
    "4Investing6",
    "5Wealth6",
  ]);
  await page
    .getByRole("combobox", { name: "Tệp khách hàng", exact: true })
    .selectOption("careby");
  await page.getByRole("tab", { name: "5 Wealth 4", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Giám sát & kế hoạch");
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "5 Wealth 4", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("combobox", { name: "Tệp khách hàng", exact: true }),
  ).toHaveValue("careby");
  await page
    .getByRole("link", { name: "Xem danh mục Giám sát & kế hoạch" })
    .click();
  await expect(page).toHaveURL(
    /journey=wealth&customerGroup=careby&category=GS/,
  );
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("SMS-0014");
});

test("requires journey and file, clears incompatible categories and persists service offers", async ({
  page,
}) => {
  await page.goto("/scenarios/new");
  await page
    .getByRole("textbox", { name: "Tên kịch bản *", exact: true })
    .fill("Dịch vụ cho khách hàng Careby");
  await page
    .getByRole("textbox", { name: "Mục đích của kịch bản *", exact: true })
    .fill("Giới thiệu dịch vụ phù hợp với kế hoạch đầu tư của khách hàng.");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(
    page.getByText("Chọn tệp khách hàng áp dụng", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Tệp khách hàng áp dụng *", exact: true })
    .selectOption("careby");
  await page
    .getByRole("combobox", { name: "Hành trình khách hàng *", exact: true })
    .selectOption("onboarding");
  await page
    .getByRole("combobox", { name: "Danh mục kịch bản *", exact: true })
    .selectOption("DV");
  await page
    .getByRole("combobox", { name: "Hành trình khách hàng *", exact: true })
    .selectOption("wealth");
  await expect(
    page.getByRole("combobox", { name: "Danh mục kịch bản *", exact: true }),
  ).toHaveValue("");
  await page
    .getByRole("combobox", { name: "Danh mục kịch bản *", exact: true })
    .selectOption("TV");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page
    .getByRole("button", { name: "Dùng công thức trình diễn", exact: true })
    .click();
  await expect(page.getByText(/24 khách hàng · Careby/)).toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: /^Offer dịch vụ/ }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(
    page.getByText("Chọn dịch vụ cho offer", { exact: true }),
  ).toBeVisible();
  for (const [name, count] of [
    ["Tư vấn đầu tư", 5],
    ["Danh mục mẫu", 4],
    ["Quản lý tài sản", 3],
  ] as const) {
    await expect(
      page.getByRole("group", { name, exact: true }).getByRole("checkbox"),
    ).toHaveCount(count);
  }
  await page
    .getByRole("checkbox", { name: "Đầu tư cơ bản", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Danh mục cân bằng", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Bảo toàn tài sản", exact: true })
    .check();
  await page
    .getByRole("button", {
      name: "Xem offer dịch vụ trên ứng dụng",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("DỊCH VỤ DÀNH CHO BẠN");
  await expect(page.getByRole("dialog")).toContainText("Bảo toàn tài sản");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Đóng", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Xem lại và công bố", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Careby");
  await expect(page.getByRole("dialog")).toContainText("Wealth");
  await expect(page.getByRole("dialog")).toContainText("Bảo toàn tài sản");
  await page
    .getByRole("button", { name: "Công bố & tạo tiến trình", exact: true })
    .click();
  await expect(page).toHaveURL(/\/scenarios\/SMS-0025\?tab=process&created=1/);
  await expect(
    page.getByText("Giới thiệu dịch vụ phù hợp", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Chạy mô phỏng", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Tệp áp dụng: Careby · 24 khách hàng mẫu",
  );
  await expect(
    page
      .getByRole("combobox", { name: "Khách hàng liên quan", exact: true })
      .getByRole("option"),
  ).toHaveCount(24);
});

test("service catalog separates three service groups from transaction policies", async ({
  page,
}) => {
  await page.goto("/catalogs/services");
  await expect(page.locator("tbody tr")).toHaveCount(12);
  for (const [name, count] of [
    ["Tư vấn đầu tư", 5],
    ["Danh mục mẫu", 4],
    ["Quản lý tài sản", 3],
  ] as const) {
    await page
      .getByRole("button", { name: `${name} · ${count}`, exact: true })
      .click();
    await expect(page.locator("tbody tr")).toHaveCount(count);
  }
  await page
    .getByRole("tab", { name: "Sản phẩm chính sách", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(11);
  await expect(page.locator("tbody")).not.toContainText("Dịch vụ tư vấn");
  await page.getByRole("tab", { name: "Tệp khách hàng", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
});
