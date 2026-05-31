const HOURS = [
  { day: 'Monday', time: 'Closed' },
  { day: 'Tuesday', time: 'Closed' },
  { day: 'Wednesday', time: '10:00 a.m. – 4:30 p.m.' },
  { day: 'Thursday', time: '10:00 a.m. – 4:30 p.m.' },
  { day: 'Friday', time: '10:00 a.m. – 4:30 p.m.' },
  { day: 'Saturday', time: '10:00 a.m. – 4:30 p.m.' },
  { day: 'Sunday', time: 'Closed' },
] as const;

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Respect+the+Technique+4093+Ogden+Rd+SE+Calgary+Alberta+T2G+4P9';

export const LocationHours = () => (
  <section className="bg-white py-24 sm:py-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6 mb-8">
        <div className="h-px bg-black flex-1 max-w-[100px]" />
        <span className="text-sm tracking-[0.3em] text-gray-600 uppercase">Visit Us</span>
      </div>

      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] text-black mb-12 sm:mb-16 break-words">
        LOCATION &amp; HOURS
      </h2>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Address & contact */}
        <address className="not-italic space-y-1 text-lg leading-relaxed text-black/80">
          <p className="font-bold text-black">Respect the Technique</p>
          <p>4093 Ogden Rd SE</p>
          <p>Calgary, Alberta T2G 4P9</p>
          <p className="pt-4">
            <a href="tel:+14033993438" className="text-black hover:underline underline-offset-4">
              (403) 399-3438
            </a>
          </p>
          <p>
            <a
              href="mailto:info@respectthetechnique.com"
              className="text-black hover:underline underline-offset-4"
            >
              info@respectthetechnique.com
            </a>
          </p>
          <p className="pt-6">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-black underline underline-offset-4 hover:gap-3 transition-all"
            >
              Get directions <span aria-hidden>→</span>
            </a>
          </p>
        </address>

        {/* Hours */}
        <dl className="max-w-md">
          {HOURS.map(({ day, time }) => (
            <div key={day} className="flex items-baseline justify-between border-b border-black/10 py-3">
              <dt className="text-black/70">{day}</dt>
              <dd className="font-medium text-black">{time}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-12 h-72 w-full overflow-hidden border border-black/10 sm:h-80">
        <iframe
          title="Map to Respect the Technique"
          src="https://www.google.com/maps?q=4093+Ogden+Rd+SE,+Calgary,+AB+T2G+4P9&output=embed"
          className="h-full w-full grayscale-[0.2]"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  </section>
);
