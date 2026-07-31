import { createContext, useContext } from 'react';

/** 当前子树是否正在 HTML-in-canvas 模式中渲染。 */
export const HtmlInCanvasContext = createContext(false);

/** 读取当前 HTML-in-canvas 模式状态。 */
export const useHtmlInCanvasMode = () => useContext(HtmlInCanvasContext);
