import { readContent } from '../lib/content';

export const dynamic = 'force-static';


export default function Page() {
  return <main className="page" id="p-home" dangerouslySetInnerHTML={{ __html: readContent('home') }} />;
}
