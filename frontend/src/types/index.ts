export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  isNew?: boolean;
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  urgent: boolean;
  listId: string;
  createdAt: string;
}
