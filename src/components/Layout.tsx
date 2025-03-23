const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-light-primary dark:bg-dark-primary h-full rounded-lg overflow-hidden">
      <div className="h-full">{children}</div>
    </main>
  );
};

export default Layout;
