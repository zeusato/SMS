import { describe, expect, it } from "vitest";
import {
  compile,
  conflicts,
  copy,
  getConfig,
  newAction,
  newConfig,
  rule,
  scheduleRuns,
  simulate,
  subjects,
  validate,
  type Config,
  type State,
} from "./domain";
import { seed } from "./seed";
import { migrateState } from "./migration";
import {
  appliesToGroup,
  catalogAvailable,
  customerGroups,
  journeys,
  serviceGroups,
} from "./taxonomy";

function config(state: State, group = "careby"): Config {
  return {
    ...newConfig(state.now),
    name: "Kiểm tra dịch vụ",
    purpose: "Kiểm tra hành trình và đúng tệp khách hàng áp dụng.",
    customerGroup: group,
    journey: "wealth",
    category: "TV",
    condition: rule("equity.availableCash", 0),
    actions: [
      { ...newAction("service_offer"), services: ["S101", "S203", "S302"] },
    ],
  };
}
function publish(state: State, c: Config, id = "TEST") {
  const plan = compile(c, `${id}-v1`, state.now);
  state.scenarios.push({
    id,
    code: id,
    control: "enabled",
    updated: state.now,
    versions: [
      {
        id: plan.versionId,
        no: 1,
        at: state.now,
        by: "Admin",
        reason: "Test",
        config: copy(plan.config),
        plan,
      },
    ],
  });
  return state.scenarios.at(-1)!;
}

describe("journeys, customer groups and service offers", () => {
  it("requires an explicit customer group and journey on the first screen", () => {
    const c = config(seed());
    c.customerGroup = "";
    c.journey = "";
    expect(validate(c, 0)).toEqual([
      "Chọn bước hành trình khách hàng",
      "Chọn tệp khách hàng áp dụng",
    ]);
    c.customerGroup = "all";
    c.journey = "wealth";
    expect(validate(c, 0)).toEqual([]);
  });
  it("places all 24 seed scenarios in a valid journey and separates 5/4/3 services", () => {
    const s = seed();
    expect(
      journeys.map(
        ([id]) => s.scenarios.filter((x) => getConfig(x).journey === id).length,
      ),
    ).toEqual([5, 3, 4, 6, 6]);
    for (const scenario of s.scenarios) {
      const c = getConfig(scenario);
      expect(s.categories.some((x) => x.id === c.category)).toBe(true);
      expect(journeys.some(([id]) => id === c.journey)).toBe(true);
    }
    expect(
      serviceGroups.map(
        (group) => s.services.filter((x) => x.group === group).length,
      ),
    ).toEqual([5, 4, 3]);
    expect(
      s.products.some(
        (p) => serviceGroups.includes(p.group || "") || p.group === "Tư vấn",
      ),
    ).toBe(false);
  });
  it("includes global scenarios in a specific group without including other groups", () => {
    const s = seed();
    expect(appliesToGroup(config(s, "all"), "careby")).toBe(true);
    expect(appliesToGroup(config(s, "dyi"), "careby")).toBe(false);
    expect(appliesToGroup(config(s, "dyi"), "all")).toBe(true);
  });
  it("keeps account identities stable when narrowing the customer file", () => {
    const s = seed();
    for (const group of customerGroups) {
      expect(subjects(s, "customer", group.id)).toHaveLength(24);
      expect(subjects(s, "account", group.id).map((c) => c.id)).toEqual(
        subjects(s, "account")
          .filter((c) => c.groupId === group.id)
          .map((c) => c.id),
      );
    }
    expect(subjects(s, "account")).toHaveLength(132);
  });
  it("does not activate an event for a customer outside its file", () => {
    const s = seed();
    publish(s, config(s));
    const outside = s.customers.find((c) => c.groupId === "dyi")!;
    simulate(s, "TEST", "outside", "cash.deposited", outside.id);
    expect(s.evaluations.at(-1)?.outcomes).toEqual([]);
    const inside = s.customers.find(
      (c) =>
        c.groupId === "careby" && Number(c.values["equity.availableCash"]) > 0,
    )!;
    simulate(s, "TEST", "inside", "cash.deposited", inside.id);
    expect(s.evaluations.at(-1)?.outcomes[0].customerId).toBe(inside.id);
    expect(s.activations.at(-1)?.runs[0]).toMatchObject({
      type: "service_offer",
      body: "Đầu tư cơ bản, Danh mục tăng trưởng, Quản lý tài sản cân bằng",
    });
  });
  it("limits scheduled account evaluations to the selected file", () => {
    const s = seed(),
      c = config(s, "private_wealth");
    c.scope = "account";
    c.mode = "schedule";
    publish(s, c);
    const at = scheduleRuns(c, s.now, 1).runs[0];
    simulate(s, "TEST", "schedule", "", "", at);
    expect(s.evaluations.at(-1)?.outcomes.map((o) => o.subjectId)).toEqual(
      subjects(s, "account", "private_wealth").map((c) => c.id),
    );
  });
  it("checks selected services and expiration boundaries", () => {
    const s = seed(),
      c = config(s);
    c.actions[0].services = [];
    expect(validate(c, 3)).toContain("Chọn dịch vụ cho offer");
    const service = { ...s.services[0], end: "2026-09-29" };
    expect(catalogAvailable(service, "2026-09-29T23:59:59+07:00")).toBe(true);
    expect(catalogAvailable(service, "2026-09-30T00:00:00+07:00")).toBe(false);
    expect(catalogAvailable({ ...service, active: false }, s.now)).toBe(false);
  });
  it("checks service/product placement conflicts only where customer files overlap", () => {
    const s = seed();
    s.scenarios = [];
    publish(s, config(s), "A");
    const b = config(s, "dyi");
    b.actions = [{ ...newAction("offer"), products: ["P01"] }];
    publish(s, b, "B");
    expect(conflicts(s)).toEqual([]);
    s.scenarios = s.scenarios.slice(0, 1);
    b.customerGroup = "all";
    publish(s, b, "B");
    expect(conflicts(s)[0].ruleId).toBe("CF03");
    expect(
      conflicts(s)[0].sample.every(
        (id) => s.customers.find((c) => c.id === id)?.groupId === "careby",
      ),
    ).toBe(true);
  });
});

