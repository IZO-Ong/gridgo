"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPostById, createComment, castVote } from "@/lib/api";
import Link from "next/link";
import { Post } from "@/types"; // Use your centralized types

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchThread();
  }, [id]);

  const fetchThread = async () => {
    try {
      const data = await getPostById(id as string);
      // Data now contains hydrated user_vote from your new backend
      setPost(data);
    } catch (err) {
      console.error("THREAD_LOAD_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostVote = async (val: number) => {
    if (!user || !post) return alert("AUTH_REQUIRED");

    const currentVote = post.user_vote ?? 0;
    const newValue = currentVote === val ? 0 : val;
    const diff = newValue - currentVote;

    setPost({
      ...post,
      user_vote: newValue,
      upvotes: post.upvotes + diff,
    });

    await castVote(post.id, "post", newValue);
  };

  const handleCommentVote = async (commentId: string, val: number) => {
    if (!user || !post) return alert("AUTH_REQUIRED");

    const targetComment = post.comments.find((c) => c.id === commentId);
    if (!targetComment) return;

    const currentVote = targetComment.user_vote ?? 0;
    const newValue = currentVote === val ? 0 : val;
    const diff = newValue - currentVote;

    setPost({
      ...post,
      comments: post.comments.map((c) =>
        c.id === commentId
          ? { ...c, user_vote: newValue, upvotes: (c.upvotes || 0) + diff }
          : c
      ),
    });

    await castVote(commentId, "comment", newValue);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createComment(post.id, commentText);
      setCommentText("");
      fetchThread();
    } catch (err) {
      alert("COMMENT_FAILED");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 font-black italic animate-pulse uppercase min-h-screen">
        {" "}
        INITIALIZING_THREAD...
      </div>
    );
  if (!post)
    return (
      <div className="p-20 font-black text-red-600 uppercase">
        {" "}
        ERROR: THREAD_NOT_FOUND
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        >
          <path d="M19 12H5m7 7l-7-7 7-7" />
        </svg>
        Return_to_Feed
      </button>

      {/* Main Post Section: Content + Square Snapshot */}
      <div className="flex border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        {/* Voting Sidebar */}
        <div className="w-14 bg-zinc-50 border-r-4 border-black flex flex-col items-center py-6 gap-2 shrink-0">
          <button
            onClick={() => handlePostVote(1)}
            className={`cursor-pointer transition-all hover:scale-110 ${post.user_vote === 1 ? "text-black" : "opacity-20"}`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={post.user_vote === 1 ? "black" : "none"}
              stroke="black"
              strokeWidth="4"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <span className="font-black italic text-lg select-none">
            {post.upvotes}
          </span>
          <button
            onClick={() => handlePostVote(-1)}
            className={`cursor-pointer transition-all hover:scale-110 ${post.user_vote === -1 ? "text-black" : "opacity-20"}`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={post.user_vote === -1 ? "black" : "none"}
              stroke="black"
              strokeWidth="4"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Content Body with Inset Snapshot */}
        <div className="flex-1 p-8 flex items-start gap-8">
          <div className="flex-1 space-y-6 flex flex-col">
            <div className="flex items-center gap-3 text-xs font-black uppercase opacity-40">
              <span>u/{post.creator?.username}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
              {post.title}
            </h1>
            <p className="text-lg opacity-80 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
            <div className="pt-4 text-[10px] font-black uppercase opacity-20">
              Thread_ID: {post.id}
            </div>
          </div>

          {/* Square Snapshot Window */}
          {post.maze?.thumbnail && (
            <Link
              href={`/solve?id=${post.maze_id}`}
              className="hidden lg:block w-64 h-64 border-4 border-black relative shrink-0 overflow-hidden bg-zinc-100 cursor-pointer group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <img
                src={post.maze.thumbnail}
                alt="Matrix Target"
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <span className="bg-white text-black px-4 py-2 font-black text-[10px] italic border-2 border-black">
                  OPEN_SOLVER
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="pt-8 space-y-6">
        <h3 className="text-xl font-black uppercase italic tracking-tighter">
          {" "}
          Response_Log ({post.comments?.length || 0})
        </h3>
        {user ? (
          <form onSubmit={handleAddComment} className="space-y-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="APPEND_DATA_TO_THREAD..."
              className="w-full border-4 border-black p-4 font-bold text-sm focus:bg-zinc-50 outline-none h-32"
              required
            />
            <button
              disabled={submitting}
              className="px-8 py-3 bg-black text-white font-black uppercase italic border-4 border-black hover:bg-zinc-800 disabled:opacity-50 cursor-pointer transition-all active:translate-y-1"
            >
              {submitting ? "TRANSMITTING..." : "POST_COMMENT"}
            </button>
          </form>
        ) : (
          <div className="border-4 border-dashed border-black p-6 text-center opacity-40 font-black uppercase">
            Authentication_Required_to_Participate
          </div>
        )}

        <div className="space-y-4">
          {post.comments?.map((comment: any) => (
            <div
              key={comment.id}
              className="border-4 border-black bg-white flex hover:translate-x-1 hover:-translate-y-1 transition-transform overflow-hidden"
            >
              {/* Comment Voting Sidebar */}
              <div className="w-10 bg-zinc-50 border-r-4 border-black flex flex-col items-center py-3 gap-1 shrink-0">
                <button
                  onClick={() => handleCommentVote(comment.id, 1)}
                  className={`cursor-pointer transition-all ${comment.user_vote === 1 ? "text-black" : "opacity-20"}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={comment.user_vote === 1 ? "black" : "none"}
                    stroke="black"
                    strokeWidth="4"
                  >
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <span className="font-black italic text-[10px]">
                  {comment.upvotes || 0}
                </span>
                <button
                  onClick={() => handleCommentVote(comment.id, -1)}
                  className={`cursor-pointer transition-all ${comment.user_vote === -1 ? "text-black" : "opacity-20"}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={comment.user_vote === -1 ? "black" : "none"}
                    stroke="black"
                    strokeWidth="4"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 p-4 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-40">
                  <span>u/{comment.creator?.username}</span>
                  <span>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
