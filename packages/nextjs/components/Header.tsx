"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import User from "./kinesisprotocol/User";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Transfer",
    href: "/transfer",
  },
  {
    label: "Harvest",
    href: "/harvest",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        const isExternal = href.startsWith("http");
        return (
          <li key={href}>
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                    : "text-gray-700 hover:text-blue-600"
                } px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50 hover:shadow-md`}
              >
                {icon}
                <span>{label}</span>
              </a>
            ) : (
              <Link
                href={href}
                passHref
                className={`${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                    : "text-gray-700 hover:text-blue-600"
                } px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50 hover:shadow-md`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            )}
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" passHref className="flex items-center space-x-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-lg lg:text-xl">K</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg lg:text-xl tracking-tight">
                  Kinesis Protocol
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  Cross-chain yield farm
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <ul className="flex items-center space-x-2">
              <HeaderMenuLinks />
            </ul>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <User />
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden" ref={burgerMenuRef}>
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isDrawerOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isDrawerOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              <ul className="space-y-1">
                {menuLinks.map(({ label, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        passHref
                        className={`${
                          isActive 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        } block px-3 py-2 rounded-xl font-medium transition-all duration-200`}
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {icon}
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
