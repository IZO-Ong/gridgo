"use client";
import { useState, useEffect } from "react";
import ForumCard from "@/components/forum/ForumCard";
import { useAuth } from "@/context/AuthContext";
import { getPosts } from "@/lib/api";
import Link from "next/link";
import { Post } from "@/types";

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newPosts: Post[] = await getPosts(offset);
      if (newPosts.length < 10) setHasMore(false);

      setPosts((prev: Post[]) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });

      setOffset((prev: number) => prev + 10);
    } catch (err) {
      console.error("FEED_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 relative min-h-screen">
      {user && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-5xl w-full pointer-events-none z-50">
          <Link
            href="/forum/new"
            className="absolute right-8 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all border-4 border-black group cursor-pointer pointer-events-auto"
            title="START_NEW_THREAD"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="group-hover:rotate-90 transition-transform"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-4 cursor-default">
        {posts.map((post) => (
          <ForumCard key={post.id} post={post} />
        ))}

        {loading && (
          <div className="p-10 text-center font-black italic animate-pulse uppercase text-[11px]">
            SYNCHRONIZING_FEED...
          </div>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <button
            onClick={fetchPosts}
            className="w-full border-4 border-black p-4 font-black uppercase italic hover:bg-black hover:text-white transition-all cursor-pointer"
          >
            LOAD_MORE_POSTS
          </button>
        )}
      </div>
    </div>
  );
}