describe("saved data migration", () => {
  it("preserves draft formulas and history, splits legacy offers, and is idempotent", () => {
    const s = seed();
    s.products.push({
      id: "P12",
      name: "Demo Dịch vụ tư vấn",
      group: "Tư vấn",
      active: false,
      description: "Cũ",
      end: "2026-09-01",
    });
    const c = config(s, "all");
    c.actions = [
      { ...newAction("offer"), id: "old-offer", products: ["P01", "P12"] },
    ];
    const scenario = publish(s, c, "LEGACY");
    scenario.draft = copy(c);
    scenario.draft.conditionMode = "advanced";
    scenario.draft.conditionFormula = [{ id: "incomplete", kind: "open" }];
    const history = JSON.stringify({
      evaluations: s.evaluations,
      activations: s.activations,
      tasks: s.tasks,
    });
    Reflect.deleteProperty(s, "services");
    s.categories.forEach((cat) => Reflect.deleteProperty(cat, "journeys"));
    s.customers.forEach((customer) =>
      Reflect.deleteProperty(customer, "groupId"),
    );
    for (const old of [
      scenario.draft,
      scenario.versions[0].config,
      scenario.versions[0].plan.config,
    ]) {
      Reflect.deleteProperty(old, "customerGroup");
      Reflect.deleteProperty(old, "journey");
    }
    migrateState(s);
    expect(scenario.draft).toMatchObject({
      customerGroup: "all",
      journey: "investing",
      conditionFormula: [{ kind: "open" }],
    });
    expect(scenario.draft.actions.map((a) => [a.id, a.type])).toEqual([
      ["old-offer", "offer"],
      ["old-offer-service", "service_offer"],
    ]);
    expect(s.services.find((x) => x.id === "P12")).toMatchObject({
      active: false,
      group: "Tư vấn đầu tư",
    });
    expect(s.products.some((x) => x.id === "P12")).toBe(false);
    expect(
      scenario.versions[0].plan.nodes
        .filter((n) => n.type === "action")
        .map((n) => n.id),
    ).toEqual(["old-offer", "old-offer-service"]);
    expect(
      scenario.versions[0].plan.nodes.findIndex(
        (n) => n.id === "old-offer-service",
      ),
    ).toBeLessThan(
      scenario.versions[0].plan.nodes.findIndex((n) => n.id === "audit"),
    );
    expect(scenario.versions[0].plan.edges).toContainEqual({
      from: "old-offer",
      to: "old-offer-service",
    });
    expect(scenario.versions[0].plan.edges).toContainEqual({
      from: "old-offer-service",
      to: "audit",
    });
    expect(
      JSON.stringify({
        evaluations: s.evaluations,
        activations: s.activations,
        tasks: s.tasks,
      }),
    ).toBe(history);
    expect(migrateState(copy(s))).toEqual(s);
  });
  it("retains deliberately incomplete new drafts", () => {
    const s = seed();
    s.scenarios[0].draft = newConfig(s.now);
    migrateState(s);
    expect(s.scenarios[0].draft).toMatchObject({
      journey: "",
      customerGroup: "",
      category: "",
    });
  });
});
