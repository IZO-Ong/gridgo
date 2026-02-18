export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Maze {
  id: string;
  thumbnail?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  creator_id: string;
  creator: User;
  upvotes: number;
  user_vote?: number;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  maze_id?: string;
  maze?: Maze;
  creator_id: string;
  creator: User;
  upvotes: number;
  user_vote?: number;
  comments: Comment[];
  created_at: string;
}
