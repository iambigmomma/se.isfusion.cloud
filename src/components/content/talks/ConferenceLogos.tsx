import * as React from 'react';

type Conference = {
  name: string;
  logo: string;
};

export default function ConferenceLogos() {
  const conferences: Conference[] = [
    {
      name: 'DigitalOcean',
      logo: 'https://cdn.worldvectorlogo.com/logos/digitalocean-2.svg',
    },
    {
      name: 'NDC London',
      logo: 'https://ravendb.net/media/2025-11-ndc-london-logo-black.png',
    },
    {
      name: 'MongoDB',
      logo: 'https://img.favpng.com/14/4/4/mongodb-logo-database-nosql-png-favpng-EPSjYNnQKvB3c3Dsm4B8uN1sS.jpg',
    },
    {
      name: 'BuildStuff',
      logo: 'https://www.vhv.rs/dpng/d/90-904107_build-stuff-logo-hd-png-download.png',
    },
    {
      name: 'DevTalks',
      logo: 'https://www.devtalks.ro/storage/Event/000/000/003/logo/menu/4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce.png?v=1678815716',
    },
    {
      name: 'AI DevWorld',
      logo: 'https://aidevworld.com/wp-content/uploads/2025/09/AIDevWorld.png',
    },
    {
      name: 'Cloud AI Infrastructure Summit',
      logo: 'https://cdn.asp.events/CLIENT_CloserSt_D86EA381_5056_B739_5482D50A1A831DDD/sites/tech-show-frankfurt-2025/media/cloudexpoeurope/CAI.png/fit-in/1400x1400',
    },
    {
      name: 'EU Business School',
      logo: 'https://www.omneseducation.com/wp-content/uploads/sites/7/2022/01/EU_Business_School_logo_2017_new.png',
    },
    {
      name: 'Big Data Conference',
      logo: 'https://papercallio-production.s3.amazonaws.com/uploads/event/logo/4309/mid_300_BIGDTA_-_full_logo_yellow.png',
    },
  ];

  // Duplicate logos for seamless infinite scroll
  const allLogos = [...conferences, ...conferences, ...conferences];

  return (
    <div className='w-full overflow-hidden py-16'>
      <div className='layout'>
        <h2 className='mb-8 text-center text-2xl font-bold'>
          Speaking Engagements
        </h2>
        <div className='relative'>
          {/* Gradient overlays for fade effect */}
          <div className='absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-white to-transparent dark:from-gray-900' />
          <div className='absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-white to-transparent dark:from-gray-900' />

          {/* Scrolling container */}
          <div className='logos-marquee flex items-center gap-12'>
            {allLogos.map((conf, idx) => (
              <div
                key={idx}
                className='flex h-20 w-32 flex-shrink-0 items-center justify-center transition-all duration-300 hover:scale-110'
              >
                <img
                  src={conf.logo}
                  alt={conf.name}
                  className='max-h-full max-w-full object-contain'
                  onError={(e) => {
                    // Fallback to text if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-sm font-semibold">${conf.name}</span>`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .logos-marquee {
          animation: scroll 40s linear infinite;
        }

        .logos-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
