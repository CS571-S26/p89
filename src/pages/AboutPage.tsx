import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';

/**
 * AboutPage - describes the app and how to use it.
 */
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center px-4 py-12 gap-6 max-w-md mx-auto">
      <PageHeader
        title="About Audify"
        subtitle={
          <>
            Audify helps you build playlists faster with Apple Music or
            YouTube Music. Pick a playlist, swipe through fresh suggestions,
            and add the ones you like in seconds.
          </>
        }
        centered
      />
      <div className="w-full flex flex-col gap-3 mt-4">
        <SectionCard>
          <h2 className="font-medium mb-1">Personalized suggestions</h2>
          <p className="text-sm text-gray-700">
            Apple Music uses your recommendation feed. YouTube Music uses
            Google sign-in and YouTube playlist APIs to source music videos you
            can add to playlists.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="font-medium mb-1">Swipe to add</h2>
          <p className="text-sm text-gray-700">
            Swipe right on a song to add it to your playlist. Swipe left to skip
            it. Press Done at any time to save your choices and stop early.
          </p>
        </SectionCard>
        <SectionCard>
          <h2 className="font-medium mb-1">Provider requirements</h2>
          <p className="text-sm text-gray-700">
            Apple Music features require an active Apple Music subscription.
            YouTube Music features require Google sign-in with permission to
            manage playlists. Use the demo on the login screen to try the app
            without an account.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
