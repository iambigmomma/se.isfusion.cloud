import * as React from 'react';

type Conference = {
  name: string;
  logo: string;
};

export default function ConferenceLogos() {
  const conferences: Conference[] = [
    { name: 'COSCUP', logo: 'https://coscup.org/2024/logo-512.png' },
    {
      name: 'PyCon Taiwan',
      logo: 'https://tw.pycon.org/2024/static/media/logo-text.png',
    },
    { name: 'JSConf Asia', logo: 'https://jsconf.asia/logo.png' },
    {
      name: 'Google DevFest',
      logo: 'https://developers.google.com/profile/badges/events/devfest/2024/badge.svg',
    },
    {
      name: 'AWS Summit',
      logo: 'https://d1.awsstatic.com/events/aws-hosted-events/2024/EMEA/summit-berlin-2024/ase24-berlin-lockup-white.04f5ec9f3be6f1e23e44a0cc2d04aaef9cc6db94.png',
    },
    {
      name: 'Microsoft Build',
      logo: 'https://news.microsoft.com/wp-content/uploads/prod/sites/558/2024/01/Microsoft-Build-2024-logo-1024x576.png',
    },
  ];

  // Duplicate logos for seamless infinite scroll
  const allLogos = [...conferences, ...conferences, ...conferences];

  return (
    <div className='w-full overflow-hidden bg-gradient-to-r from-gray-50 via-white to-gray-50 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='layout'>
        <h2 className='mb-8 text-center text-2xl font-bold text-gray-800 dark:text-gray-200'>
          Featured Conferences
        </h2>
        <div className='relative'>
          {/* Gradient overlays for fade effect */}
          <div className='absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-white to-transparent dark:from-gray-800' />
          <div className='absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-white to-transparent dark:from-gray-800' />

          {/* Scrolling container */}
          <div className='logos-marquee flex items-center gap-12'>
            {allLogos.map((conf, idx) => (
              <div
                key={idx}
                className='flex h-20 w-32 flex-shrink-0 items-center justify-center opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0'
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
