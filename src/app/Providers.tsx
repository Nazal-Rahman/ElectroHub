"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(17, 17, 17, 0.82)",
            color: "rgba(237, 237, 237, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            backdropFilter: "blur(14px)",
          },
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col flex-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

