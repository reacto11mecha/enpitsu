import type { Session } from "@enpitsu/auth";

import { MainNav } from "./MainNav";
import { ModeToggle } from "./ThemeSwitcher";
import { UserNav } from "./UserNav";

export const Navbar = ({ user }: { user: Session["user"] }) => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav role={user.role} className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserNav
            name={user.name!}
            profileImage={user.image!}
            email={user.email!}
          />
        </div>
      </div>
    </div>
  );
};
