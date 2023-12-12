import { FC, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { PostProps } from "pages/home";
import Loader from "components/loader/Loader";
import { PostBox } from "components/posts/PostBox";

import { db } from "firebaseApp";
import { doc, getDoc } from "firebase/firestore";
import { PostHeader } from "components/posts/PostHeader";

interface Props {}

export const PostDetail: FC<Props> = ({}) => {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);

  const getPost = useCallback(async () => {
    if (params.id) {
      const docRef = doc(db, "posts", params.id);
      const docSnap = await getDoc(docRef);

      setPost({ ...(docSnap?.data() as PostProps), id: docSnap?.id });
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  return (
    <div className="post">
      <PostHeader />
      {post ? <PostBox post={post} /> : <Loader />}
    </div>
  );
};
