export interface Tag {
  id: string;
  name: string;
  color: string;
  pages: string[];
  user: number;
  created_at: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  parent: string | null;
  icon: string | null;
  cover_image: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user: number;
  tags: string[];
}

export interface PageTreeNode {
  id: string;
  title: string;
  icon: string | null;
  is_favorite: boolean;
  parent: string | null;
  children: PageTreeNode[];
}

export interface SearchResult {
  id: string;
  title: string;
  icon: string | null;
  cover_image: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  highlighted_title: string;
  highlighted_content: string;
  rank: number;
}
