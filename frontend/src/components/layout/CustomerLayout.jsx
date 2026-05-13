import Navbar from './Navbar';
import Footer from './Footer';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-flash-black flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
