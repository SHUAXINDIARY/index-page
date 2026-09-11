/** HTMLInCanvas 实验性 API 当前仅向桌面版 Chrome 提供入口。 */
export const isDesktopChromeBrowser = (): boolean => {
    if (typeof navigator === 'undefined') return false;
  
    const { userAgent } = navigator;
    return (
      /Chrome\/\d+/.test(userAgent) &&
      !/Edg\/|OPR\/|SamsungBrowser\/|YaBrowser\//.test(userAgent) &&
      !/Mobi|Android|iPhone|iPad|iPod/.test(userAgent)
    );
  };
  