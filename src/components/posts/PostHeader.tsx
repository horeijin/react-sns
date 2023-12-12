import { FC } from "react";

import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

interface Props {}

export const PostHeader: FC<Props> = ({}) => {
  const navigate = useNavigate();

  return (
    <div className="post__header">
      <button type="button" onClick={() => navigate(-1)}>
        <IoIosArrowBack className="post__header-btn" />
      </button>
    </div>
  );
};
