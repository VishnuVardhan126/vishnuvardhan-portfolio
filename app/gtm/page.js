import { readContent } from '../../lib/content';

export const dynamic = 'force-static';
export const metadata = { title: 'GTM Engineer' };

export default function Page() {
  return <main className="page" id="p-gtm" data-cur="star" dangerouslySetInnerHTML={{ __html: readContent('gtm') }} />;
}
