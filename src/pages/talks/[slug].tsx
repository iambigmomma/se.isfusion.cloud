import { getMDXComponent } from 'mdx-bundler/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import * as React from 'react';
import {
  HiCalendar,
  HiLocationMarker,
  HiOutlineEye,
  HiPlay,
  HiUsers,
} from 'react-icons/hi';
import { SiGoogledocs } from 'react-icons/si';

import { trackEvent } from '@/lib/analytics';
import { getFileBySlug, getFiles } from '@/lib/mdx';
import useContentMeta from '@/hooks/useContentMeta';
import useScrollSpy from '@/hooks/useScrollspy';

import LikeButton from '@/components/content/LikeButton';
import MDXComponents from '@/components/content/MDXComponents';
import TableOfContents, {
  HeadingScrollSpy,
} from '@/components/content/TableOfContents';
import CloudinaryImg from '@/components/images/CloudinaryImg';
import Layout from '@/components/layout/Layout';
import CustomLink from '@/components/links/CustomLink';
import Seo from '@/components/Seo';

import { TalkType } from '@/types/frontmatters';

export default function SingleTalkPage({ code, frontmatter }: TalkType) {
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  //#region  //*=========== Content Meta ===========
  const contentSlug = `t_${frontmatter.slug}`;
  const meta = useContentMeta(contentSlug, { runIncrement: true });
  //#endregion  //*======== Content Meta ===========

  //#region  //*=========== Scrollspy ===========
  const activeSection = useScrollSpy();

  const [toc, setToc] = React.useState<HeadingScrollSpy>();
  const minLevel =
    toc?.reduce((min, item) => (item.level < min ? item.level : min), 10) ?? 0;

  React.useEffect(() => {
    const headings = document.querySelectorAll('.mdx h1, .mdx h2, .mdx h3');

    const headingArr: HeadingScrollSpy = [];
    headings.forEach((heading) => {
      const id = heading.id;
      const level = +heading.tagName.replace('H', '');
      const text = heading.textContent + '';

      headingArr.push({ id, level, text });
    });

    setToc(headingArr);
  }, [frontmatter.slug]);
  //#endregion  //*======== Scrollspy ===========

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const badges = {
      delivered: {
        text: 'Delivered',
        color:
          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      },
      accepted: {
        text: 'Accepted',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      },
      invited: {
        text: 'Invited',
        color:
          'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      },
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    return (
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  return (
    <Layout>
      <Seo
        templateTitle={frontmatter.title}
        description={frontmatter.description}
        date={new Date(frontmatter.publishedAt).toISOString()}
      />

      <main>
        <section className=''>
          <div className='layout'>
            {frontmatter.banner.startsWith('http') ? (
              <img
                src={frontmatter.banner}
                alt={frontmatter.title}
                className='h-auto w-full rounded-lg'
              />
            ) : (
              <CloudinaryImg
                publicId={`iambigmomma/${frontmatter.banner}`}
                alt={frontmatter.title}
                width={1440}
                height={792}
              />
            )}

            <div className='mt-4 flex items-center gap-3'>
              <h1 className='m-0'>{frontmatter.title}</h1>
              {getStatusBadge(frontmatter.status)}
            </div>

            <p className='text-primary-600 mt-2 text-lg font-semibold dark:text-primary-400'>
              {frontmatter.event}
            </p>

            <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
              {frontmatter.description}
            </p>

            <div className='mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300'>
              <div className='flex items-center gap-1.5'>
                <HiOutlineEye className='text-base' />
                {meta?.views?.toLocaleString() ?? '–––'} views
              </div>
              <div className='flex items-center gap-1.5'>
                <HiCalendar className='text-base' />
                {new Date(frontmatter.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {frontmatter.location && (
                <div className='flex items-center gap-1.5'>
                  <HiLocationMarker className='text-base' />
                  {frontmatter.location}
                </div>
              )}
              {frontmatter.audience && (
                <div className='flex items-center gap-1.5'>
                  <HiUsers className='text-base' />
                  {frontmatter.audience}
                </div>
              )}
            </div>

            {(frontmatter.video || frontmatter.slides) && (
              <div className='mt-4 flex flex-wrap gap-3'>
                {frontmatter.video && (
                  <CustomLink
                    href={frontmatter.video}
                    onClick={() =>
                      trackEvent(`Talk Video: ${frontmatter.title}`, 'link')
                    }
                    className='inline-flex items-center gap-2 rounded-md bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800'
                  >
                    <HiPlay className='text-lg' />
                    Watch Video
                  </CustomLink>
                )}
                {frontmatter.slides && (
                  <CustomLink
                    href={frontmatter.slides}
                    onClick={() =>
                      trackEvent(`Talk Slides: ${frontmatter.title}`, 'link')
                    }
                    className='inline-flex items-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800'
                  >
                    <SiGoogledocs className='text-lg' />
                    View Slides
                  </CustomLink>
                )}
              </div>
            )}

            <hr className='mt-6 dark:border-gray-600' />

            <section className='lg:grid lg:grid-cols-[auto,250px] lg:gap-8'>
              <article className='mdx talks prose mx-auto w-full transition-colors dark:prose-invert'>
                <Component
                  components={
                    {
                      ...MDXComponents,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                  }
                />
              </article>

              <aside className='py-4'>
                <div className='sticky top-36'>
                  <TableOfContents
                    toc={toc}
                    minLevel={minLevel}
                    activeSection={activeSection}
                  />
                  <div className='flex items-center justify-center py-8'>
                    <LikeButton slug={contentSlug} />
                  </div>
                </div>
              </aside>
            </section>

            <div className='mt-8 flex flex-col items-start gap-4 md:flex-row-reverse md:justify-between'>
              <CustomLink
                href={`https://github.com/iambigmomma/se.isfusion.cloud/blob/main/src/contents/talks/${frontmatter.slug}.mdx`}
              >
                Edit this on GitHub
              </CustomLink>
              <CustomLink href='/talks'>← Back to talks</CustomLink>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getFiles('talks');

  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, ''),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const post = await getFileBySlug('talks', params?.slug as string);

  return {
    props: { ...post },
  };
};
