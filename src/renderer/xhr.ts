const XMLHttpRequestOverride = (
  provider: typeof XMLHttpRequest,
) =>
  class XMLHttpRequest extends provider {
    constructor() {
      super();
      this.withCredentials = true;
    }
  };

const override = (win: Window) =>
  // @ts-ignore
  win.XMLHttpRequest = XMLHttpRequestOverride(win.XMLHttpRequest);

export default override;
