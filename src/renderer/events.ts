export type Subscriptions = Set<Function>;
export type EventsSubscriptions = Map<string, Subscriptions>

export const addEventSubscription = (
  store: EventsSubscriptions,
  namespace: string,
  value: Function
): Subscriptions => {
  const namespaceEvents = store.get(namespace);

  if (namespaceEvents) {
    return namespaceEvents.add(value);
  }

  store.set(namespace, new Set<Function>());

  return store.get(namespace)!.add(value);
}

export const hasEventSubscription = (
  store: Map<string, Set<Function>>,
  namespace: string,
  value: Function
): boolean => {
  const namespaceEvents = store.get(namespace);

  if (namespaceEvents) {
    return namespaceEvents.has(value);
  }

  return false;
}

export const removeEventSubscription = (
  store: Map<string, Set<Function>>,
  namespace: string,
  value: Function
): void => {
  const namespaceEvents = store.get(namespace);

  if (namespaceEvents) {
    namespaceEvents.delete(value);
  }
}
