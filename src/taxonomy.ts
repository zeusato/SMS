import type { CatalogItem, Config, Customer } from "./domain";

export const journeys = [
  ["onboarding", "Onboarding"],
  ["cash_in", "Cash in"],
  ["trading", "Trading"],
  ["investing", "Investing"],
  ["wealth", "Wealth"],
] as const;
export const customerGroups = [
  {
    id: "careby",
    name: "Careby",
    description: "Có chuyên viên đồng hành và chăm sóc chủ động",
  },
  {
    id: "dyi",
    name: "DYI",
    description: "Chủ động nghiên cứu và tự quyết định giao dịch",
  },
  {
    id: "hybrid",
    name: "Hybrid",
    description: "Tự giao dịch, kết hợp tư vấn khi cần",
  },
  {
    id: "priority",
    name: "Priority",
    description: "Chăm sóc ưu tiên theo nhu cầu tài chính",
  },
  {
    id: "private_wealth",
    name: "Private Wealth",
    description: "Đồng hành theo kế hoạch tài sản tổng thể",
  },
];
export const customerGroupOptions: [string, string][] = [
  ["all", "Tất cả"],
  ...customerGroups.map((g) => [g.id, g.name] as [string, string]),
];
export const groupLabel = (id: string) =>
  customerGroupOptions.find((g) => g[0] === id)?.[1] || "Chưa chọn";
export const journeyLabel = (id: string) =>
  journeys.find((j) => j[0] === id)?.[1] || "Chưa chọn";
export const matchesCustomerGroup = (customer: Customer, group: string) =>
  group === "all" || customer.groupId === group;
export const appliesToGroup = (config: Config, group: string) =>
  group === "all" ||
  config.customerGroup === "all" ||
  config.customerGroup === group;
export const serviceGroups = [
  "Tư vấn đầu tư",
  "Danh mục mẫu",
  "Quản lý tài sản",
];
export const catalogAvailable = (item: CatalogItem, now: string) =>
  item.active &&
  (!item.end || Date.parse(item.end + "T23:59:59+07:00") >= Date.parse(now));
export function defaultServices(): CatalogItem[] {
  const groups = [
    [
      "Đầu tư cơ bản",
      "Đầu tư mạo hiểm",
      "Đầu tư giá trị",
      "Đầu tư tăng trưởng",
      "Đầu tư tạo thu nhập",
    ],
    [
      "Danh mục phòng thủ",
      "Danh mục cân bằng",
      "Danh mục tăng trưởng",
      "Danh mục theo chủ đề",
    ],
    [
      "Bảo toàn tài sản",
      "Quản lý tài sản cân bằng",
      "Tăng trưởng tài sản dài hạn",
    ],
  ];
  return groups.flatMap((names, group) =>
    names.map((name, i) => ({
      id: `S${group + 1}0${i + 1}`,
      name,
      group: serviceGroups[group],
      active: true,
      description: `Dịch vụ ${serviceGroups[group].toLowerCase()} · ${name}. Danh mục minh họa.`,
    })),
  );
}
