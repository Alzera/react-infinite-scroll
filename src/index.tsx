import { useEffect, useRef, useState } from "react"
import { InfiniteScrollState } from "./types/infinite-scroll-state"
import type InfiniteScrollController from "./types/infinite-scroll-controller"
import type InfiniteScrollParam from "./types/infinite-scroll-param"
import type Styleable from "./types/styleable"

function InfiniteScroll({
  children,
  loadingView,
  noMoreView,
  emptyView,
  isReverse,
  controller,
  loadMore,
  style,
  className,
}: {
  children: React.ReactNode
  loadingView?: React.ReactNode
  noMoreView?: React.ReactNode
  emptyView?: React.ReactNode
  isReverse?: boolean
  controller?: (controller: InfiniteScrollController | null) => void
  loadMore: (param: InfiniteScrollParam) => InfiniteScrollParam | Promise<InfiniteScrollParam>
} & Styleable) {
  const anchor = useRef<HTMLDivElement>(null);
  const [param, setParam] = useState<InfiniteScrollParam>({
    state: InfiniteScrollState.stale,
    page: 0,
  });

  useEffect(() => {
    controller?.({ resetPage })

    return () => {
      controller?.(null)
    };
  }, []);

  const resetPage = (reload: boolean = false) => {
    setParam({
      state: reload ? InfiniteScrollState.loading : InfiniteScrollState.stale,
      page: 0,
    })
  }

  useEffect(() => {
    if (!anchor.current) return
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        setParam(d => {
          if (d.state != InfiniteScrollState.stale) return d
          const newD = structuredClone(d)
          newD.state = InfiniteScrollState.loading
          return newD
        })
      }
    });
    observer.observe(anchor.current);
  }, [anchor]);

  useEffect(() => {
    if (param.state == InfiniteScrollState.loading) {
      (async () => {
        const p = await loadMore(structuredClone(param))
        if (p.state == InfiniteScrollState.loading) p.state = InfiniteScrollState.stale
        setParam(p)
      })()
    }
  }, [param]);

  const buildIndicator = () => {
    switch (param.state) {
      case InfiniteScrollState.loading:
        return loadingView || <span>Loading...</span>
      case InfiniteScrollState.noMore:
        return noMoreView || <span>No more item!</span>
      case InfiniteScrollState.empty:
        return emptyView || <span>List is empty!</span>
    }
  }

  return (
    <div className={className} style={style}>
      {isReverse ? <>
        <div ref={anchor} />
        {buildIndicator()}
        {children}
      </> : <>
        {children}
        {buildIndicator()}
        <div ref={anchor} />
      </>}
    </div>
  );
}

export { InfiniteScroll as default, InfiniteScrollController, InfiniteScrollParam, InfiniteScrollState }