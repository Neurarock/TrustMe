import { AnimatePresence, motion } from "framer-motion";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6", "#a78bfa"];
const PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 320,
  y: -(120 + Math.random() * 200),
  rotate: Math.random() * 360,
  color: COLORS[i % COLORS.length],
  delay: Math.random() * 0.12,
}));

/** A subtle one-shot confetti burst shown when a payment settles. */
export function Confetti({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center overflow-visible">
          {PIECES.map((p) => (
            <motion.span
              key={p.id}
              className="absolute size-2 rounded-sm"
              style={{ backgroundColor: p.color }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
