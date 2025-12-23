import { NoodleHero } from '@/components/animations/NoodleHero';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { Marquee } from '@/components/home/Marquee';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Philosophy } from '@/components/home/Philosophy';
import { ClassesTeaser } from '@/components/home/ClassesTeaser';
import { Newsletter } from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <div className="scroll-smooth">
        <section className="scroll-snap-section">
          <NoodleHero />
        </section>
        <Marquee />
        <section className="scroll-snap-section">
          <FeaturedProducts />
        </section>
        <section className="scroll-snap-section">
          <Philosophy />
        </section>
        <section className="scroll-snap-section">
          <ClassesTeaser />
        </section>
        <Marquee />
        <section className="scroll-snap-section">
          <Newsletter />
        </section>
      </div>
    </>
  );
}
