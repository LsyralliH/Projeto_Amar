"use client";

import { Button, ButtonField, ButtonIcon } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { InputField, InputRoot } from "@/components/input";
import {
  CalendarCheck2,
  CalendarPlus,
  FileClock,
  Home,
  MessageSquare,
  Send,
  Settings,
  User,
  UserRoundPen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect, useCallback } from "react";

interface SidebarMenuProps {
  userName: string;
  activeItem: string;
  userType: "profissional" | "estagiario" | "outro";
}

export default function SidebarMenu({
  userName,
  activeItem: propActiveItem,
  userType,
}: SidebarMenuProps) {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>(
    propActiveItem || "Menu"
  );
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const router = useRouter();

  const minWidth = 300;
  const maxWidth = 400;

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWidth = localStorage.getItem("sidebarWidth");
      return savedWidth ? Number(savedWidth) : 350;
    }
    return 350;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarWidth", sidebarWidth.toString());
    }
  }, [sidebarWidth]);

  const startResizing = () => {
    isResizing.current = true;
  };

  const stopResizing = useCallback(() => {
    isResizing.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const maxAllowedWidth = Math.min(maxWidth, window.innerWidth - 50);
    const newWidth = Math.min(maxAllowedWidth, Math.max(minWidth, e.clientX));
    setSidebarWidth(newWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleMenuClick = (label: string, path: string) => {
    setActiveSidebarItem(label);
    router.push(path);
  };

  const baseMenuItems = [
    { icon: <Home />, label: "Menu", path: "/menu" },
    { icon: <UserRoundPen />, label: "Editar Perfil", path: "/perfil" },
    { icon: <MessageSquare />, label: "Bate-Papo", path: "/forum" },
    { icon: <CalendarPlus />, label: "Agendar", path: "/agendar" },
    { icon: <FileClock />, label: "Histórico", path: "/historico" },
    { icon: <Settings />, label: "Configurações", path: "/configuracoes" },
  ];

  const extraItems =
    userType === "profissional" || userType === "estagiario"
      ? [
          {
            icon: <CalendarCheck2 />,
            label: "Consultas Marcadas",
            path: "/consultas",
          },
        ]
      : [];

  const menuItems = [...baseMenuItems, ...extraItems];
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [foruns, setForuns] = useState([]);
  const token = localStorage.getItem("token");

  const formatarDataSimples = (date: Date) => {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0"); // mês começa em 0
    const ano = date.getFullYear();
    return `${dia}-${mes}-${ano}`;
  };

  const criarForum = async () => {
    try {
      const dataCriacao = formatarDataSimples(new Date());

      const response = await fetch("http://localhost:8000/api/forum/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // se estiver usando JWT
        },
        body: JSON.stringify({
          nome: novoTitulo,
          publicacao: dataCriacao,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fórum criado com sucesso:", data);
        setForuns((prev) => [...prev, data]);
        setNovoTitulo("");
      } else {
        const erro = await response.json();
        console.error("Erro ao criar fórum:", erro);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-screen bg-pink3000 border-r border-pink5000 z-50 flex flex-col"
        style={{ width: sidebarWidth }}
      >
        {/* Top bar */}
        <div className="bg-pink2000 w-full h-2 fixed top-0 left-0 flex items-center px-4" />

        {/* Conteúdo principal */}
        <div className="flex-grow overflow-auto">
          <div className="flex justify-center mt-10">
            <IconButton className="w-50 h-50 rounded-full bg-pink1000 text-pink4000 hover:text-pink4000 flex items-center justify-center transition-colors duration-300">
              <User className="w-30 h-30" />
            </IconButton>
          </div>

          <div className="flex justify-center mb-6">
            <h1 className="text-4xl font-bold text-pink4000">{userName}</h1>
          </div>

          {menuItems.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="flex justify-center mb-2">
              <Button
                className={`flex justify-between items-center px-5 h-12 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 ${
                  activeSidebarItem === item.label
                    ? "bg-pink2000 text-pink1000"
                    : "text-pink4000 hover:bg-pink2000 hover:text-pink1000"
                }`}
                onClick={() => handleMenuClick(item.label, item.path)}
              >
                <ButtonIcon
                  className={
                    activeSidebarItem === item.label
                      ? "text-pink1000"
                      : "text-pink4000"
                  }
                >
                  {item.icon}
                </ButtonIcon>
                <ButtonField className="flex-1">{item.label}</ButtonField>
              </Button>
            </div>
          ))}
        </div>

       
        {/* Rodapé com campos de título e descrição para criar fórum */}
        <div className="flex items-center p-4 border-t border-pink2000 rounded-tr-2xl bg-pink2000 gap-2">
          <InputRoot className="flex-20 bg-pink3000 h-10 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000">
            <InputField
              placeholder="Nome do fórum"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
          </InputRoot>

          <Button
            onClick={criarForum}
            className="ml-2 bg-pink4000 text-pink1000 p-2 rounded-2xl hover:bg-pink1000 transition-colors duration-300 hover:text-pink4000"
          >
            <Send className="w-5 h-5 cursor-pointer" />
          </Button>
        </div>
      </div>

      {/* Drag da sidebar */}
      <div
        className="fixed top-0 z-50 h-screen cursor-ew-resize bg-transparent"
        style={{ left: sidebarWidth - 4, width: 8 }}
        onMouseDown={startResizing}
        role="button"
        tabIndex={0}
        aria-label="Resize Sidebar"
      />
    </>
  );
}
