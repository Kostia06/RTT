import { NoodleHero } from '@/components/animations/NoodleHero';
import { Marquee } from '@/components/home/Marquee';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Philosophy } from '@/components/home/Philosophy';
import { ClassesTeaser } from '@/components/home/ClassesTeaser';
import { Newsletter } from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <NoodleHero />
      <Marquee />
      <FeaturedProducts />
      <Philosophy />
      <ClassesTeaser />
      <Marquee />
      <Newsletter />
    </>
  );
}
