import { useEffect, useRef, useState } from "react"
import { InfiniteScrollState } from "./types/infinite-scroll-state"
import { usePullToRefresh } from "./utilities/use-pull-to-refresh"
import type InfiniteScrollController from "./types/infinite-scroll-controller"
import type InfiniteScrollParam from "./types/infinite-scroll-param"
import type Styleable from "./types/styleable"

function InfiniteScroll({
  children,
  loadingView,
  noMoreView,
  emptyView,
  isReverse,
  onController,
  onLoadMore,

  refreshView,
  onRefresh,
  pullMaxLength = 100,
  pullThreshold = 100,

  style,
  className,
}: {
  children: React.ReactNode
  loadingView?: React.ReactNode
  noMoreView?: React.ReactNode
  emptyView?: React.ReactNode
  isReverse?: boolean
  onController?: (controller: InfiniteScrollController | null) => void
  onLoadMore: (param: InfiniteScrollParam) => InfiniteScrollParam | Promise<InfiniteScrollParam>

  refreshView?: (isRefreshing: boolean, pullPosition: number) => React.ReactNode
  onRefresh?: () => Promise<void>;
  pullMaxLength?: number;
  pullThreshold?: number;
} & Styleable) {
  const anchor = useRef<HTMLDivElement>(null);
  const [param, setParam] = useState<InfiniteScrollParam>({
    state: InfiniteScrollState.stale,
    page: 0,
  });
  const { isRefreshing, pullPosition } = usePullToRefresh(async () => {
    console.log("Refreshing")
    onRefresh?.()
  }, pullMaxLength, pullThreshold)

  useEffect(() => {
    onController?.({
      resetPage: (reload: boolean = false) => {
        setParam({
          state: reload ? InfiniteScrollState.loading : InfiniteScrollState.stale,
          page: 0,
        })
      }
    })

    return () => {
      onController?.(null)
    };
  }, []);

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
        const p = await onLoadMore(structuredClone(param))
        if (p.state == InfiniteScrollState.loading) p.state = InfiniteScrollState.stale
        setParam(p)
      })()
    }
  }, [param]);

  const indicator = param.state == InfiniteScrollState.loading
    ? loadingView || <span>Loading...</span>
    : (param.state == InfiniteScrollState.noMore
      ? noMoreView || <span>No more item!</span>
      : (param.state == InfiniteScrollState.empty
        ? emptyView || <span>List is empty!</span> : null))

  const refresh = onRefresh
    && (refreshView
      ? refreshView(isRefreshing, pullPosition)
      : <div style={{
        position: "absolute",
        bottom: "100%",
        left: "0",
        right: "0",
        height: "100px",
        padding: "1rem",
        background: "white",
        color: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "transform 250ms ease-in",
        transform: `translateY(${isRefreshing ? 100 : pullPosition}px)`,
      }}>
        Pull to refresh!
      </div>)

  return (
    <div className={className} style={{
      ...style,
      position: "relative",
      overflow: "hidden",
    }}>
      {isReverse ? <>
        <div ref={anchor} />
        {indicator}
        {children}
        {refresh}
      </> : <>
        {refresh}
        {children}
        {indicator}
        <div ref={anchor} />
      </>}
    </div>
  );
}

export { InfiniteScroll as default, InfiniteScrollController, InfiniteScrollParam, InfiniteScrollState }