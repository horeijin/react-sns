import { FC, ReactNode } from "react";
import { MenuList } from "./Menu";

interface Props {
  children: ReactNode;
}

export const Layout: FC<Props> = ({ children }) => {
  return (
    <div className="layout">
      {children}
      <MenuList />
    </div>
  );
};
