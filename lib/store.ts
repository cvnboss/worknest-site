/* eslint-disable @typescript-eslint/no-explicit-any */

export type StoreItem = { id: string; [key: string]: any };

class DataStore {
  private data: Map<string, Map<string, StoreItem>> = new Map();
  private initialized = false;

  getCollection(name: string): Map<string, StoreItem> {
    if (!this.data.has(name)) {
      this.data.set(name, new Map());
    }
    return this.data.get(name)!;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  setInitialized(): void {
    this.initialized = true;
  }

  reset(): void {
    this.data.clear();
    this.initialized = false;
  }

  getAll(collection: string): StoreItem[] {
    return Array.from(this.getCollection(collection).values());
  }

  getById(collection: string, id: string): StoreItem | undefined {
    return this.getCollection(collection).get(id);
  }

  create(collection: string, item: Omit<StoreItem, 'id'> & { id?: string }): StoreItem {
    const id = item.id || crypto.randomUUID();
    const record: StoreItem = { ...item, id };
    this.getCollection(collection).set(id, record);
    return record;
  }

  update(collection: string, id: string, updates: Partial<StoreItem>): StoreItem | undefined {
    const coll = this.getCollection(collection);
    const existing = coll.get(id);
    if (!existing) return undefined;
    const updated: StoreItem = { ...existing, ...updates, id };
    coll.set(id, updated);
    return updated;
  }

  delete(collection: string, id: string): boolean {
    return this.getCollection(collection).delete(id);
  }

  count(collection: string): number {
    return this.getCollection(collection).size;
  }

  search(collection: string, query: string, fields: string[]): StoreItem[] {
    const lower = query.toLowerCase();
    return this.getAll(collection).filter((item) =>
      fields.some((field) => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(lower);
      })
    );
  }

  filter(collection: string, filters: Record<string, any>): StoreItem[] {
    return this.getAll(collection).filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === '' || value === 'all') return true;
        return item[key] === value;
      })
    );
  }

  paginate(
    items: StoreItem[],
    page: number,
    limit: number
  ): { data: StoreItem[]; total: number; page: number; limit: number; totalPages: number } {
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    return { data, total, page, limit, totalPages };
  }

  sort(items: StoreItem[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): StoreItem[] {
    return [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal === bVal) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}

const globalForStore = globalThis as unknown as { store: DataStore };
const store = globalForStore.store || new DataStore();
if (process.env.NODE_ENV !== 'production') globalForStore.store = store;

export default store;
