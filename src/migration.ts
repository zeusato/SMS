import type { Action, Config, State } from "./domain";
import {
  categoryStages,
  customerGroups,
  defaultServices,
  journeys,
  serviceGroups,
} from "./taxonomy";
import { withDemoHistory } from "./seed";

// Enrich existing browser drafts and version metadata without rerunning history.
export function migrateState(state: State): State {
  state.services ??= defaultServices();
  const legacyServices = state.products.filter((p) => p.group === "Tư vấn");
  for (const service of legacyServices)
    if (!state.services.some((s) => s.id === service.id))
      state.services.push({ ...service, group: serviceGroups[0] });
  const serviceIds = new Set(legacyServices.map((s) => s.id));
  state.products = state.products.filter((p) => !serviceIds.has(p.id));
  state.categories.forEach((category) => {
    category.journeys ??= [...categoryStages(category)];
  });
  function config(c: Config) {
    c.customerGroup ??= "all";
    c.journey ??=
      categoryStages(
        state.categories.find((cat) => cat.id === c.category) ?? {
          id: c.category,
          name: "",
          description: "",
          active: true,
        },
      )[0] ?? journeys[0][0];
    c.actions = c.actions.flatMap((action): Action[] => {
      action.services ??= [];
      if (action.type !== "offer") return [action];
      const services = action.products.filter((id) => serviceIds.has(id));
      if (!services.length) return [action];
      const products = action.products.filter((id) => !serviceIds.has(id));
      const serviceAction: Action = {
        ...action,
        id: products.length ? `${action.id}-service` : action.id,
        type: "service_offer",
        services,
        products: [],
      };
      return products.length
        ? [{ ...action, products }, serviceAction]
        : [serviceAction];
    });
  }
  state.customers = state.customers.map((customer, index) =>
    withDemoHistory(
      {
        ...customer,
        groupId:
          customer.groupId ?? customerGroups[index % customerGroups.length].id,
      },
      index,
    ),
  );
  state.scenarios.forEach((scenario) => {
    if (scenario.draft) config(scenario.draft);
    scenario.versions.forEach((version) => {
      config(version.config);
      config(version.plan.config);
      for (const action of version.plan.config.actions) {
        const node = version.plan.nodes.find((n) => n.id === action.id);
        if (node) node.type = "action";
        else {
          const previous = action.id.replace(/-service$/, "");
          const previousIndex = version.plan.nodes.findIndex(
            (n) => n.id === previous,
          );
          version.plan.nodes.splice(previousIndex + 1, 0, {
            id: action.id,
            type: "action",
            label: action.title,
          });
          version.plan.edges = version.plan.edges.map((edge) =>
            edge.from === previous ? { ...edge, from: action.id } : edge,
          );
          version.plan.edges.push({ from: previous, to: action.id });
        }
      }
    });
  });
  state.bundles.forEach((bundle) => {
    bundle.products = bundle.products?.filter((id) => !serviceIds.has(id));
  });
  return state;
}
