import { NoodleHero } from '@/components/animations/NoodleHero';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { Marquee } from '@/components/home/Marquee';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Philosophy } from '@/components/home/Philosophy';
import { ClassesTeaser } from '@/components/home/ClassesTeaser';
import { WorkshopGallery } from '@/components/home/WorkshopGallery';
import { Newsletter } from '@/components/home/Newsletter';

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <NoodleHero />
      <Marquee />
      <FeaturedProducts />
      <Philosophy />
      <ClassesTeaser />
      <WorkshopGallery />
      <Marquee />
      <Newsletter />
    </>
  );
}
