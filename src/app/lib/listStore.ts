"use client";
import { UserList, SavedListItem } from "@/app/types/userLists";

class ListStore {
  private lists: UserList[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('totsylist-user-lists', JSON.stringify(this.lists));
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('totsylist-user-lists');
      if (stored) {
        this.lists = JSON.parse(stored);
      }
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLists(): UserList[] {
    return [...this.lists];
  }

  getList(id: string): UserList | undefined {
    return this.lists.find(list => list.id === id);
  }

  addList(listData: Omit<UserList, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = Date.now().toString();
    const newList: UserList = {
      ...listData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      shareCode: listData.isPublic ? this.generateShareCode() : undefined
    };
    
    this.lists.push(newList);
    this.saveToStorage();
    this.notify();
    return id;
  }

  updateList(id: string, updates: Partial<UserList>) {
    const index = this.lists.findIndex(list => list.id === id);
    if (index !== -1) {
      this.lists[index] = { 
        ...this.lists[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      this.saveToStorage();
      this.notify();
    }
  }

  deleteList(id: string) {
    this.lists = this.lists.filter(list => list.id !== id);
    this.saveToStorage();
    this.notify();
  }

  addItemToList(listId: string, itemData: Omit<SavedListItem, 'id' | 'votes' | 'comments'>) {
    const list = this.lists.find(l => l.id === listId);
    if (list) {
      const newItem: SavedListItem = {
        ...itemData,
        id: Date.now().toString(),
        votes: { thumbsUp: 0, thumbsDown: 0, userVote: null },
        comments: []
      };
      
      list.items.push(newItem);
      list.updatedAt = new Date();
      this.saveToStorage();
      this.notify();
    }
  }

  voteOnItem(listId: string, itemId: string, vote: 'up' | 'down') {
    const list = this.lists.find(l => l.id === listId);
    if (list) {
      const item = list.items.find(i => i.id === itemId);
      if (item) {
        // Remove previous vote
        if (item.votes.userVote === 'up') item.votes.thumbsUp--;
        if (item.votes.userVote === 'down') item.votes.thumbsDown--;
        
        // Add new vote
        if (vote === 'up') {
          item.votes.thumbsUp++;
          item.votes.userVote = 'up';
        } else {
          item.votes.thumbsDown++;
          item.votes.userVote = 'down';
        }
        
        this.saveToStorage();
        this.notify();
      }
    }
  }

  addComment(listId: string, itemId: string, text: string, author: string) {
    const list = this.lists.find(l => l.id === listId);
    if (list) {
      const item = list.items.find(i => i.id === itemId);
      if (item) {
        item.comments.push({
          id: Date.now().toString(),
          text,
          author,
          timestamp: new Date()
        });
        
        this.saveToStorage();
        this.notify();
      }
    }
  }

  private generateShareCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export const listStore = new ListStore();
