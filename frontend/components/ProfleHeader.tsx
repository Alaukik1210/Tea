export default function ProfileHeader() {
  return (
    <div className="relative bg-gradient-to-br from-purple-700 to-black p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/avatar.jpg"
            className="h-20 w-20 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-xl font-bold">Alaukik</h2>
            <p className="text-sm text-white/70">@alaukikkkk</p>
            <p className="text-sm text-white/60">
              Let’s see what difference I can make in a year
            </p>
          </div>
        </div>

        <button className="rounded-full border border-white/30 px-4 py-2">
          Edit profile
        </button>
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-purple-600/30 p-4 text-center">
          <p className="text-2xl font-bold">DIAMOND III</p>
          <p className="text-sm opacity-70">League</p>
        </div>

        <div className="rounded-xl bg-purple-600/30 p-4 text-center">
          <p className="text-xl font-semibold">40 Followers</p>
          <p className="text-xl font-semibold">607 BKC Points</p>
        </div>
      </div>
    </div>
  );
}
