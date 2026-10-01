export interface Category {
  id: string;
  slug: string;
  name: string;
}

/** Admin view: how many products (drafts included) hang from the category. */
export interface AdminCategory extends Category {
  productCount: number;
}
