import { Giscus, Theme } from '@giscus/react';
import { useTheme } from 'next-themes';

import { commentFlag } from '@/constants/env';

// Need to investigate
export default function Comment() {
  const { theme } = useTheme();

  return commentFlag ? (
    <Giscus
      key={theme}
      repo='iambigmomma/se.isfusion.cloud'
      repoId='MDEwOlJlcG9zaXRvcnkzMzAyMTQyNDc='
      category='General'
      categoryId='DIC_kwDOE66rZ84B--B0'
      mapping='pathname'
      reactionsEnabled='0'
      emitMetadata='0'
      theme={theme as Theme}
    />
  ) : null;
}
