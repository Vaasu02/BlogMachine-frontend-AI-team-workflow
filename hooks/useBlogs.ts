"use client";

import { useState, useEffect, useCallback } from "react";
import { Blog, BlogListResponse } from "@/lib/types";
import { getBlogs, deleteBlog } from "@/lib/api";

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data: BlogListResponse = await getBlogs(page * limit, limit);
      setBlogs(data.blogs);
      setTotal(data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id);
      await fetchBlogs();
    } catch {
      // ignore
    }
  };

  const nextPage = () => {
    if ((page + 1) * limit < total) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  return {
    blogs,
    total,
    loading,
    page,
    limit,
    nextPage,
    prevPage,
    handleDelete,
    refetch: fetchBlogs,
  };
}
