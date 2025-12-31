export default function ThreadList() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <article
          key={i}
          className="flex gap-4 border-b border-white/10 p-4"
        >
          <img
            src="/avatar.jpg"
            className="h-10 w-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Alaukik</span>
              <span className="text-white/50">@alaukikkkk · 11h</span>
            </div>

            <p className="mt-1 text-sm text-white/80">
              Finalized UI for login/signup and connected backend. Starting
              fullstack interview revision from tomorrow.
            </p>

            <div className="mt-3 flex justify-between text-white/50">
              <span>💬</span>
              <span>🔁</span>
              <span>❤️</span>
              <span>📤</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
