import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "firebaseApp";

import { NotificationProps } from "pages/notifications";

import styles from "./Notification.module.scss";

interface Props {
  notification: NotificationProps;
}

export const NotificationBox: FC<Props> = ({ notification }) => {
  const navigate = useNavigate();

  const onClickNotification = async (url: string) => {
    // 해당 알림 읽었다고 업데이트
    const ref = doc(db, "notifications", notification.id);
    await updateDoc(ref, {
      isRead: true,
    });
    // 해당 알림이 가르키는 게시글의 url로 이동
    navigate(url);
  };

  return (
    <div key={notification.id} className={styles.notification}>
      <div onClick={() => onClickNotification(notification?.url)}>
        <div className={styles.notification__flex}>
          <div className={styles.notification__createdAt}>
            {notification?.createdAt}
          </div>
          {notification?.isRead === false && (
            <div className={styles.notification__unread} />
          )}
        </div>
        <div className="notification__content">{notification.content}</div>
      </div>
    </div>
  );
};
