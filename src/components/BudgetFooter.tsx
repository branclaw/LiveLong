"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProtocol } from "@/lib/protocol-context";

export function BudgetFooter() {
  const { selectedCompoundIds, totalDailyCost, totalMonthlyCost } = useProtocol();
  const pathname = usePathname();

  const itemCount = selectedCompoundIds.size;
  const hasItems = itemCount > 0;
  const isOnProtocolPage = pathname === "/protocol";

  return (
    <>
      {/* Spacer to prevent content overlap - add this height to page bottom padding */}
      <div className="h-[70px] md:h-[60px]" />

      {/* Sticky Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10"
        style={{ height: "auto" }}
      >
        <div className="container mx-auto px-4 py-3 md:py-4">
          {hasItems ? (
            // Items selected view
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              {/* Left: Item count badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full glass-subtle bg-blue-500/10 text-xs font-medium text-blue-300 border-blue-500/30">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in protocol
                </span>
              </div>

              {/* Middle: Daily cost and primary Monthly cost */}
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <div className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">
                    ${totalDailyCost.toFixed(2)}
                  </span>
                  <span className="ml-1">/day</span>
                </div>

                <div className="text-center md:text-left">
                  <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent transition-all duration-300">
                    ${totalMonthlyCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">/month</div>
                </div>
              </div>

              {/* Right: Context-aware button */}
              <Link
                href={isOnProtocolPage ? "/browse" : "/protocol"}
                className="px-4 py-2 rounded-lg glass-card bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/40 text-blue-300 font-medium text-sm transition-all duration-200 hover:text-blue-200 whitespace-nowrap"
              >
                {isOnProtocolPage ? "Add More Compounds →" : "View Protocol →"}
              </Link>
            </div>
          ) : (
            // No items selected view
            <div className="flex items-center justify-center py-2">
              <p className="text-sm text-slate-400">
                Add compounds to build your protocol
              </p>
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
