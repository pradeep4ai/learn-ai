import { PostMeta } from './post';

export interface Draft extends PostMeta {
  content: string;
  updatedAt: string;
  source: 'local';
}

export type PostListItem = (PostMeta & { source: 'file' }) | Draft;
