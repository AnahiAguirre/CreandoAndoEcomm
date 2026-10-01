import { DomainError } from '@/domain/shared/errors';

import type { AdminCategory, Category } from '../category';
import { categoryInputSchema, type CategoryInput } from '../category-input';
import type { CategoryRepository } from '../category-repository';
import { slugify } from '../product-input';

export class CategoryNotFoundError extends DomainError {
  constructor(readonly id: string) {
    super('La categoría no existe (¿la borró otra persona?).', 'CATEGORY_NOT_FOUND');
  }
}

export class CategorySlugTakenError extends DomainError {
  constructor(readonly slug: string) {
    super(`Ya existe una categoría con el slug "${slug}"`, 'CATEGORY_SLUG_TAKEN');
  }
}

/** Every method assumes the caller already passed `requireAdmin()`. */
export class CategoryAdmin {
  constructor(private readonly categories: CategoryRepository) {}

  list(): Promise<AdminCategory[]> {
    return this.categories.listAll();
  }

  async create(input: CategoryInput): Promise<Category> {
    const fields = this.parse(input);
    if (await this.categories.slugTaken(fields.slug)) throw new CategorySlugTakenError(fields.slug);
    return this.categories.create(fields);
  }

  async update(id: string, input: CategoryInput): Promise<Category> {
    await this.assertExists(id);
    const fields = this.parse(input);
    if (await this.categories.slugTaken(fields.slug, id)) throw new CategorySlugTakenError(fields.slug);
    return this.categories.update(id, fields);
  }

  /** Products of the category are kept; they just lose it. */
  async delete(id: string): Promise<void> {
    await this.assertExists(id);
    await this.categories.delete(id);
  }

  private async assertExists(id: string): Promise<void> {
    if (!(await this.categories.findById(id))) throw new CategoryNotFoundError(id);
  }

  private parse(input: CategoryInput) {
    const parsed = categoryInputSchema.parse(input);
    return { name: parsed.name, slug: parsed.slug || slugify(parsed.name) };
  }
}

/**
 * Storefront: every category is a filter and a landing target (the home cards
 * link to them), even while it has no published products yet.
 */
export class ListStorefrontCategories {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    const all = await this.categories.listAll();
    return all.map(({ id, slug, name }) => ({ id, slug, name }));
  }
}
