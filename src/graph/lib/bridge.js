/** Filled by App for vault/show UI without import cycles. */
let showMainUIFn = () => {}
export function initAppBridge(bridge) {
  showMainUIFn = bridge.showMainUI
}
export function showMainUI() {
  showMainUIFn()
}
