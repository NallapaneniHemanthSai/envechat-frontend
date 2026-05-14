export default function Loader({ label = 'Loading EnveChat' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#070b12] text-slate-200">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        </div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
      </div>
    </div>
  )
}
