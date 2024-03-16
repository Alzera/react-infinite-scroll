import { useEffect } from "react"
import { usePullToRefresh } from "./utilities/use-pull-to-refresh"
import { useLoadMore } from "./utilities/use-load-more"
import { PullToRefreshState } from "./types/pull-to-refresh-state"
import { LoadMoreState } from "./types/load-more-state"
import type { InfiniteScrollController } from "./types/infinite-scroll-controller"
import type { LoadMoreParam } from "./types/load-more-param"
import type Styleable from "./types/styleable"

function InfiniteScroll({
  children,
  loadingView,
  noMoreView,
  emptyView,
  isReverse,
  onController,
  onLoadMore,

  pullMaxLength = 100,
  pullThreshold = 100,
  refreshView,
  onRefresh,

  style,
  className,
}: {
  children: React.ReactNode
  loadingView?: React.ReactNode
  noMoreView?: React.ReactNode
  emptyView?: React.ReactNode
  isReverse?: boolean
  onController?: (controller: InfiniteScrollController | null) => void
  onLoadMore: (param: LoadMoreParam) => Promise<LoadMoreParam>

  pullMaxLength?: number;
  pullThreshold?: number;
  refreshView?: (state: PullToRefreshState, pullPosition: number) => React.ReactNode
  onRefresh?: () => Promise<void>;
} & Styleable) {
  const { param, setParam, anchor } = useLoadMore<HTMLDivElement>(onLoadMore)
  const { state, pullPosition, element } = usePullToRefresh<HTMLDivElement>(async () => {
    await onRefresh?.()
  }, pullMaxLength, pullThreshold)

  useEffect(() => {
    onController?.({
      resetPage: (reload: boolean = false) => {
        setParam({
          state: reload ? LoadMoreState.loading : LoadMoreState.stale,
          page: 0,
        })
      }
    })

    return () => {
      onController?.(null)
    };
  }, []);

  const indicator = param.state == LoadMoreState.loading
    ? loadingView || <span>Loading...</span>
    : (param.state == LoadMoreState.noMore
      ? noMoreView || <span>No more item!</span>
      : (param.state == LoadMoreState.empty
        ? emptyView || <span>List is empty!</span> : null))

  const refresh = onRefresh
    && (refreshView
      ? refreshView(state, pullPosition)
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
        transform: `translateY(${state ? 100 : pullPosition}px)`,
      }}>
        Pull to refresh!
      </div>)

  return (
    <div ref={element} className={className} style={{
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

export { InfiniteScroll as default, InfiniteScrollController, LoadMoreParam, LoadMoreState, PullToRefreshState }