import clsx from 'clsx';
import * as React from 'react';
import { HiCalendar, HiLocationMarker } from 'react-icons/hi';

import CloudinaryImg from '@/components/images/CloudinaryImg';
import UnstyledLink from '@/components/links/UnstyledLink';

import { TalkFrontmatter } from '@/types/frontmatters';

type TalkCardProps = {
  talk: TalkFrontmatter;
} & React.ComponentPropsWithoutRef<'li'>;

export default function TalkCard({ talk, className }: TalkCardProps) {
  return (
    <li
      className={clsx(
        'group relative overflow-hidden rounded-lg',
        'border-2 border-gray-200 dark:border-gray-700',
        'hover:border-primary-400 dark:hover:border-primary-500',
        'transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-xl',
        className
      )}
    >
      <UnstyledLink
        href={`/talks/${talk.slug}`}
        className='block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400'
      >
        {/* 演講照片 */}
        <div className='relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'>
          {talk.banner && talk.banner.startsWith('http') ? (
            <img
              src={talk.banner}
              alt={talk.title}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
            />
          ) : talk.banner ? (
            <CloudinaryImg
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
              publicId={`v1684217694/${talk.banner}`}
              alt={talk.title}
              width={800}
              height={600}
              preview={false}
            />
          ) : null}

          {/* Conference Logo Overlay */}
          {talk.conferenceLogo && (
            <div className='absolute top-4 left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-gray-900'>
              <img
                src={talk.conferenceLogo}
                alt={talk.event}
                className='h-12 w-auto'
              />
            </div>
          )}
        </div>

        {/* 內容區 */}
        <div className='bg-white p-5 dark:bg-gray-900'>
          {/* Event Name */}
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-primary-600 text-sm font-bold uppercase tracking-wide dark:text-primary-400'>
              {talk.event}
            </span>
            {talk.status && (
              <span
                className={clsx(
                  'rounded-full px-2 py-1 text-xs font-semibold',
                  talk.status === 'delivered' &&
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                  talk.status === 'accepted' &&
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                  talk.status === 'invited' &&
                    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                )}
              >
                {talk.status === 'delivered'
                  ? '✓'
                  : talk.status === 'accepted'
                  ? '📅'
                  : '📧'}
              </span>
            )}
          </div>

          {/* Talk Title */}
          <h3 className='line-clamp-2 group-hover:text-primary-600 mb-3 text-xl font-bold transition-colors dark:group-hover:text-primary-400'>
            {talk.title}
          </h3>

          {/* Meta Info */}
          <div className='space-y-1.5 text-sm text-gray-600 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
              <HiCalendar className='flex-shrink-0 text-base' />
              <span>
                {new Date(talk.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            {talk.location && (
              <div className='flex items-center gap-2'>
                <HiLocationMarker className='flex-shrink-0 text-base' />
                <span className='line-clamp-1'>{talk.location}</span>
              </div>
            )}
          </div>
        </div>
      </UnstyledLink>
    </li>
  );
}
