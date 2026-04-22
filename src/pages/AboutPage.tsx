/**
 * AboutPage - describes the app and how to use it.
 */
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center px-4 py-12 gap-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">About Audify</h2>
      <p className="text-gray-600 text-sm leading-relaxed text-center">
        Audify helps you build playlists faster using your Apple Music account.
        Pick a playlist, swipe through personalized song suggestions, and add
        the ones you like in seconds.
      </p>
      <div className="w-full flex flex-col gap-3 mt-4">
        <div className="px-4 py-4 border border-gray-200 rounded-2xl">
          <h3 className="font-medium mb-1">Personalized suggestions</h3>
          <p className="text-sm text-gray-500">
            Songs are pulled from Apple Music recommendations based on your
            listening history, so what you see is tailored to your taste.
          </p>
        </div>
        <div className="px-4 py-4 border border-gray-200 rounded-2xl">
          <h3 className="font-medium mb-1">Swipe to add</h3>
          <p className="text-sm text-gray-500">
            Swipe right on a song to add it to your playlist. Swipe left to
            skip it. Press Done at any time to save your choices and stop early.
          </p>
        </div>
        <div className="px-4 py-4 border border-gray-200 rounded-2xl">
          <h3 className="font-medium mb-1">Requires Apple Music</h3>
          <p className="text-sm text-gray-500">
            An active Apple Music subscription is needed to access your
            playlists and suggestions. Use the demo on the login screen to try
            the app without an account.
          </p>
        </div>
      </div>
    </div>
  );
}
