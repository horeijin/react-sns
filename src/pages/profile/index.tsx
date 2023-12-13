import { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "context/AuthContext";

import { PostProps } from "pages/home";
import { PostBox } from "components/posts/PostBox";

import { db } from "firebaseApp";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { useTranslation } from "hooks/useTranslation";
import { useRecoilState } from "recoil";
import { languageState } from "atom";

const PROFILE_DEFAULT_URL = "/logo512.png";
type TabType = "my" | "like";

interface Props {}

export const ProfilePage: FC<Props> = ({}) => {
  const [activeTab, setActiveTab] = useState<TabType>("my");
  const [myPosts, setMyPosts] = useState<PostProps[]>([]);
  const [likePosts, setLikePosts] = useState<PostProps[]>([]);
  const [language, setLanguage] = useRecoilState(languageState);
  const t = useTranslation();
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const onClickLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
    localStorage.setItem("language", language === "ko" ? "en" : "ko");
  };

  useEffect(() => {
    if (user) {
      let postsRef = collection(db, "posts");
      const myPostQuery = query(
        postsRef,
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const likePostQuery = query(
        postsRef,
        where("likes", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      onSnapshot(myPostQuery, (snapShot) => {
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc?.id,
        }));
        setMyPosts(dataObj as PostProps[]);
      });

      onSnapshot(likePostQuery, (snapShot) => {
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc?.id,
        }));
        setLikePosts(dataObj as PostProps[]);
      });
    }
  }, [user]);

  return (
    <div className="home">
      <div className="home__top">
        <div className="home__title">Profile</div>
        <div className="profile">
          <img
            src={user?.photoURL || PROFILE_DEFAULT_URL}
            alt="profile"
            className="profile__image"
            width={100}
            height={100}
          />
          <div className="profile__flex">
            <button
              type="button"
              className="profile__btn"
              onClick={() => navigate("/profile/edit")}
            >
              프로필 수정
            </button>
            <button
              type="button"
              className="profile__btn--language"
              onClick={onClickLanguage}
            >
              {language === "ko" ? "한국어" : "English"}
            </button>
          </div>
        </div>
        <div className="profile__text">
          <div className="profile__name">{user?.displayName || "사용자님"}</div>
          <div className="profile__email">{user?.email}</div>
        </div>
        <div className="home__tabs">
          <div
            className={`home__tab ${activeTab === "my" && "home__tab--active"}`}
            onClick={() => setActiveTab("my")}
          >
            For You
          </div>
          <div
            className={`home__tab ${
              activeTab === "like" && "home__tab--active"
            }`}
            onClick={() => setActiveTab("like")}
          >
            Likes
          </div>
        </div>

        {activeTab === "my" && (
          <div className="post">
            {myPosts?.length > 0 ? (
              myPosts?.map((post) => <PostBox post={post} key={post.id} />)
            ) : (
              <div className="post__no-posts">
                <div className="post__text">게시글이 없습니다.</div>
              </div>
            )}
          </div>
        )}
        {activeTab === "like" && (
          <div className="post">
            {likePosts?.length > 0 ? (
              likePosts?.map((post) => <PostBox post={post} key={post.id} />)
            ) : (
              <div className="post__no-posts">
                <div className="post__text">게시글이 없습니다.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
