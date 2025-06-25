import { ToastContainer } from "react-toastify";
import Navbar from "./(overview)/components/Navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="mx-5 ">
        <Navbar />

        {children}
      </main>

    </>
  );
}
