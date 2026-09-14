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
      <h1 data-testid="page-title" className="site-header__title">
        Бронирование авиабилетов
      </h1>
      <div className="site-header__nav">
        <a href="/" onClick={(e) => handleLinkClick(e, "/")}>Поиск рейсов</a>
        <a data-testid="nav-lookup" href="/lookup" onClick={(e) => handleLinkClick(e, "/lookup")}>Мои брони</a>
      </div>
    </>
  );
};
