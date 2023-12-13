import { FC, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PostProps } from "pages/home";
import { FollowingBox } from "components/following/FollowingBox";

import AuthContext from "context/AuthContext";

import { db, storage } from "firebaseApp";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";

interface Props {
  post: PostProps;
}

export const PostBox: FC<Props> = ({ post }) => {
  const { user } = useContext(AuthContext);
  const imageRef = ref(storage, post?.imageUrl);
  const navigate = useNavigate();

  const toggleLike = async () => {
    const postRef = doc(db, "posts", post.id);

    if (user?.uid && post?.likes?.includes(user?.uid)) {
      // 좋아요 미리 한 경우 -> 좋아요 취소
      await updateDoc(postRef, {
        likes: arrayRemove(user?.uid),
        likeCount: post?.likeCount ? post?.likeCount - 1 : 0,
      });
    } else {
      // 좋아요 하지 않은 경우 -> 좋아요
      await updateDoc(postRef, {
        likes: arrayUnion(user?.uid),
        likeCount: post?.likeCount ? post?.likeCount + 1 : 1,
      });
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("해당 게시글을 삭제하시겠습니까?");
    if (confirm) {
      //storage에 업로드된 이미지 삭제
      if (post?.imageUrl) {
        deleteObject(imageRef).catch((error) => {
          console.log(error);
        });
      }
      //firestore에 저장된 포스팅 데이터 삭제
      await deleteDoc(doc(db, "posts", post.id));
      toast.success("게시글을 삭제했습니다.");
      navigate("/");
    }
  };

  return (
    <div className="post__box" key={post?.id}>
      <div className="post__box-profile">
        <div className="post__flex">
          {post?.profileUrl ? (
            <img
              src={post?.profileUrl}
              alt="profile"
              className="post__box-profile-img"
            />
          ) : (
            <FaUserCircle className="post__box-profile-icon" />
          )}
          <div className="post__email">{post?.email}</div>
          <div className="post__createdAt">{post?.createdAt}</div>
          <FollowingBox post={post} />
        </div>
        <Link to={`/posts/${post?.id}`}>
          <div className="post__box-content">{post?.content}</div>
          {post?.imageUrl && (
            <div className="post__image-div">
              <img
                src={post?.imageUrl}
                alt="post img"
                className="post__image"
                width={100}
                height={100}
              />
            </div>
          )}
          <div className="post-form__hashtags-outputs">
            {post?.hashTags?.map((tag, index) => (
              <span className="post-form__hashtags-tag" key={index}>
                #{tag}
              </span>
            ))}
          </div>
        </Link>
      </div>

      <div className="post__box-footer">
        {user?.uid === post?.uid && (
          <>
            <button
              type="button"
              className="post__delete"
              onClick={handleDelete}
            >
              삭제
            </button>
            <button type="button" className="post__edit">
              <Link to={`/posts/edit/${post?.id}`}>수정</Link>
            </button>
          </>
        )}
        <button type="button" className="post__likes" onClick={toggleLike}>
          {user && post?.likes?.includes(user.uid) ? (
            <AiFillHeart />
          ) : (
            <AiOutlineHeart />
          )}
          {post?.likeCount || 0}
        </button>
        <button type="button" className="post__comments">
          <FaRegComment />
          {post?.comments?.length || 0}
        </button>
      </div>
    </div>
  );
};
