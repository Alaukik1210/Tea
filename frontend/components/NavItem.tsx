export default function NavItem({ label }: { label: string }) {
  return (
    <div className="cursor-pointer rounded-full px-4 py-2 hover:bg-white/10">
      {label}
    </div>
  );
}

function Suggestion({ name }: { name: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span>{name}</span>
      <button className="rounded-full bg-white px-3 py-1 text-sm text-black">
        Follow
      </button>
    </div>
  );
}
