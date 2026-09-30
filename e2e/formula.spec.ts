import { test, expect, type Page } from "@playwright/test";

async function openEditor(page: Page) {
  await page.goto("/overview");
  await page.getByRole("button", { name: "Tạo kịch bản", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Tên kịch bản *", exact: true })
    .fill("Theo dõi biến động tài sản");
  await page
    .getByRole("textbox", { name: "Mục đích của kịch bản *", exact: true })
    .fill(
      "Phát hiện thay đổi về tài sản và dư nợ để chủ động chăm sóc khách hàng.",
    );
  await page
    .getByRole("combobox", { name: "Tệp khách hàng áp dụng *", exact: true })
    .selectOption("all");
  await page
    .getByRole("combobox", { name: "Hành trình khách hàng *", exact: true })
    .selectOption("wealth");
  await page
    .getByRole("combobox", { name: "Danh mục kịch bản *", exact: true })
    .selectOption("GS");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Nâng cao", exact: true }).click();
}
async function add(page: Page, metric: string, value: string, op = "gte") {
  await page.getByRole("textbox", { name: "Tìm đại lượng" }).fill(metric);
  await page
    .getByRole("button", { name: `${metric} VND`, exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Toán tử so sánh" })
    .selectOption(op);
  await dialog
    .getByRole("spinbutton", { name: "Giá trị điều kiện", exact: true })
    .fill(value);
  await dialog
    .getByRole("button", { name: "Thêm vào công thức", exact: true })
    .click();
}

test("builds nested formula, edits compact rules, and round-trips through basic mode and reload", async ({
  page,
}) => {
  await openEditor(page);
  await add(page, "Tổng tài sản", "30000000");
  await page.getByRole("button", { name: "Chèn VÀ", exact: true }).click();
  await page.getByRole("button", { name: "Chèn dấu mở ngoặc" }).click();
  await add(page, "Dư nợ gốc", "100000000", "lt");
  await page.getByRole("button", { name: "Chèn HOẶC", exact: true }).click();
  await add(page, "Tiền mặt", "200000000");
  await expect(
    page.getByRole("button", { name: "Xem thử đối tượng", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Chèn dấu đóng ngoặc" }).click();
  await expect(
    page.getByRole("status", { name: "Trạng thái công thức" }),
  ).toContainText("Công thức hợp lệ");
  const prose = await page.locator(".formula-prose").innerText();
  expect(prose).toBe(
    "(Tổng tài sản ≥ 30.000.000 VÀ (Dư nợ gốc < 100.000.000 HOẶC Tiền mặt ≥ 200.000.000))",
  );
  await page
    .getByRole("button", { name: "Xem thử đối tượng", exact: true })
    .click();
  const counts = await page.locator(".preview-counts").innerText();
  await page.getByRole("button", { name: "Cơ bản", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Kết hợp nhóm cấp 2" }),
  ).toHaveValue("any");
  await page.getByRole("button", { name: "Nâng cao", exact: true }).click();
  await expect(page.locator(".formula-prose")).toHaveText(prose);
  await page
    .getByRole("button", { name: "Xem thử đối tượng", exact: true })
    .click();
  await expect(page.locator(".preview-counts")).toHaveText(counts, {
    useInnerText: true,
  });
  await page
    .getByRole("button", { name: /^Chỉnh điều kiện Tổng tài sản/ })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("spinbutton", { name: "Giá trị điều kiện", exact: true })
    .fill("60000000");
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(page.locator(".formula-prose")).toHaveText(prose);
  await page
    .getByRole("button", { name: /^Chỉnh điều kiện Tổng tài sản/ })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("spinbutton", { name: "Giá trị điều kiện", exact: true })
    .fill("60000000");
  await page
    .getByRole("button", { name: "Cập nhật điều kiện", exact: true })
    .click();
  await expect(page.locator(".formula-prose")).toContainText("60.000.000");
  await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Nâng cao", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".formula-prose")).toContainText("60.000.000");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page).toHaveURL(/\/trigger$/);
});

test("retains unfinished formulas and prevents stale previews and progression", async ({
  page,
}) => {
  await openEditor(page);
  await add(page, "Tiền mặt", "100000000");
  await page.getByRole("button", { name: "Chèn VÀ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cơ bản", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page).toHaveURL(/\/conditions$/);
  await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Xem thử đối tượng", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("status", { name: "Trạng thái công thức" }),
  ).toContainText("chưa hoàn chỉnh");
  await page
    .getByRole("button", { name: /^Khôi phục công thức hợp lệ/ })
    .click();
  await expect(
    page.getByRole("status", { name: "Trạng thái công thức" }),
  ).toContainText("Công thức hợp lệ");
  await expect(
    page.getByRole("button", { name: "Xem thử đối tượng", exact: true }),
  ).toBeEnabled();
});

test("configures percentage and absolute changes with preserved thresholds and periods", async ({
  page,
}) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Tiền mặt VND", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Loại điều kiện", exact: true })
    .selectOption("change");
  await dialog
    .getByRole("combobox", { name: "Chiều biến động" })
    .selectOption("decrease");
  await dialog.getByRole("spinbutton", { name: "Ngưỡng biến động" }).fill("15");
  await dialog
    .getByRole("combobox", { name: "Mốc so sánh" })
    .selectOption("7d");
  await expect(
    dialog.getByRole("spinbutton", { name: "Ngưỡng biến động" }),
  ).toHaveValue("15");
  await dialog.getByRole("button", { name: "Thêm vào công thức" }).click();
  await expect(page.locator(".formula-prose")).toContainText(
    "Tiền mặt giảm ≥ 15 % so với 7 ngày trước",
  );
  await page
    .getByRole("button", { name: "Xem thử đối tượng", exact: true })
    .click();
  await expect(page.locator(".preview-counts .match strong")).not.toHaveText(
    "0",
  );
  await expect(page.locator(".preview-counts .unknown strong")).not.toHaveText(
    "0",
  );
  await page.getByRole("button", { name: "Cơ bản", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Mốc so sánh" })).toHaveValue(
    "7d",
  );
  await page.getByRole("button", { name: "Nâng cao", exact: true }).click();
  await page.getByRole("button", { name: /^Chỉnh điều kiện Tiền mặt/ }).click();
  await dialog
    .getByRole("combobox", { name: "Cách đo biến động" })
    .selectOption("absolute");
  await dialog
    .getByRole("spinbutton", { name: "Ngưỡng biến động" })
    .fill("50000000");
  await dialog
    .getByRole("combobox", { name: "Mốc so sánh" })
    .selectOption("previous");
  await dialog.getByRole("button", { name: "Cập nhật điều kiện" }).click();
  await page.getByRole("button", { name: "Lưu nháp", exact: true }).click();
  await page.reload();
  await expect(page.locator(".formula-prose")).toContainText(
    "giảm ≥ 50.000.000 VND so với lần cập nhật trước",
  );
});

test("drags library metrics into insertion slots and reorders tokens", async ({
  page,
}) => {
  await openEditor(page);
  await page
    .getByRole("button", { name: "Tiền mặt VND", exact: true })
    .dragTo(
      page.getByRole("button", { name: "Chèn tại vị trí 1", exact: true }),
    );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Thêm vào công thức" })
    .click();
  await page.getByRole("button", { name: "Chèn HOẶC", exact: true }).click();
  await add(page, "Tổng tài sản", "30000000");
  await page
    .locator(".token-condition")
    .last()
    .dragTo(
      page.getByRole("button", { name: "Chèn tại vị trí 1", exact: true }),
    );
  await expect(page.locator(".token-condition").first()).toContainText(
    "Tổng tài sản",
  );
  await expect(
    page.getByRole("status", { name: "Trạng thái công thức" }),
  ).toContainText("chưa hoàn chỉnh");
  await page
    .locator(".token-or")
    .dragTo(
      page.getByRole("button", { name: "Chèn tại vị trí 2", exact: true }),
    );
  await expect(
    page.getByRole("status", { name: "Trạng thái công thức" }),
  ).toContainText("Công thức hợp lệ");
});
