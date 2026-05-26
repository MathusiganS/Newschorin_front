// Static demo data is no longer used.
// The app fetches live news from the API at /api/news.
// This file is kept for reference only.

export interface Article {
  id: number;
  title: string;
  url: string;
  image: string;
  full_text: string;
  source: string;
  category_ta?: string;
  created_at: string;
}
