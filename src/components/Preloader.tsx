import React from "react";

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" aria-label="Loading" />
        <span className="text-sm text-muted-foreground">Загрузка…</span>
      </div>
    </div>
  );
};

export default Preloader;


