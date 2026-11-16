import { readContent } from '../../lib/content';

export const dynamic = 'force-static';
export const metadata = { title: 'Video & Design' };

export default function Page() {
  return <main className="page" id="p-video-design" data-cur="cam" dangerouslySetInnerHTML={{ __html: readContent('video-design') }} />;
}
