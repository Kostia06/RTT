import { NoodleHero } from '@/components/animations/NoodleHero';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { Marquee } from '@/components/home/Marquee';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { RecipesShowcase } from '@/components/home/RecipesShowcase';
import { WorkshopsTeaser } from '@/components/home/WorkshopsTeaser';
import { Philosophy } from '@/components/home/Philosophy';
import { WorkshopGallery } from '@/components/home/WorkshopGallery';
import { Newsletter } from '@/components/home/Newsletter';
import { SectionDivider } from '@/components/home/SectionDivider';

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <NoodleHero />
      <Marquee />
      <FeaturedProducts />
      <SectionDivider variant="light" pattern="dots" />
      <RecipesShowcase />
      <SectionDivider variant="dark" pattern="lines" />
      <WorkshopsTeaser />
      <SectionDivider variant="light" pattern="wave" />
      <Philosophy />
      <WorkshopGallery />
      <Marquee />
      <Newsletter />
    </>
  );
}
