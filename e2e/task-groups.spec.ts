import { test, expect } from "@playwright/test";

test("overdue dashboard groups open the corresponding task group and preserve filters", async ({
  page,
}) => {
  await page.goto("/overview");
  await expect(page.locator(".attention-group summary")).toHaveCount(3);
  await expect(page.locator(".attention-task-group")).toHaveCount(6);
  await page.getByRole("link", { name: /^Giám sát & kế hoạch \d+/ }).click();
  await expect(page).toHaveURL(/tasks\?status=overdue&category=GS/);
  const groups = page.getByRole("group", { name: "Nhóm công việc" });
  await expect(groups.getByRole("button")).toHaveCount(7);
  await expect(
    groups.getByRole("button", { name: /^Giám sát & kế hoạch/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("rowgroup", { name: "Giám sát & kế hoạch", exact: true }),
  ).toBeVisible();
  for (const id of await page
    .locator("tbody td:nth-child(2)")
    .allTextContents()) {
    expect(id).toMatch(/SMS-001[3-6]/);
  }
  await page.reload();
  await expect(
    groups.getByRole("button", { name: /^Giám sát & kế hoạch/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Hoàn tất\d+/ }).click();
  await expect(page).toHaveURL(/status=completed&category=GS/);
  await expect(page.locator("tbody td:last-child")).toHaveText(
    Array(await page.locator("tbody td:last-child").count()).fill("Hoàn tất"),
  );
  await page.goto("/tasks?status=completed&category=GS&scenario=SMS-0014");
  await groups.getByRole("button", { name: /^Tư vấn & giải pháp/ }).click();
  await expect(page).toHaveURL(
    /status=completed&category=TV&scenario=SMS-0014/,
  );
  await expect(
    page.getByRole("heading", { name: "Không có công việc phù hợp" }),
  ).toBeVisible();
  await expect(
    groups.getByRole("button", { name: /^Tư vấn & giải pháp/ }),
  ).toContainText("0");
});

test("grouped task list supports search and pagination without dropping groups", async ({
  page,
}) => {
  await page.goto("/tasks");
  const groups = page.getByRole("group", { name: "Nhóm công việc" });
  await expect(groups.getByRole("button")).toHaveCount(7);
  await expect(page.locator(".task-group-heading").first()).toBeVisible();
  const firstPage = await page
    .locator("tbody td:first-child small")
    .allTextContents();
  expect(firstPage).toHaveLength(20);
  await page.getByRole("button", { name: "Trang sau", exact: true }).click();
  const secondPage = await page
    .locator("tbody td:first-child small")
    .allTextContents();
  expect(secondPage.some((id) => firstPage.includes(id))).toBe(false);
  await page
    .getByRole("textbox", { name: "Tìm công việc", exact: true })
    .fill("không-có-công-việc-này");
  await expect(
    page.getByRole("heading", { name: "Không có công việc phù hợp" }),
  ).toBeVisible();
  await expect(groups.getByRole("button")).toHaveCount(7);
  await expect(
    page.getByText("0 công việc · Trang 1/1", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Tìm công việc", exact: true })
    .fill("");
  await expect(page.locator("tbody td:first-child small")).toHaveCount(20);
});
