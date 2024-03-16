import { useEffect, useRef, useState } from "react";
import { LoadMoreParam } from "../types/load-more-param";
import { LoadMoreState } from "../types/load-more-state";

export const useLoadMore = (
  onLoadMore: (param: LoadMoreParam) => Promise<LoadMoreParam>,
) => {
  const anchor = useRef<HTMLDivElement>(null);
  const [param, setParam] = useState<LoadMoreParam>({
    state: LoadMoreState.stale,
    page: 0,
  });

  useEffect(() => {
    if (!anchor.current) return
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        setParam(d => {
          if (d.state != LoadMoreState.stale) return d
          const newD = structuredClone(d)
          newD.state = LoadMoreState.loading
          return newD
        })
      }
    });
    observer.observe(anchor.current);
  }, [anchor]);

  useEffect(() => {
    if (param.state == LoadMoreState.loading) {
      (async () => {
        const p = await onLoadMore(structuredClone(param))
        if (p.state == LoadMoreState.loading) p.state = LoadMoreState.stale
        setParam(p)
      })()
    }
  }, [param]);

  return { param, setParam, anchor }
}