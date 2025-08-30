export interface SavedListItem {
  id: string;
  name: string;
  brand?: string;
  why: string;
  eco_friendly: boolean;
  est_price_usd?: number;
  url?: string;
  votes: {
    thumbsUp: number;
    thumbsDown: number;
    userVote?: 'up' | 'down' | null;
  };
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface UserList {
  id: string;
  name: string;
  description?: string;
  items: SavedListItem[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareCode?: string;
  author: string;
}

export interface ListStore {
  lists: UserList[];
  addList: (list: Omit<UserList, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateList: (id: string, updates: Partial<UserList>) => void;
  deleteList: (id: string) => void;
  addItemToList: (listId: string, item: Omit<SavedListItem, 'id' | 'votes' | 'comments'>) => void;
  voteOnItem: (listId: string, itemId: string, vote: 'up' | 'down') => void;
  addComment: (listId: string, itemId: string, comment: string, author: string) => void;
}
