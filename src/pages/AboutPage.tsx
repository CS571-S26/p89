/**
 * AboutPage - describes the app and how to use it.
 */
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center px-4 py-12 gap-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">About Audify</h2>
      <p className="text-gray-600 text-sm leading-relaxed text-center">
        Audify helps you clean up and build playlists faster. Connect your Apple
        Music library, pick a playlist, and swipe through songs one at a time.
        Swipe right to keep or add a track, swipe left to skip or remove it.
      </p>
      <div className="w-full flex flex-col gap-3 mt-4">
        <div className="px-4 py-4 border border-gray-200 rounded-2xl">
          <h3 className="font-medium mb-1">Add mode</h3>
          <p className="text-sm text-gray-500">
            Browse songs and swipe right to add them to a playlist.
          </p>
        </div>
        <div className="px-4 py-4 border border-gray-200 rounded-2xl">
          <h3 className="font-medium mb-1">Remove mode</h3>
          <p className="text-sm text-gray-500">
            Review songs already in a playlist and swipe left to remove ones you
            no longer want.
          </p>
        </div>
      </div>
    </div>
  );
}
