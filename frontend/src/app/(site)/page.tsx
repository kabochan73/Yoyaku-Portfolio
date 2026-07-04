import { Hero } from "./_components/Hero";
import { FacilityInfo } from "./_components/FacilityInfo";
import { RulesSection } from "./_components/RulesSection";

export default function Home() {
  return (
    <>
      <Hero />
      <FacilityInfo />
      {/* WeeklyCalendar */}
      <RulesSection />
    </>
  );
}
