import clsx from 'clsx';
import { InferGetStaticPropsType } from 'next';
import * as React from 'react';
import Lightbox from 'react-image-lightbox';

import 'react-image-lightbox/style.css';

import { getAllFilesFrontmatter } from '@/lib/mdx';
import { sortByDate } from '@/lib/mdx-client';
import useLoaded from '@/hooks/useLoaded';

import Accent from '@/components/Accent';
import ConferenceLogos from '@/components/content/talks/ConferenceLogos';
import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

type GalleryPhoto = {
  url: string;
  title: string;
  event: string;
  location?: string;
  date: string;
};

export default function TalksPage({
  talks,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const isLoaded = useLoaded();
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);

  // Flatten all photos from all talks into a single gallery
  const allPhotos: GalleryPhoto[] = talks.flatMap((talk) =>
    talk.galleryPhotos.map((photoUrl) => ({
      url: photoUrl,
      title: talk.title,
      event: talk.event,
      location: talk.location,
      date: new Date(talk.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      }),
    }))
  );

  const totalTalks = talks.length;

  return (
    <Layout>
      <Seo
        templateTitle='Talks'
        description='International conference talks and speaking engagements on AI, LLM applications, and software engineering.'
      />

      <main>
        <section className={clsx(isLoaded && 'fade-in-start')}>
          <div className='layout py-12'>
            <h1 className='text-3xl md:text-5xl' data-fade='0'>
              <Accent>Conference Talks</Accent>
            </h1>
            <p data-fade='1' className='mt-2 text-gray-600 dark:text-gray-300'>
              Speaking at international conferences about AI systems, LLM
              applications, and software architecture.
            </p>

            {/* Stats */}
            <div className='mt-6 flex flex-wrap gap-6' data-fade='2'>
              <div className='flex flex-col'>
                <span className='text-primary-600 text-3xl font-bold dark:text-primary-400'>
                  {totalTalks}+
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Conferences
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-primary-600 text-3xl font-bold dark:text-primary-400'>
                  {allPhotos.length}
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Photos
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-primary-600 text-3xl font-bold dark:text-primary-400'>
                  5+
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Countries
                </span>
              </div>
            </div>

            {/* Photo Gallery Grid */}
            <div
              data-fade='3'
              className='mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
            >
              {allPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPhotoIndex(idx);
                    setIsOpen(true);
                  }}
                  className='group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:bg-gray-800'
                >
                  <img
                    src={photo.url}
                    alt={`${photo.event} - ${photo.title}`}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                  />
                  {/* Hover overlay */}
                  <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <p className='line-clamp-2 text-sm font-bold text-white'>
                      {photo.event}
                    </p>
                    <p className='text-xs text-white/80'>{photo.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Conference Logos Marquee */}
        <ConferenceLogos />

        {/* Lightbox */}
        {isOpen && (
          <Lightbox
            mainSrc={allPhotos[photoIndex].url}
            nextSrc={allPhotos[(photoIndex + 1) % allPhotos.length].url}
            prevSrc={
              allPhotos[(photoIndex + allPhotos.length - 1) % allPhotos.length]
                .url
            }
            onCloseRequest={() => setIsOpen(false)}
            onMovePrevRequest={() =>
              setPhotoIndex(
                (photoIndex + allPhotos.length - 1) % allPhotos.length
              )
            }
            onMoveNextRequest={() =>
              setPhotoIndex((photoIndex + 1) % allPhotos.length)
            }
            imageTitle={`${allPhotos[photoIndex].event} - ${allPhotos[photoIndex].title}`}
            imageCaption={`${allPhotos[photoIndex].date}${
              allPhotos[photoIndex].location
                ? ` • ${allPhotos[photoIndex].location}`
                : ''
            }`}
          />
        )}
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const files = await getAllFilesFrontmatter('talks');
  const talks = sortByDate(files);

  return { props: { talks } };
}
