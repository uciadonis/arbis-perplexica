const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="lg:pl-20 bg-light-primary dark:bg-dark-primary min-h-screen">
      <div className="lg:mx-auto">{children}</div>
    </main>
  );
};

export default Layout;
