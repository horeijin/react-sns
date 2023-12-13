import { FC, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { PostProps } from "pages/home";
import Loader from "components/loader/Loader";
import { PostBox } from "components/posts/PostBox";

import { db } from "firebaseApp";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { PostHeader } from "components/posts/PostHeader";
import { CommentForm } from "components/comments/CommentForm";
import { CommentBox, CommentProps } from "components/comments/CommentBox";

interface Props {}

export const PostDetail: FC<Props> = ({}) => {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);

  const getPost = useCallback(async () => {
    if (params.id) {
      const docRef = doc(db, "posts", params.id);
      onSnapshot(docRef, (doc) => {
        setPost({ ...(doc?.data() as PostProps), id: doc.id });
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  return (
    <div className="post">
      <PostHeader />
      {post ? (
        <>
          <PostBox post={post} />
          <CommentForm post={post} />
          {post?.comments
            ?.slice(0)
            ?.reverse()
            ?.map((data: CommentProps, index: number) => (
              <CommentBox data={data} key={index} post={post} />
            ))}
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
};
