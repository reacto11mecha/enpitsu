"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@enpitsu/ui/avatar";
import { Button } from "@enpitsu/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";

export function UserNav({
  name,
  email,
  profileImage,
}: {
  name: string;
  email: string;
  profileImage: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileImage.replace("=s96-c", "")} asChild>
              <Image
                src={profileImage.replace("=s96-c", "")}
                alt="Foto Profil"
                width={80}
                height={80}
              />
            </AvatarImage>
            <AvatarFallback className="uppercase">
              {name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={"/profile"} className="w-full hover:cursor-pointer">
              Profil Anda
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={"/about"} className="w-full hover:cursor-pointer">
              Tentang Aplikasi
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={"/logout"} className="w-full hover:cursor-pointer">
            Keluar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
