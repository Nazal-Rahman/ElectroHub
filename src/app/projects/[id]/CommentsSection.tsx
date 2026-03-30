"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type Reply = {
  _id: string;
  username: string;
  message: string;
  likes: number;
  createdAt: string;
};

type CommentItem = {
  _id: string;
  projectId: string;
  username: string;
  message: string;
  replies: Reply[];
  likes: number;
  createdAt: string;
};

export default function CommentsSection({
  initialComments,
  projectId,
}: {
  initialComments: CommentItem[];
  projectId: string;
}) {
  const [comments, setComments] = useState<CommentItem[]>(
    useMemo(() => initialComments ?? [], [initialComments])
  );

  const [newUsername, setNewUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newError, setNewError] = useState<string | null>(null);
  const [newLoading, setNewLoading] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, { username: string; message: string }>>(
    {}
  );
  const [replyLoadingFor, setReplyLoadingFor] = useState<string | null>(null);
  const [likeLoadingFor, setLikeLoadingFor] = useState<string | null>(null);

  async function refreshComment(updated: CommentItem) {
    setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  }

  async function onAddComment(e: FormEvent) {
    e.preventDefault();
    setNewError(null);
    setNewLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          username: newUsername,
          message: newMessage,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setNewError(data?.error?.message ?? "Failed to add comment");
        return;
      }

      const created = data.data as CommentItem;
      setComments((prev) => [...prev, created]);
      setNewMessage("");
      toast.success("Comment posted");
    } catch {
      setNewError("Failed to add comment");
      toast.error("Failed to post comment");
    } finally {
      setNewLoading(false);
    }
  }

  async function onReplySubmit(commentId: string) {
    const draft = replyDrafts[commentId];
    if (!draft) return;

    setReplyLoadingFor(commentId);
    try {
      const res = await fetch("/api/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          username: draft.username,
          message: draft.message,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to reply");

      const updated = data.data as CommentItem;
      await refreshComment(updated);
      setReplyDrafts((prev) => ({
        ...prev,
        [commentId]: { username: prev[commentId]?.username ?? "", message: "" },
      }));
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setReplyLoadingFor(null);
    }
  }

  async function onLikeComment(commentId: string, replyId?: string) {
    const key = replyId ? `${commentId}:${replyId}` : commentId;
    setLikeLoadingFor(key);
    try {
      const res = await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, ...(replyId ? { replyId } : {}) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to like");
      await refreshComment(data.data as CommentItem);
    } catch {
      toast.error("Failed to like");
    } finally {
      setLikeLoadingFor(null);
    }
  }

  return (
    <div>
      <form onSubmit={onAddComment} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/70">Name</label>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
              placeholder="Your name"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/70">Message</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="mt-1 min-h-[96px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
              placeholder="Ask a question or leave feedback..."
              required
            />
          </div>
        </div>

        {newError ? <p className="mt-2 text-sm text-red-400">{newError}</p> : null}

        <button
          type="submit"
          disabled={newLoading}
          className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {newLoading ? "Posting..." : "Post comment"}
        </button>
      </form>

      <div className="mt-5 space-y-4">
        {comments.length ? (
          comments.map((c) => (
            <motion.article
              key={c._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">{c.username}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-white/80">
                    {c.message}
                  </div>
                  <div className="mt-2 text-xs text-white/45">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : null}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <button
                    type="button"
                    onClick={() => onLikeComment(c._id)}
                    disabled={likeLoadingFor === c._id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-60"
                  >
                    <Heart size={14} className="text-cyan-200/90" />
                    {c.likes}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <ReplyBox
                  commentId={c._id}
                  draft={replyDrafts[c._id]}
                  onChange={(draft) => setReplyDrafts((prev) => ({ ...prev, [c._id]: draft }))}
                  onSubmit={() => onReplySubmit(c._id)}
                  loading={replyLoadingFor === c._id}
                />
              </div>

              {c.replies?.length ? (
                <div className="mt-4 space-y-3 pl-3 border-l border-white/10">
                  {c.replies.map((r) => (
                    <div key={r._id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white/90">{r.username}</div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-white/80">
                            {r.message}
                          </div>
                          <div className="mt-2 text-xs text-white/45">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : null}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <button
                            type="button"
                            onClick={() => onLikeComment(c._id, r._id)}
                            disabled={likeLoadingFor === `${c._id}:${r._id}`}
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-60"
                          >
                            <Heart size={14} className="text-purple-200/90" />
                            {r.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.article>
          ))
        ) : (
          <p className="text-sm text-muted-2">Be the first to comment.</p>
        )}
      </div>
    </div>
  );
}

function ReplyBox({
  commentId,
  draft,
  onChange,
  onSubmit,
  loading,
}: {
  commentId: string;
  draft?: { username: string; message: string };
  onChange: (draft: { username: string; message: string }) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const username = draft?.username ?? "";
  const message = draft?.message ?? "";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/70">
        <MessageCircle size={14} className="text-white/55" />
        Reply
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-white/70">Name</label>
          <input
            value={username}
            onChange={(e) => onChange({ username: e.target.value, message })}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
            placeholder="Your name"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/70">Message</label>
          <textarea
            value={message}
            onChange={(e) => onChange({ username, message: e.target.value })}
            className="mt-1 min-h-[72px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
            placeholder="Write a reply..."
            required
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-3 w-full rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-60"
      >
        {loading ? "Posting..." : "Post reply"}
      </button>
    </div>
  );
}

