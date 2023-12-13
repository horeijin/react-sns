import { FC, useEffect, useState, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "context/AuthContext";
import { FiImage } from "react-icons/fi";

import { db, storage } from "firebaseApp";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadString,
  deleteObject,
} from "firebase/storage";

import { PostProps } from "pages/home";
import { v4 as uuidv4 } from "uuid";

import { toast } from "react-toastify";
import { PostHeader } from "./PostHeader";

interface Props {}

export const PostEditForm: FC<Props> = ({}) => {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const [content, setContent] = useState<string>("");

  const [hashTag, setHashTag] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleFileUpload = (e: any) => {
    const {
      target: { files },
    } = e;

    const file = files?.[0];
    const fileReader = new FileReader();
    fileReader?.readAsDataURL(file);

    fileReader.onloadend = (e: any) => {
      const { result } = e?.currentTarget;
      setImageFile(result);
    };
  };

  const getPost = useCallback(async () => {
    if (params.id) {
      const docRef = doc(db, "posts", params.id);
      const docSnap = await getDoc(docRef);
      setPost({ ...(docSnap?.data() as PostProps), id: docSnap.id });
      setContent(docSnap?.data()?.content);
      setTags(docSnap?.data()?.hashTags);
      setImageFile(docSnap?.data()?.imageUrl);
    }
  }, [params.id]);

  const onSubmit = async (e: any) => {
    setIsSubmitting(true);
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);

    e.preventDefault();
    try {
      if (post) {
        // 기존에 사진이 있는 포스트면, 기존 이미지 삭제
        if (post?.imageUrl) {
          let imageRef = ref(storage, post?.imageUrl);
          await deleteObject(imageRef).catch((error) => {
            console.log(error);
          });
        }

        //새로운 이미지 파일 업로드
        let imageUrl = "";
        if (imageFile) {
          const data = await uploadString(storageRef, imageFile, "data_url");
          imageUrl = await getDownloadURL(data?.ref);
        }

        const postRef = doc(db, "posts", post?.id);
        await updateDoc(postRef, {
          content: content,
          hashTags: tags,
          imageUrl: imageUrl,
        });
        navigate(`/posts/${post?.id}`);
        toast.success("게시글을 수정했습니다.");
      }
      setImageFile(null);
      setIsSubmitting(false);
    } catch (e: any) {
      console.log(e);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "content") {
      setContent(value);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags?.filter((val) => val !== tag));
  };

  const onChangeHashTag = (e: any) => {
    setHashTag(e?.target?.value?.trim());
  };

  const handleKeyUp = (e: any) => {
    //키코드 32 = 스페이스바
    if (e.keyCode === 32 && e.target.value.trim() !== "") {
      if (tags?.includes(e.target.value?.trim())) {
        // 만약 같은 태그가 있다면 에러를 띄운다
        toast.error("같은 태그가 있습니다.");
      } else {
        // 아니라면 태그를 생성해준다
        setTags((prev) => (prev?.length > 0 ? [...prev, hashTag] : [hashTag]));
        setHashTag("");
      }
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  return (
    <>
      <div className="post">
        <PostHeader />
      </div>
      <form className="post-form" onSubmit={onSubmit}>
        <textarea
          className="post-form__textarea"
          required
          name="content"
          id="content"
          placeholder="무슨 일이 벌어지고 있나요?"
          onChange={onChange}
          value={content}
        />
        <div className="post-form__hashtags">
          <span className="post-form__hashtags-outputs">
            {tags?.map((tag, i) => (
              <span
                className="post-form__hashtags-tag"
                key={i}
                onClick={() => removeTag(tag)}
              >
                #{tag}
              </span>
            ))}
          </span>
          <input
            className="post-form__input"
            name="hashtag"
            id="hashtag"
            placeholder="해시태그 + 스페이스바 입력"
            onChange={onChangeHashTag}
            onKeyUp={handleKeyUp}
            value={hashTag}
          />
        </div>
        <div className="post-form__submit-area">
          <div className="post-form__image-area">
            <label htmlFor="file-input" className="post-form__file">
              <FiImage className="post-form__file-icon" />
            </label>
            <input
              type="file"
              name="file-input"
              id="file-input"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {imageFile && (
              <div className="post-form__attachment">
                <img
                  src={imageFile}
                  alt="attachment"
                  width={100}
                  height={100}
                />
                <button
                  className="post-form__clear-btn"
                  type="button"
                  onClick={handleDeleteImage}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          <input
            type="file"
            name="file-input"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            type="submit"
            value="수정"
            className="post-form__submit-btn"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </>
  );
};
