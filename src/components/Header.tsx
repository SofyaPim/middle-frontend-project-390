import React from "react";

interface HeaderProps {
// Передаем функцию уведомления App.tsx о том, что путь изменился
onNavigate?: (path: string) => void;
}
export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault(); // Блокируем перезагрузку страницы браузером
    window.history.pushState({}, "", path); // Меняем URL в адресной строке
    if (onNavigate) {
      onNavigate(path); // Запускаем ререндер в App.tsx
    }
  };
  return (
    <>
      <h1 data-testid="page-title" style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "5px" }}>
        Бронирование авиабилетов
      </h1>
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", fontSize: "14px" }}>
        <a href="/"   onClick={(e) => handleLinkClick(e, "/")}  style={{ textDecoration: "none", color: "#007bff" }}>Поиск рейсов</a>
        <a href="/my-bookings"  onClick={(e) => handleLinkClick(e, "/my-bookings")}  style={{ textDecoration: "none", color: "#007bff" }}>Мои брони</a>
      </div>
    </>
  );
};
