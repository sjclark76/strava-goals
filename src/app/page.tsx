import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import { getServerCustomSession } from '@/shared/auth';

import ClientSidePage from '@/components/ClientSidePage';

export default async function Home() {
  const session = await getServerCustomSession();
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <>
      <div className="flex justify-between pt-5 pb-2 px-5 border-b">
        <div className="text-orange-500 font-semibold py-2 px-4">
          Strava Goals
        </div>
        <SignOutButton />
      </div>
      <ClientSidePage session={session} />
    </>
  );
}
