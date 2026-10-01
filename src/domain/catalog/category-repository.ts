import type { AdminCategory, Category } from './category';

export interface CategoryFields {
  name: string;
  slug: string;
}

/**
 * Port: how the domain reads and writes categories. Deleting a category never
 * deletes products — they simply end up without one.
 */
export interface CategoryRepository {
  listAll(): Promise<AdminCategory[]>;
  findById(id: string): Promise<Category | null>;
  slugTaken(slug: string, excludeId?: string): Promise<boolean>;
  create(fields: CategoryFields): Promise<Category>;
  update(id: string, fields: CategoryFields): Promise<Category>;
  delete(id: string): Promise<void>;
}
