import { Header, Footer } from '@/components/layout';
import { Hero, About, Collections, Testimonials, Contact } from '@/components/sections';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Collections />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
