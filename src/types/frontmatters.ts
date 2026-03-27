import { ReadTimeResults } from 'reading-time';

export type BlogFrontmatter = {
  wordCount: number;
  readingTime: ReadTimeResults;
  slug: string;
  englishOnly?: boolean;
  title: string;
  description: string;
  banner: string;
  publishedAt: string;
  lastUpdated?: string;
  tags: string;
};

export type ContentType = 'blog' | 'library' | 'projects' | 'talks';

export type PickFrontmatter<T extends ContentType> = T extends 'blog'
  ? BlogFrontmatter
  : T extends 'library'
  ? LibraryFrontmatter
  : T extends 'talks'
  ? TalkFrontmatter
  : ProjectFrontmatter;

export type InjectedMeta = { views?: number; likes?: number };

export type BlogType = {
  code: string;
  frontmatter: BlogFrontmatter;
};

export type LibraryFrontmatter = {
  slug: string;
  title: string;
  readingTime: ReadTimeResults;
  description: string;
  tags: string;
};

export type LibraryType = {
  code: string;
  frontmatter: LibraryFrontmatter;
};

export type ProjectFrontmatter = {
  slug: string;
  title: string;
  publishedAt: string;
  lastUpdated?: string;
  description: string;
  category?: string;
  techs: string;
  banner: string;
  link?: string;
  github?: string;
  youtube?: string;
};

export type ProjectType = {
  code: string;
  frontmatter: ProjectFrontmatter;
};

export type TalkFrontmatter = {
  slug: string;
  title: string;
  event: string;
  publishedAt: string;
  location?: string;
  conferenceLogo: string;
  galleryPhotos: string[]; // Array of photo URLs for gallery
  featured?: boolean;
};

export type TalkType = {
  code: string;
  frontmatter: TalkFrontmatter;
};

export type FrontmatterWithTags = BlogFrontmatter | LibraryFrontmatter;
export type FrontmatterWithDate =
  | BlogFrontmatter
  | ProjectFrontmatter
  | TalkFrontmatter;
export type Frontmatter =
  | ProjectFrontmatter
  | BlogFrontmatter
  | LibraryFrontmatter
  | TalkFrontmatter;
