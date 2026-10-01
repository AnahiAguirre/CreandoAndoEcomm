import { and, asc, count, eq, ne } from 'drizzle-orm';

import type { AdminCategory, Category } from '@/domain/catalog/category';
import type { CategoryFields, CategoryRepository } from '@/domain/catalog/category-repository';

import type { Db } from '../client';
import { categories, products } from '../schema';

type CategoryRow = typeof categories.$inferSelect;

function toCategory(row: Pick<CategoryRow, 'id' | 'slug' | 'name'>): Category {
  return { id: row.id, slug: row.slug, name: row.name };
}

export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(private readonly db: Db) {}

  async listAll(): Promise<AdminCategory[]> {
    const rows = await this.db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));
    return rows;
  }

  async listWithActiveProducts(): Promise<Category[]> {
    const rows = await this.db
      .selectDistinct({ id: categories.id, slug: categories.slug, name: categories.name })
      .from(categories)
      .innerJoin(products, and(eq(products.categoryId, categories.id), eq(products.active, true)))
      .orderBy(asc(categories.name));
    return rows.map(toCategory);
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.db.query.categories.findFirst({ where: eq(categories.id, id) });
    return row ? toCategory(row) : null;
  }

  async slugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const row = await this.db.query.categories.findFirst({
      columns: { id: true },
      where: excludeId ? and(eq(categories.slug, slug), ne(categories.id, excludeId)) : eq(categories.slug, slug),
    });
    return Boolean(row);
  }

  async create(fields: CategoryFields): Promise<Category> {
    const [row] = await this.db.insert(categories).values(fields).returning();
    return toCategory(row);
  }

  async update(id: string, fields: CategoryFields): Promise<Category> {
    const [row] = await this.db
      .update(categories)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return toCategory(row);
  }

  async delete(id: string): Promise<void> {
    // products.category_id is ON DELETE SET NULL: the products stay.
    await this.db.delete(categories).where(eq(categories.id, id));
  }
}
